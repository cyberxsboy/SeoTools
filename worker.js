import { getAhrefsRankings } from './api/ahrefs';
import { getSemrushRankings } from './api/semrush';
import { getMozMetrics } from './api/moz';

function getMimeType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html';
  if (filePath.endsWith('.css')) return 'text/css';
  if (filePath.endsWith('.js')) return 'application/javascript';
  if (filePath.endsWith('.json')) return 'application/json';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.gif')) return 'image/gif';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream'; // Default
}

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

    // Logic to serve static assets directly from KV
    let filePath = url.pathname;
    if (filePath.startsWith('/')) {
      filePath = filePath.substring(1); // Remove leading slash
    }

    // If the path is empty or refers to root, serve index.html
    if (filePath === '' || filePath === 'index.html') {
      filePath = 'public/index.html';
    } else if (!filePath.startsWith('public/')) {
      // Prefix other static assets with 'public/' if not already prefixed
      filePath = 'public/' + filePath;
    }

    // Check if it's a request for a known static asset type
    const isStaticAsset = filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js') ||
                          filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') ||
                          filePath.endsWith('.gif') || filePath.endsWith('.svg') || filePath.endsWith('.ico') ||
                          filePath.endsWith('.json'); // Added common static file types

    if (isStaticAsset) {
      console.log(`Attempting to serve static asset directly from KV: ${filePath}`);
      try {
        const asset = await env.__STATIC_CONTENT.get(filePath, { type: "arrayBuffer" });
        if (asset === null) {
          console.error(`Asset not found in KV for path: ${filePath}`);
          return new Response('Asset not found', { status: 404 });
        }

        const mimeType = getMimeType(filePath);
        return new Response(asset, {
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=3600', // Cache static assets for 1 hour
          },
        });
      } catch (e) {
        console.error(`Error serving static asset ${filePath} directly from KV:`, e);
        return new Response(`Error serving static asset: ${e.message || 'Unknown error'}`, { status: 500 });
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
