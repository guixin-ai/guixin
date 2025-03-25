# MCP服务开发指南

本文档提供了如何开发和扩展MCP服务的指南。

## 项目结构

MCP服务的目录结构如下：

```
src/mcp/
├── index.ts           # 主入口文件，导出服务实例
├── server.ts          # MCP服务器实现
├── resources/         # 资源定义
│   ├── index.ts       # 资源导出
│   ├── notes.ts       # 笔记资源
│   └── config.ts      # 配置资源
├── tools/             # 工具定义
│   ├── index.ts       # 工具导出
│   ├── calculator.ts  # 计算器工具
│   └── search.ts      # 搜索工具
├── prompts/           # 提示模板
│   ├── index.ts       # 提示导出
│   └── templates.ts   # 提示模板定义
└── utils/             # 工具函数
    └── helpers.ts     # 辅助函数
```

## 开发新资源

1. 在`resources`目录下创建新的资源文件（如`myresource.ts`）
2. 定义资源处理函数
3. 在`resources/index.ts`中导出
4. 在`server.ts`中注册

示例：

```typescript
// resources/myresource.ts
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

export const myResourceTemplate = new ResourceTemplate(
  "myresource://{id}",
  { list: undefined }
);

export async function handleMyResource(uri, { id }) {
  return {
    contents: [{
      uri: uri.href,
      text: `这是资源ID为${id}的内容`
    }]
  };
}
```

```typescript
// resources/index.ts
export * from './myresource';
```

## 开发新工具

1. 在`tools`目录下创建新的工具文件（如`mytool.ts`）
2. 定义工具的参数模式和处理函数
3. 在`tools/index.ts`中导出
4. 在`server.ts`中注册

示例：

```typescript
// tools/mytool.ts
import { z } from "zod";

export const myToolSchema = {
  input: z.object({
    param1: z.string(),
    param2: z.number().optional()
  })
};

export async function handleMyTool({ param1, param2 = 0 }) {
  return {
    content: [{
      type: "text",
      text: `处理了参数：${param1}，${param2}`
    }]
  };
}
```

```typescript
// tools/index.ts
export * from './mytool';
```

## 开发新提示

1. 在`prompts`目录下定义新的提示模板
2. 在`prompts/index.ts`中导出
3. 在`server.ts`中注册

示例：

```typescript
// prompts/templates.ts
import { z } from "zod";

export const myPromptSchema = {
  params: z.object({
    topic: z.string()
  })
};

export function generateMyPrompt({ topic }) {
  return {
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `请帮我分析这个主题：${topic}`
      }
    }]
  };
}
```

## 测试

开发新功能后，可以通过以下方式测试：

1. 使用`mcpService`在应用中直接调用
2. 使用控制台日志输出结果
3. 创建单元测试（使用Vitest）

## 贡献指南

1. 创建功能分支
2. 实现功能并添加测试
3. 确保代码符合项目风格规范
4. 提交PR 