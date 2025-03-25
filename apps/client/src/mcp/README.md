# MCP 服务

这个目录包含了基于MCP (Model Context Protocol) SDK的本地服务实现。

## 简介

MCP（模型上下文协议）允许应用程序以标准化的方式为大语言模型(LLM)提供上下文，将提供上下文的关注点与实际的LLM交互分离。

本实现使用`@modelcontextprotocol/sdk`创建了一个本地MCP服务，提供了以下功能：

- 暴露静态和动态资源
- 提供工具调用能力
- 定义提示模板
- 封装成内存对象供应用程序其他部分调用

## 架构

服务架构如下：

```
src/mcp/
├── index.ts           # 主入口文件，导出服务实例
├── server.ts          # MCP服务器实现
├── resources/         # 资源定义
├── tools/             # 工具定义
├── prompts/           # 提示模板
└── utils/             # 工具函数
```

## 使用方法

```typescript
import { mcpService } from '@/mcp';

// 获取服务信息
const info = mcpService.getInfo();

// 调用工具
const result = await mcpService.callTool('calculator', { a: 5, b: 3, operation: 'add' });

// 获取资源
const resource = await mcpService.getResource('notes://123');
```

详细的API和使用方法请参考`DEVELOPMENT.md`文档。 