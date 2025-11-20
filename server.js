const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { getAhrefsRankings } = require('./api/ahrefs');
const { getSemrushRankings } = require('./api/semrush');
const { getMozMetrics } = require('./api/moz');

const app = express();
const port = 3000;

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

// 排名追踪代理接口
app.post('/track-ranking', async (req, res) => {
    const { domain, keywords, ahrefsApiKey, semrushApiKey } = req.body;
    if (!domain || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ error: 'Domain and keywords are required' });
    }

    const allRankings = [];

    for (const keyword of keywords) {
        // 调用Ahrefs API
        try {
            const ahrefsRankings = await getAhrefsRankings(domain, keyword, ahrefsApiKey);
            allRankings.push(...ahrefsRankings);
        } catch (error) {
            console.warn(`Failed to get ranking for keyword ${keyword} from Ahrefs:`, error.message);
        }

        // 调用SEMrush API
        try {
            const semrushRankings = await getSemrushRankings(domain, keyword, semrushApiKey);
            allRankings.push(...semrushRankings);
        } catch (error) {
            console.warn(`Failed to get ranking for keyword ${keyword} from SEMrush:`, error.message);
        }
    }
    
    res.json({ rankings: allRankings });
});

// Moz Metrics 代理接口
app.post('/moz-metrics', async (req, res) => {
    const { domain, mozAccessId, mozSecretKey } = req.body;

    if (!domain) {
        return res.status(400).json({ error: 'Domain is required for Moz' });
    }

    try {
        const mozMetrics = await getMozMetrics(domain, mozAccessId, mozSecretKey);
        res.json({ metrics: mozMetrics });
    } catch (error) {
        console.error('Error calling Moz API:', error.message);
        res.status(500).json({ error: 'Failed to fetch metrics from Moz' });
    }
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});
