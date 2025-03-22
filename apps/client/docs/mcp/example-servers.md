# 服务端示例

示例服务器和实现列表

本页展示了各种模型上下文协议（MCP）服务器，这些服务器展示了协议的功能和通用性。这些服务器使大型语言模型（LLM）能够安全地访问工具和数据源。

## 参考实现

这些官方参考服务器展示了核心MCP功能和SDK使用：

### 数据和文件系统

* **文件系统** - 具有可配置访问控制的安全文件操作
* **PostgreSQL** - 具有模式检查功能的只读数据库访问
* **SQLite** - 数据库交互和商业智能功能
* **Google Drive** - Google Drive的文件访问和搜索功能

### 开发工具

* **Git** - 用于读取、搜索和操作Git仓库的工具
* **GitHub** - 仓库管理、文件操作和GitHub API集成
* **GitLab** - GitLab API集成，支持项目管理
* **Sentry** - 从Sentry.io检索和分析问题

### Web和浏览器自动化

* **Brave搜索** - 使用Brave的搜索API进行Web和本地搜索
* **Fetch** - 为LLM使用优化的Web内容获取和转换
* **Puppeteer** - 浏览器自动化和Web抓取功能

### 生产力和通信

* **Slack** - 频道管理和消息功能
* **Google Maps** - 位置服务、方向和地点详情
* **Memory** - 基于知识图谱的持久性记忆系统

### AI和专用工具

* **EverArt** - 使用各种模型的AI图像生成
* **Sequential Thinking** - 通过思想序列进行动态问题解决
* **AWS KB Retrieval** - 使用Bedrock Agent Runtime从AWS知识库检索

## 官方集成

这些MCP服务器由公司为其平台维护：

* **Axiom** - 使用自然语言查询和分析日志、跟踪和事件数据
* **Browserbase** - 在云中自动化浏览器交互
* **Cloudflare** - 在Cloudflare开发者平台上部署和管理资源
* **E2B** - 在安全的云沙箱中执行代码
* **Neon** - 与Neon无服务器Postgres平台交互
* **Obsidian Markdown Notes** - 读取和搜索Obsidian库中的Markdown笔记
* **Qdrant** - 使用Qdrant向量搜索引擎实现语义记忆
* **Raygun** - 访问崩溃报告和监控数据
* **Search1API** - 用于搜索、爬取和站点地图的统一API
* **Stripe** - 与Stripe API交互
* **Tinybird** - 与Tinybird无服务器ClickHouse平台接口
* **Weaviate** - 通过您的Weaviate集合启用代理式RAG

## 社区亮点

不断增长的社区开发服务器生态系统扩展了MCP的功能：

* **Docker** - 管理容器、镜像、卷和网络
* **Kubernetes** - 管理pod、部署和服务
* **Linear** - 项目管理和问题跟踪
* **Snowflake** - 与Snowflake数据库交互
* **Spotify** - 控制Spotify播放和管理播放列表
* **Todoist** - 任务管理集成

> **注意：** 社区服务器未经测试，使用风险自负。它们与Anthropic没有关联，也不被Anthropic认可。

有关社区服务器的完整列表，请访问MCP服务器仓库。

## 入门指南

### 使用参考服务器

基于TypeScript的服务器可以直接使用`npx`：

```bash
npx -y @modelcontextprotocol/server-memory
```

基于Python的服务器可以使用`uvx`（推荐）或`pip`：

```bash
# 使用uvx
uvx mcp-server-git

# 使用pip
pip install mcp-server-git
python -m mcp_server_git
```

### 与Claude配置

要在Claude中使用MCP服务器，将其添加到您的配置中：

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

## 附加资源

* MCP服务器仓库 - 参考实现和社区服务器的完整集合
* 精选MCP服务器 - 精心策划的MCP服务器列表
* MCP CLI - 用于测试MCP服务器的命令行检查器
* MCP Get - 用于安装和管理MCP服务器的工具
* Supergateway - 通过SSE运行MCP stdio服务器

访问我们的GitHub讨论参与MCP社区。

## 给小朋友的解释

想象一下，MCP服务器就像是给Claude（一个聪明的AI助手）提供的各种神奇工具箱🧰！每个工具箱都让Claude获得不同的超能力。

**什么是MCP服务器？** 这些是特殊的程序，就像魔法盒子，让Claude能够做它原本做不到的事情。

这里有一些不同类型的魔法工具箱：

1. **存储工具箱📂** - 让Claude可以：
   - 读取你电脑上的文件（就像翻阅你的故事书）
   - 查询数据库（就像访问一个巨大的知识宝库）
   - 查看你的Google Drive（就像远程看到你的文件柜）

2. **编程工具箱💻** - 让Claude可以：
   - 帮你管理代码（就像是一个小小的程序员助手）
   - 整理GitHub上的项目（像一个组织专家）
   - 找出程序中的错误（像一个侦探寻找线索）

3. **网络工具箱🌐** - 让Claude可以：
   - 搜索互联网（就像拥有一个望远镜看向世界）
   - 获取网页内容（就像派出一个小信使）
   - 控制浏览器（就像遥控一辆网络小汽车）

4. **日常工具箱🔧** - 让Claude可以：
   - 在Slack上发送消息（就像一个信使）
   - 找到地图上的位置（就像一个向导）
   - 记住重要的事情（就像一个永不忘记的笔记本）

使用这些魔法工具箱很简单：
1. 选择你想要的工具箱
2. 告诉Claude在哪里可以找到它
3. 重启Claude，让它发现新工具
4. 现在就可以使用这些新能力了！

记住，Claude总是会先问你："我可以使用这个工具吗？"然后才会行动，所以你始终掌控着魔法工具箱的使用！

有了这些神奇的工具箱，Claude就变成了一个超级助手，可以帮你完成更多有趣又复杂的任务！✨ 