import { getAhrefsRankings } from './api/ahrefs';
import { getSemrushRankings } from './api/semrush';
import { getMozMetrics } from './api/moz';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    console.log(`Incoming request for: ${url.pathname}`); // 调试日志

    // 静态文件服务
    if (url.pathname === '/' || url.pathname.endsWith('.html') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
      console.log('Attempting to serve static asset.'); // 调试日志
      const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
      console.log(`Serving file path: ${filePath}`); // 调试日志

      try {
        // 创建一个新的Request对象，确保路径正确，并且可以由env.ASSETS.fetch处理
        const assetRequest = new Request(new URL(filePath, request.url).toString(), request);
        const response = await env.ASSETS.fetch(assetRequest);
        console.log(`Asset fetch response status: ${response.status}`); // 调试日志
        return response;
      } catch (e) {
        console.error(`Error serving static asset ${filePath}:`, e); // 错误日志
        return new Response(`Error serving static asset: ${e.message}`, { status: 500 });
      }
    }

    // 后端代理API处理
    if (url.pathname === '/fetch-website-content') {
      console.log('Handling /fetch-website-content API call.'); // 调试日志
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
      console.log('Handling /track-ranking API call.'); // 调试日志
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
          console.warn(`Failed to get ranking for keyword ${keyword} from SEMrush:`, error.message);
        }
      }

      return new Response(JSON.stringify({ rankings: allRankings }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/moz-metrics') {
      console.log('Handling /moz-metrics API call.'); // 调试日志
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

    console.log(`Path not found: ${url.pathname}`); // 调试日志
    return new Response('Not Found', { status: 404 });
  },
};
