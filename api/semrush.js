const axios = require('axios'); // 在Worker中，axios通常通过import获取

// 更改为接受env对象
async function getSemrushRankings(domain, keyword, semrushApiKey) {
    const SEMRUSH_API_KEY = semrushApiKey; // 直接使用传入的key

    if (!SEMRUSH_API_KEY) {
        console.warn('SEMrush API Key is not provided, returning simulated data.');
        return [{
            keyword: keyword,
            searchEngine: 'Google (SEMrush)',
            rank: Math.floor(Math.random() * 50) + 1,
            url: `http://${domain}`
        }];
    }

    try {
        // *** 在这里集成真实的SEMrush API调用逻辑 ***
        /*
        const semrushApiUrl = `https://api.semrush.com/analytics/v1/sitedomain/organic`;
        const semrushResponse = await axios.get(semrushApiUrl, {
            params: {
                key: SEMRUSH_API_KEY, 
                domain: domain,
                export_columns: 'Ph,Po,Ur', 
                phrase: keyword, 
                display_limit: 10
            }
        });

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

export { getSemrushRankings }; // 更改为ES Modules导出
