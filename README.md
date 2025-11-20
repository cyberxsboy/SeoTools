# SEO蜘蛛池工具

## 项目简介

这是一个基于HTML、JavaScript和Node.js构建的SEO蜘蛛池工具。它旨在帮助用户管理域名，分析网站的SEO健康状况，检测死链，并追踪关键词在主流搜索引擎的自然排名。为了克服浏览器端的跨域限制，工具包含一个轻量级的Node.js后端代理服务，用于安全地与第三方SEO工具API进行交互。

## 主要功能

1.  **域名管理**：允许用户添加、编辑、删除和持久化存储目标域名。
2.  **网站结构与内容分析**：模拟搜索引擎爬虫行为，抓取网站内容，分析网站的可爬行性、内部/外部链接结构、页面标题、Meta描述、关键词、H1标签使用情况和图片Alt属性等。
3.  **网站违规分析与建议**：根据搜索引擎算法规则，自动分析网站潜在的SEO违规点，并给出调整建议（例如：标题长度、Meta描述缺失或过长、多个H1标签、图片缺少Alt属性、内容过少等）。
4.  **死链检测与报告**：遍历网站内部链接，检测HTTP状态码以识别死链，生成详细报告，并提供手动提交到搜索引擎URL移除工具的指导。
5.  **关键词排名追踪**：集成主流第三方SEO工具（如Ahrefs, SEMrush, Moz）的API，实时统计网站首页和文章页关键词在搜索引擎上的自然排名。
6.  **搜索引擎/AI搜索爬虫配置**：提供一个设置接口，允许用户添加第三方API密钥以及自定义其他搜索引擎或AI搜索爬虫的名称。

## 技术栈

*   **前端**：HTML, CSS, JavaScript (纯客户端运行)
*   **后端代理**：Node.js, Express, Axios
*   **数据存储**：浏览器LocalStorage (前端设置和域名管理), 后端API响应数据 (临时)

## 安装与运行

### 1. 克隆仓库

```bash
git clone https://github.com/cyberxsboy/SeoTools.git
cd SeoTools
```

### 2. 后端代理设置

进入项目根目录，安装Node.js依赖：

```bash
npm install
```

启动后端代理服务器：

```bash
npm start
```

服务器将在 `http://localhost:3000` 运行。请保持此终端窗口打开。

### 3. 前端应用

直接在浏览器中打开 `index.html` 文件即可。由于是纯前端应用，不需要额外的服务器。

## API Key 配置

为了使关键词排名追踪和权威度指标功能正常工作，您需要在 `server.js` 文件中配置第三方SEO工具的API密钥。这些密钥应该在实际部署时通过环境变量或其他安全方式管理。

打开 `server.js` 文件，找到以下占位符并替换为您的真实API密钥：

```javascript
const AHREFS_API_KEY = process.env.AHREFS_API_KEY || 'YOUR_AHREFS_API_KEY';
const SEMRUSH_API_KEY = process.env.SEMRUSH_API_KEY || 'YOUR_SEMRUSH_API_KEY';
const MOZ_ACCESS_ID = process.env.MOZ_ACCESS_ID || 'YOUR_MOZ_ACCESS_ID';
const MOZ_SECRET_KEY = process.env.MOZ_SECRET_KEY || 'YOUR_MOZ_SECRET_KEY';
```

同时，您需要取消注释 `server.js` 中 `/ahrefs-rankings`, `/semrush-rankings`, `/moz-metrics` 接口内的真实API调用逻辑，并根据各个API的最新文档进行调整。

## 使用说明

1.  **域名管理**：在“域名管理”页面添加您要分析的域名。
2.  **网站分析**：在“网站分析”页面选择一个域名，点击“开始分析”以获取网站结构、内容分析和违规建议（包括死链检测）。
3.  **排名追踪**：在“排名追踪”页面选择一个域名，输入关键词（逗号分隔），点击“开始追踪”以获取关键词排名信息。
4.  **设置**：在“设置”页面输入并保存您的API密钥和自定义爬虫名称。

## 局限性与未来增强

*   **API 密钥安全**：目前API密钥直接硬编码在代码中，建议在生产环境中使用环境变量或其他更安全的配置管理方案。
*   **真实 API 集成**：目前第三方SEO API（Ahrefs, SEMrush, Moz）仍在使用模拟数据。需要根据各自的API文档，在 `server.js` 中完成真实的API调用逻辑。
*   **错误处理和用户反馈**：可以进一步完善前端和后端的错误处理机制，提供更友好的用户体验。
*   **数据持久化**：目前数据主要存储在浏览器LocalStorage，对于更复杂的数据分析和历史趋势，可以考虑集成数据库。
*   **UI/UX**：可以引入图表库（如Chart.js）来可视化排名趋势和分析数据。

## 贡献

欢迎对项目进行贡献！