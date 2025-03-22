# 客户端示例

支持MCP集成的应用程序列表

本页提供了支持模型上下文协议（MCP）的应用程序概述。每个客户端可能支持不同的MCP功能，允许与MCP服务器进行不同级别的集成。

## 功能支持矩阵

| 客户端 | [资源](https://modelcontextprotocol.io/docs/concepts/resources) | [提示](https://modelcontextprotocol.io/docs/concepts/prompts) | [工具](https://modelcontextprotocol.io/docs/concepts/tools) | [采样](https://modelcontextprotocol.io/docs/concepts/sampling) | 根 | 注释 |
| --- | --- | --- | --- | --- | --- | --- |
| [Claude桌面应用](https://claude.ai/download) | ✅ | ✅ | ✅ | ❌ | ❌ | 完全支持所有MCP功能 |
| [5ire](https://github.com/nanbingxyz/5ire) | ❌ | ❌ | ✅ | ❌ | ❌ | 支持工具 |
| [BeeAI框架](https://i-am-bee.github.io/beeai-framework) | ❌ | ❌ | ✅ | ❌ | ❌ | 在代理工作流中支持工具 |
| [Cline](https://github.com/cline/cline) | ✅ | ❌ | ✅ | ❌ | ❌ | 支持工具和资源 |
| [Continue](https://github.com/continuedev/continue) | ✅ | ✅ | ✅ | ❌ | ❌ | 完全支持所有MCP功能 |
| [Cursor](https://cursor.com) | ❌ | ❌ | ✅ | ❌ | ❌ | 支持工具 |
| [Emacs Mcp](https://github.com/lizqwerscott/mcp.el) | ❌ | ❌ | ✅ | ❌ | ❌ | 在Emacs中支持工具 |
| [Firebase Genkit](https://github.com/firebase/genkit) | ⚠️ | ✅ | ✅ | ❌ | ❌ | 通过工具支持资源列表和查找 |
| [GenAIScript](https://microsoft.github.io/genaiscript/reference/scripts/mcp-tools/) | ❌ | ❌ | ✅ | ❌ | ❌ | 支持工具 |
| [Goose](https://block.github.io/goose/docs/goose-architecture/#interoperability-with-extensions) | ❌ | ❌ | ✅ | ❌ | ❌ | 支持工具 |
| [LibreChat](https://github.com/danny-avila/LibreChat) | ❌ | ❌ | ✅ | ❌ | ❌ | 为代理支持工具 |
| [mcp-agent](https://github.com/lastmile-ai/mcp-agent) | ❌ | ❌ | ✅ | ⚠️ | ❌ | 支持工具、服务器连接管理和代理工作流 |
| [oterm](https://github.com/ggozad/oterm) | ❌ | ❌ | ✅ | ❌ | ❌ | 支持工具 |
| [Roo Code](https://roocode.com) | ✅ | ❌ | ✅ | ❌ | ❌ | 支持工具和资源 |
| [Sourcegraph Cody](https://sourcegraph.com/cody) | ✅ | ❌ | ❌ | ❌ | ❌ | 通过OpenCTX支持资源 |
| [Superinterface](https://superinterface.ai) | ❌ | ❌ | ✅ | ❌ | ❌ | 支持工具 |
| [TheiaAI/TheiaIDE](https://eclipsesource.com/blogs/2024/12/19/theia-ide-and-theia-ai-support-mcp/) | ❌ | ❌ | ✅ | ❌ | ❌ | 在Theia AI和AI驱动的Theia IDE中为代理支持工具 |
| [Windsurf Editor](https://codeium.com/windsurf) | ❌ | ❌ | ✅ | ❌ | ❌ | 通过AI Flow支持工具进行协作开发 |
| [Zed](https://zed.dev) | ❌ | ✅ | ❌ | ❌ | ❌ | 提示作为斜杠命令出现 |
| [SpinAI](https://spinai.dev) | ❌ | ❌ | ✅ | ❌ | ❌ | 为TypeScript AI代理支持工具 |
| [OpenSumi](https://github.com/opensumi/core) | ❌ | ❌ | ✅ | ❌ | ❌ | 在OpenSumi中支持工具 |
| [Daydreams Agents](https://github.com/daydreamsai/daydreams) | ✅ | ✅ | ✅ | ❌ | ❌ | 支持在Daydreams代理中集成服务器 |

## 客户端详情

### Claude桌面应用

Claude桌面应用提供了对MCP的全面支持，实现了与本地工具和数据源的深度集成。

**主要功能：**

* 完全支持资源，允许附加本地文件和数据
* 支持提示模板
* 工具集成，用于执行命令和脚本
* 本地服务器连接，增强隐私和安全性

> ⓘ 注意：Claude.ai网页应用目前不支持MCP。MCP功能仅在桌面应用中可用。

### 5ire

5ire是一个开源跨平台桌面AI助手，通过MCP服务器支持工具。

**主要功能：**

* 内置MCP服务器可以快速启用和禁用
* 用户可以通过修改配置文件添加更多服务器
* 它是开源且用户友好的，适合初学者
* 未来对MCP的支持将持续改进

### BeeAI框架

BeeAI框架是一个开源框架，用于构建、部署和大规模提供强大的代理工作流。该框架包括**MCP工具**，这是一个原生功能，简化了MCP服务器到代理工作流的集成。

**主要功能：**

* 无缝将MCP工具整合到代理工作流中
* 快速从连接的MCP客户端实例化框架原生工具
* 计划未来支持代理MCP功能

**了解更多：**

* 在代理工作流中使用MCP工具的示例

### Cline

Cline是VS Code中的一个自主编码代理，它可以编辑文件、运行命令、使用浏览器等 - 每一步都需要您的许可。

**主要功能：**

* 通过自然语言创建和添加工具（例如"添加一个搜索网络的工具"）
* 通过`~/Documents/Cline/MCP`目录与他人共享Cline创建的自定义MCP服务器
* 显示配置的MCP服务器及其工具、资源和任何错误日志

### Continue

Continue是一个开源AI代码助手，内置支持所有MCP功能。

**主要功能：**

* 输入"@"来提及MCP资源
* 提示模板作为斜杠命令出现
* 在聊天中直接使用内置和MCP工具
* 支持VS Code和JetBrains IDEs，兼容任何LLM

### Cursor

Cursor是一个AI代码编辑器。

**主要功能：**

* 在Cursor Composer中支持MCP工具
* 同时支持STDIO和SSE

### Emacs Mcp

Emacs Mcp是一个设计用于与MCP服务器接口的Emacs客户端，实现无缝连接和交互。它为AI插件（如gptel和llm）提供MCP工具调用支持，遵循Emacs的标准工具调用格式。这种集成增强了Emacs生态系统中AI工具的功能。

**主要功能：**

* 为Emacs提供MCP工具支持

### Firebase Genkit

Genkit是Firebase用于构建和集成GenAI功能到应用程序的SDK。genkitx-mcp插件使消费MCP服务器作为客户端或从Genkit工具和提示创建MCP服务器成为可能。

**主要功能：**

* 对工具和提示的客户端支持（资源部分支持）
* 在Genkit的Dev UI游乐场中支持丰富的发现
* 与Genkit现有工具和提示的无缝互操作性
* 适用于来自顶级提供商的各种GenAI模型

### GenAIScript

使用GenAIScript（在JavaScript中）以编程方式组装LLM的提示。在JavaScript中编排LLM、工具和数据。

**主要功能：**

* 使用提示的JavaScript工具箱
* 使其易用且高效的抽象
* 无缝Visual Studio Code集成

### Goose

Goose是一个开源AI代理，通过自动化编码任务来增强您的软件开发。

**主要功能：**

* 通过工具向Goose公开MCP功能
* MCP可以直接通过扩展目录、CLI或UI安装
* Goose允许您通过构建自己的MCP服务器来扩展其功能
* 包括用于开发、网络抓取、自动化、内存的内置工具，以及与JetBrains和Google Drive的集成

### LibreChat

LibreChat是一个开源、可定制的AI聊天UI，支持多个AI提供商，现在包括MCP集成。

**主要功能：**

* 通过MCP服务器扩展当前工具生态系统，包括代码解释器和图像生成工具
* 使用来自顶级提供商的各种LLM，将工具添加到可定制的代理
* 开源且可自托管，支持安全的多用户
* 未来路线图包括扩展的MCP功能支持

### mcp-agent

mcp-agent是一个简单、可组合的框架，用于使用模型上下文协议构建代理。

**主要功能：**

* MCP服务器的自动连接管理
* 向LLM公开来自多个服务器的工具
* 实现《构建有效代理》中定义的每个模式
* 支持工作流暂停/恢复信号，例如等待人类反馈

### oterm

oterm是Ollama的终端客户端，允许用户创建聊天/代理。

**主要功能：**

* 支持与工具连接的Ollama的多个完全可定制的聊天会话
* 支持MCP工具

### Roo Code

Roo Code通过MCP启用AI编码辅助。

**主要功能：**

* 支持MCP工具和资源
* 与开发工作流集成
* 可扩展的AI功能

### Sourcegraph Cody

Cody是Sourcegraph的AI编码助手，通过OpenCTX实现MCP。

**主要功能：**

* 支持MCP资源
* 与Sourcegraph的代码智能集成
* 使用OpenCTX作为抽象层
* 计划未来支持更多MCP功能

### SpinAI

SpinAI是一个开源TypeScript框架，用于构建可观察的AI代理。该框架提供原生MCP兼容性，允许代理与MCP服务器和工具无缝集成。

**主要功能：**

* 为AI代理内置MCP兼容性
* 开源TypeScript框架
* 可观察的代理架构
* 原生支持MCP工具集成

### Superinterface

Superinterface是AI基础设施和开发者平台，用于构建具有MCP支持、交互组件、客户端函数调用等功能的应用内AI助手。

**主要功能：**

* 在通过React组件或脚本标签嵌入的助手中使用来自MCP服务器的工具
* SSE传输支持
* 使用来自任何AI提供商的任何AI模型（OpenAI、Anthropic、Ollama等）

### TheiaAI/TheiaIDE

Theia AI是一个用于构建AI增强工具和IDE的框架。AI驱动的Theia IDE是一个基于Theia AI构建的开放且灵活的开发环境。

**主要功能：**

* **工具集成**：Theia AI使AI代理（包括Theia IDE中的代理）能够利用MCP服务器进行无缝工具交互。
* **可定制提示**：Theia IDE允许用户定义和调整提示，动态集成MCP服务器以实现定制工作流。
* **自定义代理**：Theia IDE支持创建利用MCP功能的自定义代理，使用户能够即时设计专用工作流。

Theia AI和Theia IDE的MCP集成为用户提供了灵活性，使它们成为探索和适应MCP的强大平台。

**了解更多：**

* Theia IDE和Theia AI MCP公告
* 下载AI驱动的Theia IDE

### Windsurf Editor

Windsurf Editor是一个代理式IDE，结合了AI辅助和开发者工作流。它具有创新的AI Flow系统，可以实现协作和独立的AI交互，同时保持开发者控制。

**主要功能：**

* 革命性的AI Flow范式，用于人机协作
* 智能代码生成和理解
* 丰富的开发工具，支持多模型

### Zed

Zed是一个高性能代码编辑器，内置MCP支持，专注于提示模板和工具集成。

**主要功能：**

* 提示模板作为编辑器中的斜杠命令出现
* 用于增强编码工作流的工具集成
* 与编辑器功能和工作区上下文的紧密集成
* 不支持MCP资源

### OpenSumi

OpenSumi是一个帮助您快速构建AI原生IDE产品的框架。

**主要功能：**

* 在OpenSumi中支持MCP工具
* 支持内置IDE MCP服务器和自定义MCP服务器

### Daydreams

Daydreams是一个用于在链上执行任何操作的生成式代理框架。

**主要功能：**

* 在配置中支持MCP服务器
* 公开MCP客户端

## 向您的应用程序添加MCP支持

如果您已经向应用程序添加了MCP支持，我们鼓励您提交拉取请求，将其添加到此列表中。MCP集成可以为您的用户提供强大的上下文AI功能，并使您的应用程序成为不断增长的MCP生态系统的一部分。

添加MCP支持的好处：

* 使用户能够带来自己的上下文和工具
* 加入不断增长的可互操作AI应用程序生态系统
* 为用户提供灵活的集成选项
* 支持本地优先的AI工作流

要开始在您的应用程序中实施MCP，请查看我们的Python或TypeScript SDK文档。

## 更新和修正

此列表由社区维护。如果您注意到任何不准确之处，或想更新有关您的应用程序中MCP支持的信息，请提交拉取请求或在我们的文档仓库中打开问题。

## 给小朋友的解释

想象一下，有很多不同的应用程序，就像各种各样的玩具🧸，它们都能和Claude（一个聪明的AI助手）一起玩耍。这些应用程序被称为"MCP客户端"。

**什么是MCP客户端？** 它们就像是会说话的玩具，知道如何和Claude交流，并且可以帮Claude使用特殊的魔法工具箱（MCP服务器）。

每个玩具（客户端）都有不同的特殊能力：

1. **Claude桌面应用** - 这是最强大的玩具，它能使用所有类型的魔法工具箱。它可以：
   - 让Claude看到你的文件（就像分享你的图画本📚）
   - 使用特殊咒语（提示模板）让Claude做特定的事情
   - 使用各种工具让Claude帮你完成任务

2. **编码助手玩具** - 像Cursor、Cline和Continue这样的玩具，特别擅长帮助你写代码：
   - 它们可以让Claude看到你的代码并帮助修改它
   - 有些可以让Claude使用特殊工具来搜索信息或运行程序
   - 它们就像有魔法的笔⌨️，帮助你写出更好的代码

3. **特殊玩具** - 还有很多其他玩具，每个都有独特的能力：
   - 有些可以在浏览器中工作，有些在特殊的编辑器中工作
   - 有些专注于特定类型的任务，比如项目管理或音乐
   - 有些是为了特定的编程语言或环境设计的

每个玩具支持不同的魔法能力，我们用这些符号来表示：
- ✅ 意味着"可以做到"
- ❌ 意味着"不能做到"
- ⚠️ 意味着"部分可以做到"

如果你正在制作自己的应用程序，你也可以教它如何和Claude以及魔法工具箱一起工作！这样，你的应用程序就能加入这个神奇的玩具家族，帮助人们以新的有趣方式使用AI。

有了这些特殊的玩具，人们可以以更多有趣的方式与Claude互动，让AI帮助完成各种任务，从写代码到组织信息，再到创造新事物！✨ 