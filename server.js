const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto'); // Added for Moz API

const app = express();
const port = 3000;

// API Keys (在实际生产环境中，请使用环境变量或其他安全方式管理)
const AHREFS_API_KEY = process.env.AHREFS_API_KEY || 'YOUR_AHREFS_API_KEY';
const SEMRUSH_API_KEY = process.env.SEMRUSH_API_KEY || 'YOUR_SEMRUSH_API_KEY';
const MOZ_ACCESS_ID = process.env.MOZ_ACCESS_ID || 'YOUR_MOZ_ACCESS_ID';
const MOZ_SECRET_KEY = process.env.MOZ_SECRET_KEY || 'YOUR_MOZ_SECRET_KEY';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('SEO Spider Pool Proxy Server');
});

// 网站内容抓取代理接口
app.post('/fetch-website-content', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const response = await axios.get(url);
        res.json({ content: response.data });
    } catch (error) {
        console.error(`Error fetching content from ${url}:`, error.message);
        res.status(500).json({ error: 'Failed to fetch website content' });
    }
});

// Ahrefs API 代理接口 (示例: 获取关键词排名)
app.post('/ahrefs-rankings', async (req, res) => {
    const { domain, keyword } = req.body;

    if (!domain || !keyword) {
        return res.status(400).json({ error: 'Domain and keyword are required for Ahrefs' });
    }

    if (AHREFS_API_KEY === 'YOUR_AHREFS_API_KEY') {
        return res.status(500).json({ error: 'Ahrefs API Key is not configured.' });
    }

    try {
        // *** 在这里集成真实的Ahrefs API调用逻辑 ***
        // 请访问Ahrefs API文档获取正确的API端点和参数：
        // 例如：https://ahrefs.com/api/v2

        // 假设使用 Ahrefs Site Explorer -> Organic Keywords API
        // 实际API端点和参数会根据您的具体需求和Ahrefs版本有所不同
        /*
        const ahrefsApiUrl = `https://api.ahrefs.com/v2/site-explorer/organic-keywords`;
        const ahrefsResponse = await axios.get(ahrefsApiUrl, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${AHREFS_API_KEY}`
            },
            params: {
                target: domain,
                output: 'json',
                limit: 10, // 获取前10个关键词
                // keyword: keyword // 如果Ahrefs API支持按关键词筛选
            }
        });

        // 处理Ahrefs API的响应数据，提取排名信息
        const realRankings = ahrefsResponse.data.keywords.map(item => ({
            keyword: item.keyword,
            searchEngine: 'Google (Ahrefs)',
            rank: item.position,
            url: item.url
        }));
        res.json({ rankings: realRankings });
        */

        // 暂时保留模拟数据，直到真实API集成
        const simulatedAhrefsRanking = {
            keyword: keyword,
            searchEngine: 'Google (Ahrefs)',
            rank: Math.floor(Math.random() * 50) + 1,
            url: `http://${domain}`
        };
        res.json({ rankings: [simulatedAhrefsRanking] });

    } catch (error) {
        console.error('Error calling Ahrefs API:', error.message);
        res.status(500).json({ error: 'Failed to fetch rankings from Ahrefs' });
    }
});

// SEMrush API 代理接口 (示例: 获取关键词排名)
app.post('/semrush-rankings', async (req, res) => {
    const { domain, keyword } = req.body;

    if (!domain || !keyword) {
        return res.status(400).json({ error: 'Domain and keyword are required for SEMrush' });
    }

    if (SEMRUSH_API_KEY === 'YOUR_SEMRUSH_API_KEY') {
        return res.status(500).json({ error: 'SEMrush API Key is not configured.' });
    }

    try {
        // *** 在这里集成真实的SEMrush API调用逻辑 ***
        // 请访问SEMrush API文档获取正确的API端点和参数：
        // 例如：https://developer.semrush.com/api/v3/

        // 假设使用 SEMrush Keyword Magic Tool API 或 Organic Research API
        // 实际API端点和参数会根据您的具体需求和SEMrush版本有所不同
        /*
        const semrushApiUrl = `https://api.semrush.com/analytics/v1/sitedomain/organic`;
        const semrushResponse = await axios.get(semrushApiUrl, {
            params: {
                key: SEMRUSH_API_KEY,
                domain: domain,
                export_columns: 'Ph,Po,Ur', // Keyword, Position, URL
                phrase: keyword, // 如果API支持按关键词筛选
                display_limit: 10
            }
        });

        // 处理SEMrush API的响应数据，提取排名信息
        const realRankings = semrushResponse.data.split('\n').slice(1).map(line => {
            const [phrase, position, url] = line.split(';');
            return {
                keyword: phrase,
                searchEngine: 'Google (SEMrush)',
                rank: parseInt(position),
                url: url
            };
        });
        res.json({ rankings: realRankings });
        */

        // 暂时保留模拟数据，直到真实API集成
        const simulatedSemrushRanking = {
            keyword: keyword,
            searchEngine: 'Google (SEMrush)',
            rank: Math.floor(Math.random() * 50) + 1,
            url: `http://${domain}`
        };
        res.json({ rankings: [simulatedSemrushRanking] });

    } catch (error) {
        console.error('Error calling SEMrush API:', error.message);
        res.status(500).json({ error: 'Failed to fetch rankings from SEMrush' });
    }
});

// Moz API 代理接口 (示例: 获取域名权威度)
app.post('/moz-metrics', async (req, res) => {
    const { domain } = req.body;

    if (!domain) {
        return res.status(400).json({ error: 'Domain is required for Moz' });
    }

    if (MOZ_ACCESS_ID === 'YOUR_MOZ_ACCESS_ID' || MOZ_SECRET_KEY === 'YOUR_MOZ_SECRET_KEY') {
        return res.status(500).json({ error: 'Moz API credentials are not configured.' });
    }

    try {
        // *** 在这里集成真实的Moz API调用逻辑 ***
        // Moz API通常需要签名请求，这比简单的Bearer Token更复杂
        // 参考：https://moz.com/help/moz-api/getting-started/how-to-authenticate

        // 示例：获取URL Metrics (Domain Authority, Page Authority等)
        /*
        const expires = Math.floor(Date.now() / 1000) + 300; // 5分钟后过期
        const stringToSign = `${MOZ_ACCESS_ID}\n${expires}`; // 注意：实际可能需要更复杂的字符串
        const hmac = crypto.createHmac('sha1', MOZ_SECRET_KEY);
        hmac.update(stringToSign);
        const signature = hmac.digest('base64');

        const mozApiUrl = `http://lsapi.seomoz.com/linkscape/url-metrics/${encodeURIComponent(domain)}?Cols=103079215104&AccessID=${MOZ_ACCESS_ID}&Expires=${expires}&Signature=${encodeURIComponent(signature)}`;

        const mozResponse = await axios.get(mozApiUrl);

        // 处理Moz API的响应数据
        const realMozMetrics = {
            domainAuthority: mozResponse.data.da,
            pageAuthority: mozResponse.data.pa,
            // ... 其他指标
        };
        res.json({ metrics: realMozMetrics });
        */

        // 暂时保留模拟数据，直到真实API集成
        const simulatedMozMetrics = {
            domainAuthority: Math.floor(Math.random() * 100) + 1,
            pageAuthority: Math.floor(Math.random() * 100) + 1,
        };
        res.json({ metrics: simulatedMozMetrics });

    } catch (error) {
        console.error('Error calling Moz API:', error.message);
        res.status(500).json({ error: 'Failed to fetch metrics from Moz' });
    }
});

// 排名追踪代理接口 (更新为调用Ahrefs和SEMrush)
app.post('/track-ranking', async (req, res) => {
    const { domain, keywords } = req.body;
    if (!domain || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ error: 'Domain and keywords are required' });
    }

    const allRankings = [];

    for (const keyword of keywords) {
        // 调用Ahrefs API
        try {
            const ahrefsRes = await axios.post(`http://localhost:${port}/ahrefs-rankings`, { domain, keyword });
            allRankings.push(...ahrefsRes.data.rankings);
        } catch (error) {
            console.warn(`Failed to get ranking for keyword ${keyword} from Ahrefs:`, error.message);
        }

        // 调用SEMrush API
        try {
            const semrushRes = await axios.post(`http://localhost:${port}/semrush-rankings`, { domain, keyword });
            allRankings.push(...semrushRes.data.rankings);
        } catch (error) {
            console.warn(`Failed to get ranking for keyword ${keyword} from SEMrush:`, error.message);
        }
    }
    
    res.json({ rankings: allRankings });
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});
