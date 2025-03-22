# 提示

创建可重用的提示模板和工作流

提示（Prompts）使服务器能够定义可重用的提示模板和工作流，客户端可以轻松地将其呈现给用户和LLMs。它们提供了一种强大的方式来标准化和共享常见的LLM交互。

提示被设计为**用户控制**的，这意味着它们从服务器公开给客户端，目的是让用户能够明确选择它们来使用。

## 概述

MCP中的提示是预定义的模板，可以：

* 接受动态参数
* 包含来自资源的上下文
* 链接多个交互
* 指导特定工作流
* 作为UI元素呈现（如斜杠命令）

## 提示结构

每个提示的定义包含：

```typescript
{
  name: string;              // 提示的唯一标识符
  description?: string;      // 人类可读的描述
  arguments?: [              // 可选的参数列表
    {
      name: string;          // 参数标识符
      description?: string;  // 参数描述
      required?: boolean;    // 参数是否必需
    }
  ]
}
```

## 发现提示

客户端可以通过`prompts/list`端点发现可用的提示：

```typescript
// 请求
{
  method: "prompts/list"
}

// 响应
{
  prompts: [
    {
      name: "analyze-code",
      description: "分析代码以寻找潜在改进",
      arguments: [
        {
          name: "language",
          description: "编程语言",
          required: true
        }
      ]
    }
  ]
}
```

## 使用提示

要使用提示，客户端发送`prompts/get`请求：

```typescript
// 请求
{
  method: "prompts/get",
  params: {
    name: "analyze-code",
    arguments: {
      language: "python"
    }
  }
}

// 响应
{
  description: "分析Python代码以寻找潜在改进",
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: "请分析以下Python代码以寻找潜在改进：\n\n```python\ndef calculate_sum(numbers):\n    total = 0\n    for num in numbers:\n        total = total + num\n    return total\n\nresult = calculate_sum([1, 2, 3, 4, 5])\nprint(result)\n```"
      }
    }
  ]
}
```

## 动态提示

提示可以是动态的，并包括：

### 嵌入的资源上下文

```json
{
  "name": "analyze-project",
  "description": "分析项目日志和代码",
  "arguments": [
    {
      "name": "timeframe",
      "description": "分析日志的时间段",
      "required": true
    },
    {
      "name": "fileUri",
      "description": "要审查的代码文件URI",
      "required": true
    }
  ]
}
```

处理`prompts/get`请求时：

```json
{
  "messages": [
    {
      "role": "user",
      "content": {
        "type": "text",
        "text": "分析这些系统日志和代码文件是否有任何问题："
      }
    },
    {
      "role": "user",
      "content": {
        "type": "resource",
        "resource": {
          "uri": "logs://recent?timeframe=1h",
          "text": "[2024-03-14 15:32:11] ERROR: 在network.py:127中连接超时\n[2024-03-14 15:32:15] WARN: 重试连接（尝试2/3）\n[2024-03-14 15:32:20] ERROR: 超过最大重试次数",
          "mimeType": "text/plain"
        }
      }
    },
    {
      "role": "user",
      "content": {
        "type": "resource",
        "resource": {
          "uri": "file:///path/to/code.py",
          "text": "def connect_to_service(timeout=30):\n    retries = 3\n    for attempt in range(retries):\n        try:\n            return establish_connection(timeout)\n        except TimeoutError:\n            if attempt == retries - 1:\n                raise\n            time.sleep(5)\n\ndef establish_connection(timeout):\n    # 连接实现\n    pass",
          "mimeType": "text/x-python"
        }
      }
    }
  ]
}
```

### 多步骤工作流

```typescript
const debugWorkflow = {
  name: "debug-error",
  async getMessages(error: string) {
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `这是我看到的错误：${error}`
        }
      },
      {
        role: "assistant",
        content: {
          type: "text",
          text: "我将帮助分析这个错误。到目前为止你尝试了什么？"
        }
      },
      {
        role: "user",
        content: {
          type: "text",
          text: "我尝试重启服务，但错误仍然存在。"
        }
      }
    ];
  }
};
```

## 示例实现

以下是在MCP服务器中实现提示的完整示例：

```typescript
import { Server } from "@modelcontextprotocol/sdk/server";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types";

const PROMPTS = {
  "git-commit": {
    name: "git-commit",
    description: "生成Git提交消息",
    arguments: [
      {
        name: "changes",
        description: "Git差异或变更描述",
        required: true
      }
    ]
  },
  "explain-code": {
    name: "explain-code",
    description: "解释代码如何工作",
    arguments: [
      {
        name: "code",
        description: "要解释的代码",
        required: true
      },
      {
        name: "language",
        description: "编程语言",
        required: false
      }
    ]
  }
};

const server = new Server({
  name: "example-prompts-server",
  version: "1.0.0"
}, {
  capabilities: {
    prompts: {}
  }
});

// 列出可用提示
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: Object.values(PROMPTS)
  };
});

// 获取特定提示
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const prompt = PROMPTS[request.params.name];
  if (!prompt) {
    throw new Error(`找不到提示：${request.params.name}`);
  }

  if (request.params.name === "git-commit") {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `为这些变更生成简洁但描述性的提交信息：\n\n${request.params.arguments?.changes}`
          }
        }
      ]
    };
  }

  if (request.params.name === "explain-code") {
    const language = request.params.arguments?.language || "未知";
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `解释这段${language}代码是如何工作的：\n\n${request.params.arguments?.code}`
          }
        }
      ]
    };
  }

  throw new Error("找不到提示实现");
});
```

## 最佳实践

在实现提示时：

1. 使用清晰、描述性的提示名称
2. 为提示和参数提供详细描述
3. 验证所有必需参数
4. 优雅地处理缺失参数
5. 考虑提示模板的版本控制
6. 在适当时缓存动态内容
7. 实现错误处理
8. 记录预期的参数格式
9. 考虑提示的可组合性
10. 使用各种输入测试提示

## UI集成

提示可以在客户端UI中呈现为：

* 斜杠命令
* 快速操作
* 上下文菜单项
* 命令面板条目
* 引导式工作流
* 交互式表单

## 更新和变更

服务器可以通知客户端提示变更：

1. 服务器能力：`prompts.listChanged`
2. 通知：`notifications/prompts/list_changed`
3. 客户端重新获取提示列表

## 安全考虑

在实现提示时：

* 验证所有参数
* 净化用户输入
* 考虑速率限制
* 实现访问控制
* 审核提示使用情况
* 适当处理敏感数据
* 验证生成的内容
* 实现超时
* 考虑提示注入风险
* 记录安全要求

## 用小朋友也能懂的话来说

想象一下，提示就像是魔法咒语书📔，里面有很多不同的咒语配方！

**提示是什么？**就是帮助AI小助手更好地理解你想做什么的特殊指令。就像烹饪食谱一样，告诉AI应该怎么"烹饪"答案！

每个提示咒语都有一个特殊的名字，比如"分析代码"或"生成故事"。当你想使用某个咒语时，你只需要选择它，可能还需要添加一些特殊材料（这些就是"参数"）。

比如，如果你选择"讲故事"咒语，你可能需要告诉AI故事的主角是谁（参数1）和故事发生在哪里（参数2）。然后AI就会根据这个咒语配方，为你创造一个神奇的故事！

有些咒语非常聪明，可以使用宝箱里的宝物（资源）。比如"分析图片"咒语可以看你分享的照片，然后告诉你照片里有什么。

有些咒语甚至可以一步一步引导你，就像一个互动游戏🎮！先问你一个问题，根据你的回答再问下一个问题，最后帮你解决问题。

当软件开发者创建这些咒语时，他们会确保咒语是安全的，不会被坏巫师利用。他们会检查所有魔法材料，确保没有藏着什么小恶魔👹。

通过这些神奇的提示咒语，AI小助手可以更准确地理解你的需求，给你提供更好的帮助！✨ 