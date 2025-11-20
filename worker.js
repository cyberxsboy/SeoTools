import { getAhrefsRankings } from './api/ahrefs';
import { getSemrushRankings } from './api/semrush';
import { getMozMetrics } from './api/moz';

const assetManifest = {
  "/": "index.html",
  "/index.html": "index.html",
  "/app.js": "app.js",
  "/style.css": "style.css"
};

export default {
  async fetch(request, env, ctx) {
    console.log('--- Incoming Request Debug ---');
    console.log('Request method:', request.method);
    console.log('Request URL:', request.url);
    try {
      const parsedUrl = new URL(request.url);
      console.log('Parsed URL pathname:', parsedUrl.pathname);
      console.log('Parsed URL origin:', parsedUrl.origin);
    } catch (e) {
      console.error('Error parsing request URL:', e);
    }
    console.log('--- Incoming Request Debug --- End');

    const url = new URL(request.url);
    console.log(`Incoming request for: ${url.pathname}`);

    // Try to serve static assets directly from KV
    if (!url.pathname.startsWith('/api/')) {
      const assetPath = assetManifest[url.pathname] || assetManifest['/'];
      if (assetPath) {
        const content = await env.__STATIC_CONTENT.get(`public/${assetPath}`);
        if (content) {
          const headers = new Headers();
          if (assetPath.endsWith('.html')) {
            headers.set('Content-Type', 'text/html');
          } else if (assetPath.endsWith('.js')) {
            headers.set('Content-Type', 'application/javascript');
          } else if (assetPath.endsWith('.css')) {
            headers.set('Content-Type', 'text/css');
          }
          return new Response(content, { headers });
        }
      }
    }

    if (url.pathname === '/fetch-website-content') {
      console.log('Handling /fetch-website-content API call.');
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      const { url: targetUrl } = await request.json();
      if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      try {
        const response = await fetch(targetUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch content from ${targetUrl}: ${response.statusText}`);
        }
        const content = await response.text();
        return new Response(JSON.stringify({ content }), { headers: { 'Content-Type': 'application/json' } });
      } catch (error) {
        console.error(`Error fetching content from ${targetUrl}:`, error.message);
        return new Response(JSON.stringify({ error: 'Failed to fetch website content' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/track-ranking') {
      console.log('Handling /track-ranking API call.');
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      const { domain, keywords, ahrefsApiKey, semrushApiKey } = await request.json();

      if (!domain || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return new Response(JSON.stringify({ error: 'Domain and keywords are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const allRankings = [];

      for (const keyword of keywords) {
        try {
          const ahrefsRankings = await getAhrefsRankings(domain, keyword, ahrefsApiKey);
          allRankings.push(...ahrefsRankings);
        } catch (error) {
          console.warn(`Failed to get ranking for keyword ${keyword} from Ahrefs:`, error.message);
        }

        try {
          const semrushRankings = await getSemrushRankings(domain, keyword, semrushApiKey);
          allRankings.push(...semrushRankings);
        } catch (error) {
          console.warn(`Failed to get ranking for keyword ${keyword} from SEMRUSH:`, error.message);
        }
      }

      return new Response(JSON.stringify({ rankings: allRankings }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/moz-metrics') {
      console.log('Handling /moz-metrics API call.');
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      const { domain, mozAccessId, mozSecretKey } = await request.json();

      if (!domain) {
        return new Response(JSON.stringify({ error: 'Domain is required for Moz' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      try {
        const mozMetrics = await getMozMetrics(domain, mozAccessId, mozSecretKey);
        return new Response(JSON.stringify({ metrics: mozMetrics }), { headers: { 'Content-Type': 'application/json' } });
      } catch (error) {
        console.error('Error calling Moz API:', error.message);
        return new Response(JSON.stringify({ error: 'Failed to fetch metrics from Moz' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    console.log(`Path not found: ${url.pathname}`);
    return new Response('Not Found', { status: 404 });
  },
};
