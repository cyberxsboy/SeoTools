const axios = require('axios');

const SEMRUSH_API_KEY = process.env.SEMRUSH_API_KEY;

async function getSemrushRankings(domain, keyword) {
    if (!SEMRUSH_API_KEY) {
        console.warn('SEMrush API Key is not configured, returning simulated data.');
        return [{
            keyword: keyword,
            searchEngine: 'Google (SEMrush)',
            rank: Math.floor(Math.random() * 50) + 1,
            url: `http://${domain}`
        }];
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
        return realRankings;
        */

        // 暂时保留模拟数据，直到真实API集成
        return [{
            keyword: keyword,
            searchEngine: 'Google (SEMrush)',
            rank: Math.floor(Math.random() * 50) + 1,
            url: `http://${domain}`
        }];

    } catch (error) {
        console.error('Error calling SEMrush API:', error.message);
        return [{
            keyword: keyword,
            searchEngine: 'Google (SEMrush)',
            rank: 'Error',
            url: `http://${domain}`,
            error: error.message
        }];
    }
}

module.exports = { getSemrushRankings };
