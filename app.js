document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('main section');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = event.target.getAttribute('href').substring(1);

            sections.forEach(section => {
                section.classList.remove('active');
            });

            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // 域名管理逻辑
    const domainNameInput = document.getElementById('domain-name-input');
    const addDomainBtn = document.getElementById('add-domain-btn');
    const domainList = document.getElementById('domain-list');

    let domains = JSON.parse(localStorage.getItem('domains')) || [];

    const renderDomains = () => {
        domainList.innerHTML = '';
        domains.forEach((domain, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${domain}</span>
                <div class="actions">
                    <button class="edit-btn" data-index="${index}">编辑</button>
                    <button class="delete-btn" data-index="${index}">删除</button>
                </div>
            `;
            domainList.appendChild(li);
        });
    };

    const addDomain = () => {
        const domain = domainNameInput.value.trim();
        if (domain && !domains.includes(domain)) {
            domains.push(domain);
            localStorage.setItem('domains', JSON.stringify(domains));
            domainNameInput.value = '';
            renderDomains();
        } else if (domains.includes(domain)) {
            alert('该域名已存在！');
        } else {
            alert('域名不能为空！');
        }
    };

    const editDomain = (index) => {
        const newDomain = prompt('编辑域名:', domains[index]);
        if (newDomain !== null && newDomain.trim() !== '' && !domains.includes(newDomain.trim())) {
            domains[index] = newDomain.trim();
            localStorage.setItem('domains', JSON.stringify(domains));
            renderDomains();
        } else if (newDomain !== null && newDomain.trim() === '') {
            alert('域名不能为空！');
        } else if (newDomain !== null && domains.includes(newDomain.trim())) {
            alert('该域名已存在！');
        }
    };

    const deleteDomain = (index) => {
        if (confirm(`确定要删除域名 ${domains[index]} 吗？`)) {
            domains.splice(index, 1);
            localStorage.setItem('domains', JSON.stringify(domains));
            renderDomains();
        }
    };

    addDomainBtn.addEventListener('click', addDomain);

    domainList.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const index = event.target.dataset.index;
            editDomain(index);
        } else if (event.target.classList.contains('delete-btn')) {
            const index = event.target.dataset.index;
            deleteDomain(index);
        }
    });

    renderDomains(); // 页面加载时渲染已有域名

    // 网站分析逻辑
    const analysisDomainSelect = document.getElementById('analysis-domain-select');
    const startAnalysisBtn = document.getElementById('start-analysis-btn');
    const analysisOutput = document.getElementById('analysis-output');

    const populateAnalysisDomains = () => {
        analysisDomainSelect.innerHTML = '<option value="">请选择一个域名</option>';
        domains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain;
            option.textContent = domain;
            analysisDomainSelect.appendChild(option);
        });
    };

    const analyzeWebsite = async () => {
        const selectedDomain = analysisDomainSelect.value;
        if (!selectedDomain) {
            alert('请选择一个要分析的域名！');
            return;
        }

        analysisOutput.textContent = '正在分析，请稍候...';

        try {
            const proxyUrl = `http://localhost:3000/fetch-website-content`;
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `http://${selectedDomain}` }), // 注意：这里简单地使用http，实际可能需要https
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.content, 'text/html');

            // 提取信息示例
            const title = doc.querySelector('title')?.textContent || 'N/A';
            const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'N/A';
            const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || 'N/A';
            const links = Array.from(doc.querySelectorAll('a')).map(a => a.href);
            const images = Array.from(doc.querySelectorAll('img'));
            const h1Tags = Array.from(doc.querySelectorAll('h1'));

            let analysisText = `网站标题: ${title}\n`;
            analysisText += `Meta Description: ${description}\n`;
            analysisText += `Meta Keywords: ${keywords}\n`;
            analysisText += `内部链接数量: ${links.filter(link => link.includes(selectedDomain)).length}\n`;
            analysisText += `外部链接数量: ${links.filter(link => !link.includes(selectedDomain) && link.startsWith('http')).length}\n\n`;

            analysisText += `--- 违规分析与建议 ---\n`;

            // 1. 标题长度检查
            if (title.length < 10 || title.length > 70) {
                analysisText += `[警告] 网站标题长度建议在10-70个字符之间，当前长度为 ${title.length}。\n`;
            }

            // 2. Meta Description 长度检查
            if (description === 'N/A' || description.length < 50 || description.length > 160) {
                analysisText += `[警告] Meta Description 长度建议在50-160个字符之间，当前长度为 ${description.length} 或缺失。\n`;
            }

            // 3. 多个H1标签检查
            if (h1Tags.length > 1) {
                analysisText += `[警告] 页面存在多个H1标签 (${h1Tags.length}个)，建议每个页面只使用一个H1标签。\n`;
            } else if (h1Tags.length === 0) {
                analysisText += `[警告] 页面缺少H1标签，建议添加一个描述页面主题的H1标签。\n`;
            }

            // 4. 图片Alt属性检查
            images.forEach(img => {
                if (!img.alt || img.alt.trim() === '') {
                    analysisText += `[警告] 图片缺少Alt属性或Alt属性为空: ${img.src}\n`;
                }
            });

            // 5. 内容重复度（简易判断，需要更复杂的算法实现）
            const bodyText = doc.body.textContent.replace(/\s+/g, ' ').trim();
            if (bodyText.length < 200) { // 简单判断内容过少
                analysisText += `[警告] 页面内容可能过少，不利于搜索引擎抓取。\n`;
            }
            // 更复杂的重复内容检测需要比对多个页面的内容，这在纯客户端实现较困难

            // 6. 链接可抓取性（这里仅是提示，实际判断需要更多复杂逻辑）
            if (links.length === 0) {
                analysisText += `[警告] 页面没有发现任何链接，可能影响蜘蛛爬行。\n`;
            }

            // Moz 域名权威度/页面权威度 (通过后端代理获取)
            analysisText += `\n--- 权威度指标 (Moz) ---\n`;
            try {
                const mozProxyUrl = `http://localhost:3000/moz-metrics`;
                const mozResponse = await fetch(mozProxyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ domain: selectedDomain }),
                });

                if (!mozResponse.ok) {
                    throw new Error(`HTTP error! status: ${mozResponse.status}`);
                }

                const mozData = await mozResponse.json();
                if (mozData.metrics) {
                    analysisText += `域名权威度 (DA): ${mozData.metrics.domainAuthority || 'N/A'}\n`;
                    analysisText += `页面权威度 (PA): ${mozData.metrics.pageAuthority || 'N/A'}\n`;
                } else {
                    analysisText += `未能获取Moz权威度数据。\n`;
                }
            } catch (error) {
                console.error('获取Moz权威度失败:', error);
                analysisText += `获取Moz权威度失败: ${error.message}\n`;
            }

            analysisOutput.textContent = analysisText;

        } catch (error) {
            console.error('网站分析失败:', error);
            analysisOutput.textContent = `网站分析失败: ${error.message}`;
        }
    };

    startAnalysisBtn.addEventListener('click', analyzeWebsite);

    // 每次切换到网站分析Tab时更新域名列表
    document.querySelector('a[href="#analysis"]').addEventListener('click', populateAnalysisDomains);

    // 排名追踪逻辑
    const rankTrackingDomainSelect = document.getElementById('rank-tracking-domain-select');
    const keywordInput = document.getElementById('keyword-input');
    const trackRankingBtn = document.getElementById('track-ranking-btn');
    const rankOutput = document.getElementById('rank-output');

    const populateRankTrackingDomains = () => {
        rankTrackingDomainSelect.innerHTML = '<option value="">请选择一个域名</option>';
        domains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain;
            option.textContent = domain;
            rankTrackingDomainSelect.appendChild(option);
        });
    };

    const trackKeywordRanking = async () => {
        const selectedDomain = rankTrackingDomainSelect.value;
        const keywords = keywordInput.value.trim();

        if (!selectedDomain || !keywords) {
            alert('请选择一个域名并输入关键词！');
            return;
        }

        rankOutput.textContent = '正在查询排名，请稍候...';

        try {
            const proxyUrl = `http://localhost:3000/track-ranking`;
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ domain: selectedDomain, keywords: keywords.split(',').map(k => k.trim()) }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            let rankText = `域名: ${selectedDomain}\n`;
            rankText += `关键词排名:\n`;
            if (result.rankings && result.rankings.length > 0) {
                result.rankings.forEach(item => {
                    rankText += ` - 关键词: ${item.keyword}, 搜索引擎: ${item.searchEngine}, 排名: ${item.rank} (URL: ${item.url || 'N/A'})\n`;
                });
            } else {
                rankText += `  未查询到排名数据。`;
            }

            rankOutput.textContent = rankText;

        } catch (error) {
            console.error('排名查询失败:', error);
            rankOutput.textContent = `排名查询失败: ${error.message}`; 
        }
    };

    trackRankingBtn.addEventListener('click', trackKeywordRanking);

    document.querySelector('a[href="#rank-tracking"]').addEventListener('click', populateRankTrackingDomains);

    // 设置逻辑
    const googleApiKeyInput = document.getElementById('google-api-key');
    const otherSeoApiKeyInput = document.getElementById('other-seo-api-key'); // 更名为 Ahrefs/SEMrush Key
    const aiCrawlerNameInput = document.getElementById('ai-crawler-name');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const settingsStatus = document.getElementById('settings-status');

    const loadSettings = () => {
        const settings = JSON.parse(localStorage.getItem('seoSettings')) || {};
        googleApiKeyInput.value = settings.googleApiKey || '';
        otherSeoApiKeyInput.value = settings.ahrefsApiKey || ''; // 对应新的key
        aiCrawlerNameInput.value = settings.aiCrawlerName || '';
    };

    const saveSettings = () => {
        const settings = {
            googleApiKey: googleApiKeyInput.value.trim(),
            ahrefsApiKey: otherSeoApiKeyInput.value.trim(), // 对应新的key
            aiCrawlerName: aiCrawlerNameInput.value.trim(),
        };
        localStorage.setItem('seoSettings', JSON.stringify(settings));
        settingsStatus.textContent = '设置已保存！';
        setTimeout(() => settingsStatus.textContent = '', 3000);
    };

    saveSettingsBtn.addEventListener('click', saveSettings);

    // 页面加载时加载设置
    loadSettings();
});
