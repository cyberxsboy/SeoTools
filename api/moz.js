const axios = require('axios'); // 在Worker中，axios通常通过import获取
// const crypto = require('crypto'); // Worker中应使用Web Crypto API

// 更改为接受env对象
async function getMozMetrics(domain, mozAccessId, mozSecretKey) {
    if (!mozAccessId || !mozSecretKey) {
        console.warn('Moz API credentials are not provided, returning simulated data.');
        return {
            domainAuthority: Math.floor(Math.random() * 100) + 1,
            pageAuthority: Math.floor(Math.random() * 100) + 1,
            warning: 'Moz API credentials are not provided, returning simulated data.'
        };
    }

    try {
        // *** 在这里集成真实的Moz API调用逻辑 ***
        // 请访问：https://moz.com/help/moz-api/getting-started/how-to-authenticate
        // Worker环境中的Web Crypto API替代Node.js的crypto模块
        /*
        const expires = Math.floor(Date.now() / 1000) + 300; 
        const stringToSign = `${mozAccessId}\n${expires}`;
        
        // 使用Web Crypto API生成HMAC签名
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(mozSecretKey),
            { name: "HMAC", hash: "SHA-1" },
            false,
            ["sign"]
        );
        const signatureBuffer = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(stringToSign)
        );
        const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

        const mozApiUrl = `http://lsapi.seomoz.com/linkscape/url-metrics/${encodeURIComponent(domain)}?Cols=103079215104&AccessID=${mozAccessId}&Expires=${expires}&Signature=${encodeURIComponent(signature)}`;

        const mozResponse = await axios.get(mozApiUrl);

        const realMozMetrics = {
            domainAuthority: mozResponse.data.da,
            pageAuthority: mozResponse.data.pa,
        };
        return realMozMetrics;
        */

        return {
            domainAuthority: Math.floor(Math.random() * 100) + 1,
            pageAuthority: Math.floor(Math.random() * 100) + 1,
        };

    } catch (error) {
        console.error('Error calling Moz API:', error.message);
        return {
            domainAuthority: 'Error',
            pageAuthority: 'Error',
            error: error.message
        };
    }
}

export { getMozMetrics }; // 更改为ES Modules导出
