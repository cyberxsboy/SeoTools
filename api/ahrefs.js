const axios = require('axios'); // 在Worker中，axios通常通过import获取

// 更改为接受env对象
async function getAhrefsRankings(domain, keyword, ahrefsApiKey) {
    const AHREFS_API_KEY = ahrefsApiKey; // 直接使用传入的key

    if (!AHREFS_API_KEY) {
        console.warn('Ahrefs API Key is not provided, returning simulated data.');
        return [{
            keyword: keyword,
            searchEngine: 'Google (Ahrefs)',
            rank: Math.floor(Math.random() * 50) + 1,
            url: `http://${domain}`
        }];
    }

    try {
        // *** 在这里集成真实的Ahrefs API调用逻辑 ***
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
                limit: 10, 
            }
        });

        const realRankings = ahrefsResponse.data.keywords.map(item => ({
            keyword: item.keyword,
            searchEngine: 'Google (Ahrefs)',
            rank: item.position,
            url: item.url
        }));
        return realRankings;
        */

        return [{
            keyword: keyword,
            searchEngine: 'Google (Ahrefs)',
            rank: Math.floor(Math.random() * 50) + 1,
            url: `http://${domain}`
        }];

    } catch (error) {
        console.error('Error calling Ahrefs API:', error.message);
        return [{
            keyword: keyword,
            searchEngine: 'Google (Ahrefs)',
            rank: 'Error',
            url: `http://${domain}`,
            error: error.message
        }];
    }
}

export { getAhrefsRankings }; // 更改为ES Modules导出
