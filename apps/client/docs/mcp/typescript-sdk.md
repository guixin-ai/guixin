# MCP TypeScript SDK

[![NPM版本](https://img.shields.io/npm/v/@modelcontextprotocol/sdk)](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
[![MIT许可证](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 目录

- [概述](#概述)
- [安装](#安装)
- [快速入门](#快速入门)
- [什么是MCP？](#什么是mcp)
- [核心概念](#核心概念)
  - [服务器](#服务器)
  - [资源](#资源)
  - [工具](#工具)
  - [提示](#提示)
- [运行服务器](#运行服务器)
  - [标准输入输出(stdio)](#标准输入输出stdio)
  - [HTTP与SSE](#http与sse)
- [测试与调试](#测试与调试)
- [示例](#示例)
  - [回显服务器](#回显服务器)
  - [SQLite浏览器](#sqlite浏览器)
- [高级用法](#高级用法)
  - [低级服务器](#低级服务器)
  - [编写MCP客户端](#编写mcp客户端)

## 概述

模型上下文协议(Model Context Protocol, MCP)允许应用程序以标准化的方式为大语言模型(LLM)提供上下文，将提供上下文的关注点与实际的LLM交互分离。这个TypeScript SDK实现了完整的MCP规范，可以轻松地：

- 构建能连接到任何MCP服务器的MCP客户端
- 创建暴露资源、提示和工具的MCP服务器
- 使用标准传输方式，如标准输入/输出(stdio)和服务器发送事件(SSE)
- 处理所有MCP协议消息和生命周期事件

## 安装

```bash
npm install @modelcontextprotocol/sdk
```

## 快速入门

让我们创建一个简单的MCP服务器，它提供一个计算器工具和一些数据：

```typescript
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 创建MCP服务器
const server = new McpServer({
  name: "演示",
  version: "1.0.0"
});

// 添加加法工具
server.tool("add",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

// 添加动态问候资源
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `你好，${name}！`
    }]
  })
);

// 开始在标准输入上接收消息，在标准输出上发送消息
const transport = new StdioServerTransport();
await server.connect(transport);
```

## 什么是MCP？

模型上下文协议(MCP)允许您构建服务器，以安全、标准化的方式向LLM应用程序公开数据和功能。可以将其视为专为LLM交互设计的Web API。MCP服务器可以：

- 通过资源(Resources)公开数据（类似于GET端点；用于将信息加载到LLM的上下文中）
- 通过工具(Tools)提供功能（类似于POST端点；用于执行代码或产生其他副作用）
- 通过提示(Prompts)定义交互模式（LLM交互的可重用模板）
- 等等！

## 核心概念

### 服务器

`McpServer`是您与MCP协议的核心接口。它处理连接管理、协议合规性和消息路由：

```typescript
const server = new McpServer({
  name: "我的应用",
  version: "1.0.0"
});
```

### 资源

资源是您向LLM公开数据的方式。它们类似于REST API中的GET端点 - 提供数据但不应执行重要计算或产生副作用：

```typescript
// 静态资源
server.resource(
  "config",
  "config://app",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: "应用配置信息"
    }]
  })
);

// 带参数的动态资源
server.resource(
  "user-profile",
  new ResourceTemplate("users://{userId}/profile", { list: undefined }),
  async (uri, { userId }) => ({
    contents: [{
      uri: uri.href,
      text: `用户 ${userId} 的个人资料数据`
    }]
  })
);
```

### 工具

工具允许LLM通过您的服务器执行操作。与资源不同，工具预期会执行计算并产生副作用：

```typescript
// 带参数的简单工具
server.tool(
  "calculate-bmi",
  {
    weightKg: z.number(),
    heightM: z.number()
  },
  async ({ weightKg, heightM }) => ({
    content: [{
      type: "text",
      text: String(weightKg / (heightM * heightM))
    }]
  })
);

// 带外部API调用的异步工具
server.tool(
  "fetch-weather",
  { city: z.string() },
  async ({ city }) => {
    const response = await fetch(`https://api.weather.com/${city}`);
    const data = await response.text();
    return {
      content: [{ type: "text", text: data }]
    };
  }
);
```

### 提示

提示是可重用的模板，帮助LLM有效地与您的服务器交互：

```typescript
server.prompt(
  "review-code",
  { code: z.string() },
  ({ code }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `请审查这段代码：\n\n${code}`
      }
    }]
  })
);
```

## 运行服务器

TypeScript中的MCP服务器需要连接到传输层才能与客户端通信。启动服务器的方式取决于传输层的选择：

### 标准输入输出(stdio)

对于命令行工具和直接集成：

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "示例服务器",
  version: "1.0.0"
});

// ... 设置服务器资源、工具和提示 ...

const transport = new StdioServerTransport();
await server.connect(transport);
```

### HTTP与SSE

对于远程服务器，启动带有服务器发送事件(SSE)端点的Web服务器，并为客户端发送消息提供单独的端点：

```typescript
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const server = new McpServer({
  name: "示例服务器",
  version: "1.0.0"
});

// ... 设置服务器资源、工具和提示 ...

const app = express();

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  // 注意：要支持多个同时连接，需要将这些消息
  // 路由到特定的匹配传输。（为简单起见，这里没有实现此逻辑。）
  await transport.handlePostMessage(req, res);
});

app.listen(3001);
```

## 测试与调试

要测试您的服务器，可以使用MCP检查器。请参阅其README获取更多信息。

## 示例

### 回显服务器

一个演示资源、工具和提示的简单服务器：

```typescript
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "回显",
  version: "1.0.0"
});

server.resource(
  "echo",
  new ResourceTemplate("echo://{message}", { list: undefined }),
  async (uri, { message }) => ({
    contents: [{
      uri: uri.href,
      text: `资源回显: ${message}`
    }]
  })
);

server.tool(
  "echo",
  { message: z.string() },
  async ({ message }) => ({
    content: [{ type: "text", text: `工具回显: ${message}` }]
  })
);

server.prompt(
  "echo",
  { message: z.string() },
  ({ message }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `请处理这条消息: ${message}`
      }
    }]
  })
);
```

### SQLite浏览器

一个展示数据库集成的更复杂示例：

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import sqlite3 from "sqlite3";
import { promisify } from "util";
import { z } from "zod";

const server = new McpServer({
  name: "SQLite浏览器",
  version: "1.0.0"
});

// 创建数据库连接辅助函数
const getDb = () => {
  const db = new sqlite3.Database("database.db");
  return {
    all: promisify<string, any[]>(db.all.bind(db)),
    close: promisify(db.close.bind(db))
  };
};

server.resource(
  "schema",
  "schema://main",
  async (uri) => {
    const db = getDb();
    try {
      const tables = await db.all(
        "SELECT sql FROM sqlite_master WHERE type='table'"
      );
      return {
        contents: [{
          uri: uri.href,
          text: tables.map((t: {sql: string}) => t.sql).join("\n")
        }]
      };
    } finally {
      await db.close();
    }
  }
);

server.tool(
  "query",
  { sql: z.string() },
  async ({ sql }) => {
    const db = getDb();
    try {
      const results = await db.all(sql);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(results, null, 2)
        }]
      };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        content: [{
          type: "text",
          text: `错误: ${error.message}`
        }],
        isError: true
      };
    } finally {
      await db.close();
    }
  }
);
```

## 高级用法

### 低级服务器

要获得更多控制，可以直接使用低级别的`Server`类：

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "示例服务器",
    version: "1.0.0"
  },
  {
    capabilities: {
      prompts: {}
    }
  }
);

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [{
      name: "example-prompt",
      description: "示例提示模板",
      arguments: [{
        name: "arg1",
        description: "示例参数",
        required: true
      }]
    }]
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name !== "example-prompt") {
    throw new Error("未知提示");
  }
  return {
    description: "示例提示",
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: "示例提示文本"
      }
    }]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### 编写MCP客户端

SDK提供了高级客户端接口：

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["server.js"]
});

const client = new Client(
  {
    name: "示例客户端",
    version: "1.0.0"
  },
  {
    capabilities: {
      prompts: {},
      resources: {},
      tools: {}
    }
  }
);

await client.connect(transport);

// 列出提示
const prompts = await client.listPrompts();

// 获取提示
const prompt = await client.getPrompt("example-prompt", {
  arg1: "值"
});

// 列出资源
const resources = await client.listResources();

// 读取资源
const resource = await client.readResource("file:///example.txt");

// 调用工具
const result = await client.callTool({
  name: "example-tool",
  arguments: {
    arg1: "值"
  }
});
```

## 文档

- [模型上下文协议文档](https://modelcontextprotocol.io)
- [MCP规范](https://spec.modelcontextprotocol.io)
- [示例服务器](https://github.com/modelcontextprotocol/examples)

## 贡献

欢迎在GitHub上提交问题和拉取请求：https://github.com/modelcontextprotocol/typescript-sdk。

## 许可证

该项目采用MIT许可证 - 详情请参阅LICENSE文件。 