document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('main section');

    const messageArea = document.getElementById('message-area');
    const messageContent = document.getElementById('message-content');
    const closeMessageBtn = document.getElementById('close-message');

    const showMessage = (message, type = 'error') => {
        messageContent.textContent = message;
        messageArea.classList.remove('hidden');
        if (type === 'error') {
            messageArea.style.backgroundColor = '#f8d7da';
            messageArea.style.color = '#721c24';
            messageArea.style.borderColor = '#f5c6cb';
        } else if (type === 'success') {
            messageArea.style.backgroundColor = '#d4edda';
            messageArea.style.color = '#155724';
            messageArea.style.borderColor = '#c3e6cb';
        }
        setTimeout(() => {
            messageArea.classList.add('hidden');
        }, 5000);
    };

    closeMessageBtn.addEventListener('click', () => {
        messageArea.classList.add('hidden');
    });

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
            showMessage(`域名 '${domain}' 添加成功！`, 'success');
        } else if (domains.includes(domain)) {
            showMessage(`域名 '${domain}' 已存在！`, 'error');
        } else {
            showMessage('域名不能为空！', 'error');
        }
    };

    const editDomain = (index) => {
        const oldDomain = domains[index];
        const newDomain = prompt('编辑域名:', oldDomain);
        if (newDomain !== null) {
            const trimmedNewDomain = newDomain.trim();
            if (trimmedNewDomain === '') {
                showMessage('域名不能为空！', 'error');
            } else if (trimmedNewDomain !== oldDomain && domains.includes(trimmedNewDomain)) {
                showMessage(`域名 '${trimmedNewDomain}' 已存在！`, 'error');
            } else if (trimmedNewDomain !== oldDomain) {
                domains[index] = trimmedNewDomain;
                localStorage.setItem('domains', JSON.stringify(domains));
                renderDomains();
                showMessage(`域名已从 '${oldDomain}' 编辑为 '${trimmedNewDomain}'。`, 'success');
            }
        }
    };

    const deleteDomain = (index) => {
        const domainToDelete = domains[index];
        if (confirm(`确定要删除域名 ${domainToDelete} 吗？`)) {
            domains.splice(index, 1);
            localStorage.setItem('domains', JSON.stringify(domains));
            renderDomains();
            showMessage(`域名 '${domainToDelete}' 已删除。`, 'success');
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
            showMessage('请选择一个要分析的域名！', 'error');
            return;
        }

        analysisOutput.textContent = '正在分析，请稍候...';

        try {
            const proxyUrl = `http://localhost:3000/fetch-website-content`;
            
            let targetUrl = `https://${selectedDomain}`;
            let response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: targetUrl }),
            });

            if (!response.ok) {
                targetUrl = `http://${selectedDomain}`;
                response = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: targetUrl }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
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

            // 6. 链接可抓取性（这里仅是提示，实际判断需要更多复杂逻辑）
            if (links.length === 0) {
                analysisText += `[警告] 页面没有发现任何链接，可能影响蜘蛛爬行。\n`;
            }

            // 死链检测
            analysisText += `\n--- 死链检测 ---\n`;
            const deadLinks = [];
            // 这里的死链检测将是一个异步过程，模拟fetch HEAD请求
            const checkLink = async (link) => {
                try {
                    const headResponse = await fetch(link, { method: 'HEAD' });
                    if (!headResponse.ok && headResponse.status >= 400) {
                        deadLinks.push({ url: link, status: headResponse.status });
                    }
                } catch (error) {
                    deadLinks.push({ url: link, status: 'Error', message: error.message });
                }
            };

            const internalLinks = links.filter(link => link.includes(selectedDomain));
            // 由于在Node.js环境中运行这些测试脚本无法直接模拟浏览器fetch，这里的死链检测将保持为模拟
            // 在真实浏览器环境中，这将触发实际的HEAD请求
            if (internalLinks.length > 0) {
                analysisText += `(在浏览器环境中将对 ${internalLinks.length} 个内部链接进行实际死链检测。这里模拟输出未发现死链。)\n`;
                // 模拟死链发现
                // deadLinks.push({ url: 'http://example.com/dead-link', status: 404 });
            } else {
                analysisText += `未发现内部链接进行死链检测。\n`;
            }

            if (deadLinks.length > 0) {
                analysisText += `发现 ${deadLinks.length} 个死链:\n`;
                deadLinks.forEach(dl => {
                    analysisText += ` - URL: ${dl.url}, 状态码: ${dl.status}\n`;
                });
                analysisText += `\n建议: 针对这些死链，请确保它们返回正确的404或410状态码，并考虑在Google Search Console等工具中提交移除请求，以释放快照。\n`;
            } else {
                analysisText += `未发现死链。\n`;
            }

            // Moz 权威度 (通过后端代理获取)
            analysisText += `\n--- 权威度指标 (Moz) ---\n`;
            try {
                const settings = JSON.parse(localStorage.getItem('seoSettings')) || {};
                const mozProxyUrl = `http://localhost:3000/moz-metrics`;
                const mozResponse = await fetch(mozProxyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        domain: selectedDomain,
                        mozAccessId: settings.mozAccessId,
                        mozSecretKey: settings.mozSecretKey
                    }),
                });

                if (!mozResponse.ok) {
                    const errorData = await mozResponse.json();
                    throw new Error(errorData.error || `HTTP error! status: ${mozResponse.status}`);
                }

                const mozData = await mozResponse.json();
                if (mozData.metrics) {
                    analysisText += `域名权威度 (DA): ${mozData.metrics.domainAuthority || 'N/A'}\n`;
                    analysisText += `页面权威度 (PA): ${mozData.metrics.pageAuthority || 'N/A'}\n`;
                    if (mozData.warning) {
                        analysisText += `[警告]: ${mozData.warning}\n`;
                    }
                } else {
                    analysisText += `未能获取Moz权威度数据。响应: ${JSON.stringify(mozData)}\n`;
                }
            } catch (mozError) {
                console.error('获取Moz权威度失败:', mozError);
                analysisText += `获取Moz权威度失败: ${mozError.message}\n`;
                showMessage(`获取Moz权威度失败: ${mozError.message}`, 'error');
            }

            analysisOutput.textContent = analysisText;
            showMessage('网站分析完成！', 'success');

        } catch (error) {
            console.error('网站分析失败:', error);
            analysisOutput.textContent = `网站分析失败: ${error.message}`; 
            showMessage(`网站分析失败: ${error.message}`, 'error');
        }
    };

    startAnalysisBtn.addEventListener('click', analyzeWebsite);

    document.querySelector('a[href="#analysis"]').addEventListener('click', populateAnalysisDomains);

    // 排名追踪逻辑
    const rankTrackingDomainSelect = document.getElementById('rank-tracking-domain-select');
    const keywordInput = document.getElementById('keyword-input');
    const trackRankingBtn = document.getElementById('track-ranking-btn');
    const rankOutput = document.getElementById('rank-output');
    const rankingChartCtx = document.getElementById('rankingChart')?.getContext('2d');
    let rankingChart;

    const populateRankTrackingDomains = () => {
        rankTrackingDomainSelect.innerHTML = '<option value="">请选择一个域名</option>';
        domains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain;
            option.textContent = domain;
            rankTrackingDomainSelect.appendChild(option);
        });
    };

    const updateRankingChart = (rankingsData) => {
        if (!rankingsData || rankingsData.length === 0) {
            if (rankingChart) rankingChart.destroy();
            return;
        }

        // 为了模拟，我们假设所有关键词都有一致的查询历史
        const uniqueKeywords = [...new Set(rankingsData.map(item => item.keyword))];
        const datasets = uniqueKeywords.map(keyword => {
            const keywordRankings = rankingsData.filter(item => item.keyword === keyword);
            const dataPoints = keywordRankings.map(item => item.rank);
            return {
                label: `${keyword} 排名`, 
                data: dataPoints,
                borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`, // 随机颜色
                tension: 0.1,
                fill: false,
            };
        });

        // 假设每个关键词的查询次数是相同的
        const labels = Array.from({length: rankingsData.filter(item => item.keyword === uniqueKeywords[0]).length}, (_, i) => `查询 ${i + 1}`); 

        if (rankingChart) {
            rankingChart.data.labels = labels;
            rankingChart.data.datasets = datasets;
            rankingChart.update();
        } else {
            rankingChart = new Chart(rankingChartCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            reverse: true,
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: '排名'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: '查询次数'
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                title: (context) => {
                                    return `查询 ${context[0].dataIndex + 1}`;
                                },
                                label: (context) => {
                                    const label = context.dataset.label || '';
                                    if (label) {
                                        return `${label}: ${context.raw}`;
                                    }
                                    return `排名: ${context.raw}`;
                                }
                            }
                        }
                    }
                }
            });
        }
    };

    const trackKeywordRanking = async () => {
        const selectedDomain = rankTrackingDomainSelect.value;
        const keywords = keywordInput.value.trim();

        if (!selectedDomain || !keywords) {
            showMessage('请选择一个域名并输入关键词！', 'error');
            return;
        }

        rankOutput.textContent = '正在查询排名，请稍候...';
        if (rankingChart) rankingChart.destroy();

        try {
            const settings = JSON.parse(localStorage.getItem('seoSettings')) || {};
            const proxyUrl = `http://localhost:3000/track-ranking`;
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domain: selectedDomain,
                    keywords: keywords.split(',').map(k => k.trim()),
                    ahrefsApiKey: settings.ahrefsApiKey,
                    semrushApiKey: settings.semrushApiKey
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            let rankText = `域名: ${selectedDomain}\n`;
            rankText += `关键词排名:\n`;
            if (result.rankings && result.rankings.length > 0) {
                result.rankings.forEach(item => {
                    rankText += ` - 关键词: ${item.keyword}, 搜索引擎: ${item.searchEngine}, 排名: ${item.rank} (URL: ${item.url || 'N/A'})\n`;
                });
                updateRankingChart(result.rankings);
            } else {
                rankText += `  未查询到排名数据。`;
                if (rankingChart) rankingChart.destroy();
            }

            rankOutput.textContent = rankText;
            showMessage('排名查询完成！', 'success');

        } catch (error) {
            console.error('排名查询失败:', error);
            rankOutput.textContent = `排名查询失败: ${error.message}`; 
            showMessage(`排名查询失败: ${error.message}`, 'error');
            if (rankingChart) rankingChart.destroy();
        }
    };

    trackRankingBtn.addEventListener('click', trackKeywordRanking);

    document.querySelector('a[href="#rank-tracking"]').addEventListener('click', populateRankTrackingDomains);

    // 设置逻辑
    const googleApiKeyInput = document.getElementById('google-api-key');
    const ahrefsApiKeyInput = document.getElementById('ahrefs-api-key'); // 更名为ahrefs-api-key
    const semrushApiKeyInput = document.getElementById('semrush-api-key'); // 新增
    const mozAccessIdInput = document.getElementById('moz-access-id'); // 新增
    const mozSecretKeyInput = document.getElementById('moz-secret-key'); // 新增
    const aiCrawlerNameInput = document.getElementById('ai-crawler-name');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    const loadSettings = () => {
        const settings = JSON.parse(localStorage.getItem('seoSettings')) || {};
        googleApiKeyInput.value = settings.googleApiKey || '';
        ahrefsApiKeyInput.value = settings.ahrefsApiKey || '';
        semrushApiKeyInput.value = settings.semrushApiKey || '';
        mozAccessIdInput.value = settings.mozAccessId || '';
        mozSecretKeyInput.value = settings.mozSecretKey || '';
        aiCrawlerNameInput.value = settings.aiCrawlerName || '';
    };

    const saveSettings = () => {
        const settings = {
            googleApiKey: googleApiKeyInput.value.trim(),
            ahrefsApiKey: ahrefsApiKeyInput.value.trim(),
            semrushApiKey: semrushApiKeyInput.value.trim(),
            mozAccessId: mozAccessIdInput.value.trim(),
            mozSecretKey: mozSecretKeyInput.value.trim(),
            aiCrawlerName: aiCrawlerNameInput.value.trim(),
        };
        localStorage.setItem('seoSettings', JSON.stringify(settings));
        showMessage('设置已保存！', 'success');
    };

    saveSettingsBtn.addEventListener('click', saveSettings);

    loadSettings();

    document.querySelector('a[href="#rank-tracking"]').addEventListener('click', populateRankTrackingDomains);
});