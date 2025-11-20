import { getAhrefsRankings } from './api/ahrefs';
import { getSemrushRankings } from './api/semrush';
import { getMozMetrics } from './api/moz';
// import { getAssetFromKV } from '@cloudflare/kv-asset-handler'; // 暂时不使用getAssetFromKV

export default {
  async fetch(request, env, ctx) {
    // --- 调试日志：检查请求对象 --- Start
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
    // --- 调试日志：检查请求对象 --- End

    const url = new URL(request.url);
    console.log(`Incoming request for: ${url.pathname}`); 

    // 静态文件服务
    if (url.pathname === '/' || url.pathname.endsWith('.html') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
      console.log('Attempting to serve static asset directly from KV.'); 
      // 修正filePath的构建方式，包含'public/'前缀
      const filePath = url.pathname === '/' ? 'public/index.html' : `public${url.pathname}`;
      console.log(`Resolved KV file path for direct access: ${filePath}`);

      try {
        const asset = await env.ASSETS.get(filePath); // 直接从KV中获取文件内容
        if (asset === null) {
          console.error(`Asset not found in KV for path: ${filePath}`);
          return new Response('Asset not found', { status: 404 });
        }

        let contentType = 'text/plain';
        if (filePath.endsWith('.html')) {
          contentType = 'text/html';
        } else if (filePath.endsWith('.css')) {
          contentType = 'text/css';
        } else if (filePath.endsWith('.js')) {
          contentType = 'application/javascript';
        }

        return new Response(asset, {
          headers: {
            'Content-Type': contentType,
          },
        });
      } catch (e) {
        console.error(`Error serving static asset ${url.pathname} directly from KV:`, e); 
        console.error('Full error object:', JSON.stringify(e, Object.getOwnPropertyNames(e))); 
        return new Response(`Error serving static asset: ${e.message || 'Unknown error'}`, { status: 500 });
      }
    }

    // 后端代理API处理
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
