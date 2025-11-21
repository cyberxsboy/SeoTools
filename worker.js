import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
import { getAhrefsRankings } from './api/ahrefs';
import { getSemrushRankings } from './api/semrush';
import { getMozMetrics } from './api/moz';

const assetManifest = JSON.parse(manifestJSON);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/fetch-website-content') {
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

    try {
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
        }
      );
    } catch (e) {
      return new Response('Not Found', { status: 404 });
    }
  },
};
