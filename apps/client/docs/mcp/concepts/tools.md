# 工具

使LLMs能够通过您的服务器执行操作

工具是模型上下文协议（MCP）中的一个强大原语，使服务器能够向客户端公开可执行功能。通过工具，LLMs可以与外部系统交互，执行计算，并在现实世界中采取行动。

工具被设计为**模型控制**的，这意味着工具从服务器公开给客户端，目的是让AI模型能够自动调用它们（在有人类参与的情况下授予批准）。

## 概述

MCP中的工具允许服务器公开可被客户端调用并由LLMs用于执行操作的可执行函数。工具的关键方面包括：

* **发现**：客户端可以通过`tools/list`端点列出可用工具
* **调用**：工具使用`tools/call`端点调用，服务器执行请求的操作并返回结果
* **灵活性**：工具可以从简单计算到复杂API交互不等

与资源一样，工具由唯一名称标识，并可包含描述以指导其使用。然而，与资源不同，工具代表可以修改状态或与外部系统交互的动态操作。

## 工具定义结构

每个工具都使用以下结构定义：

```typescript
{
  name: string;          // 工具的唯一标识符
  description?: string;  // 人类可读的描述
  inputSchema: {         // 工具参数的JSON模式
    type: "object",
    properties: { ... }  // 特定工具的参数
  }
}
```

## 实现工具

以下是在MCP服务器中实现基本工具的示例：

```typescript
const server = new Server({
  name: "example-server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// 定义可用工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: "calculate_sum",
      description: "将两个数字相加",
      inputSchema: {
        type: "object",
        properties: {
          a: { type: "number" },
          b: { type: "number" }
        },
        required: ["a", "b"]
      }
    }]
  };
});

// 处理工具执行
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "calculate_sum") {
    const { a, b } = request.params.arguments;
    return {
      content: [
        {
          type: "text",
          text: String(a + b)
        }
      ]
    };
  }
  throw new Error("找不到工具");
});
```

## 示例工具模式

以下是服务器可以提供的工具类型示例：

### 系统操作

与本地系统交互的工具：

```typescript
{
  name: "execute_command",
  description: "运行shell命令",
  inputSchema: {
    type: "object",
    properties: {
      command: { type: "string" },
      args: { type: "array", items: { type: "string" } }
    }
  }
}
```

### API集成

包装外部API的工具：

```typescript
{
  name: "github_create_issue",
  description: "创建GitHub问题",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string" },
      body: { type: "string" },
      labels: { type: "array", items: { type: "string" } }
    }
  }
}
```

### 数据处理

转换或分析数据的工具：

```typescript
{
  name: "analyze_csv",
  description: "分析CSV文件",
  inputSchema: {
    type: "object",
    properties: {
      filepath: { type: "string" },
      operations: {
        type: "array",
        items: {
          enum: ["sum", "average", "count"]
        }
      }
    }
  }
}
```

## 最佳实践

实现工具时：

1. 提供清晰、描述性的名称和描述
2. 使用详细的JSON Schema定义参数
3. 在工具描述中包含示例，演示模型应如何使用它们
4. 实现适当的错误处理和验证
5. 对长操作使用进度报告
6. 保持工具操作集中和原子化
7. 记录预期的返回值结构
8. 实现适当的超时
9. 考虑对资源密集型操作进行速率限制
10. 记录工具使用情况以进行调试和监控

## 安全考虑

在公开工具时：

### 输入验证

* 根据模式验证所有参数
* 净化文件路径和系统命令
* 验证URL和外部标识符
* 检查参数大小和范围
* 防止命令注入

### 访问控制

* 在需要时实现身份验证
* 使用适当的授权检查
* 审计工具使用情况
* 限制请求速率
* 监控滥用行为

### 错误处理

* 不向客户端公开内部错误
* 记录与安全相关的错误
* 适当处理超时
* 在错误后清理资源
* 验证返回值

## 工具发现和更新

MCP支持动态工具发现：

1. 客户端可以随时列出可用工具
2. 服务器可以使用`notifications/tools/list_changed`通知客户端工具变更
3. 工具可以在运行时添加或删除
4. 工具定义可以更新（尽管应谨慎进行）

## 错误处理

工具错误应在结果对象中报告，而不是作为MCP协议级错误。这允许LLM查看并可能处理错误。当工具遇到错误时：

1. 在结果中将`isError`设置为`true`
2. 在`content`数组中包含错误详情

以下是工具正确错误处理的示例：

```typescript
try {
  // 工具操作
  const result = performOperation();
  return {
    content: [
      {
        type: "text",
        text: `操作成功：${result}`
      }
    ]
  };
} catch (error) {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: `错误：${error.message}`
      }
    ]
  };
}
```

这种方法允许LLM看到发生了错误，并可能采取纠正措施或请求人类干预。

## 测试工具

MCP工具的全面测试策略应涵盖：

* **功能测试**：验证工具使用有效输入正确执行，并适当处理无效输入
* **集成测试**：使用真实和模拟依赖项测试工具与外部系统的交互
* **安全测试**：验证身份验证、授权、输入净化和速率限制
* **性能测试**：检查负载下的行为、超时处理和资源清理
* **错误处理**：确保工具通过MCP协议正确报告错误并清理资源

## 用小朋友也能懂的话来说

想象一下，工具就像是AI小助手的魔法工具箱🧰，里面装满了各种神奇的工具！

**工具是什么？**就是让AI小助手能够做事情的神奇道具。就像你有铅笔可以画画，剪刀可以剪纸一样，AI也需要工具才能完成任务！

每个工具都有特定的用途。比如：
- "计算器工具"🔢可以帮AI快速计算复杂的数学问题
- "天气工具"🌦️可以告诉AI现在外面是晴天还是下雨
- "翻译工具"🗣️可以帮AI把一种语言变成另一种语言

当AI想要使用工具时，它会说："我需要用计算器工具算一下10+15是多少"。然后神奇的事情发生了！计算器工具会立刻运行，然后告诉AI："答案是25！"

但是，并不是所有工具都可以随便用。有些特别强大的工具需要先问你："我可以用这个工具吗？"这就像爸爸妈妈告诉你：使用剪刀或者火柴时需要大人在旁边一样，是为了安全考虑。

工具箱里的每个工具都有使用说明书，告诉AI："要用我，你需要告诉我这些信息..."。比如，翻译工具需要知道"要翻译的文字"和"翻译成什么语言"。

软件开发者会非常小心地制作这些工具，确保它们既好用又安全。他们会检查每个工具是否有尖锐的边缘（安全问题），并确保工具不会被调皮的人用来做坏事👮‍♂️。

通过这些神奇的工具，AI小助手不仅可以和你聊天，还可以为你做很多实际的事情，真正成为你的好帮手！✨ 