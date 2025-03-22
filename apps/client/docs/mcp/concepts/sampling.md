# 采样

让您的服务器向LLMs请求补全内容

采样是MCP的一个强大功能，允许服务器通过客户端请求LLM补全内容，从而实现复杂的代理行为，同时保持安全性和隐私性。

请注意，Claude桌面客户端目前尚不支持MCP的这一功能。

## 采样的工作原理

采样流程遵循以下步骤：

1. 服务器向客户端发送`sampling/createMessage`请求
2. 客户端审查请求并可能修改它
3. 客户端从LLM获取采样结果
4. 客户端审查补全内容
5. 客户端将结果返回给服务器

这种人在环路中（human-in-the-loop）的设计确保用户能够控制LLM看到和生成的内容。

## 消息格式

采样请求使用标准化的消息格式：

```typescript
{
  messages: [
    {
      role: "user" | "assistant",
      content: {
        type: "text" | "image",

        // 对于文本：
        text?: string,

        // 对于图像：
        data?: string,             // base64编码
        mimeType?: string
      }
    }
  ],
  modelPreferences?: {
    hints?: [{
      name?: string                // 建议的模型名称/系列
    }],
    costPriority?: number,         // 0-1，最小化成本的重要性
    speedPriority?: number,        // 0-1，低延迟的重要性
    intelligencePriority?: number  // 0-1，能力的重要性
  },
  systemPrompt?: string,
  includeContext?: "none" | "thisServer" | "allServers",
  temperature?: number,
  maxTokens: number,
  stopSequences?: string[],
  metadata?: Record<string, unknown>
}
```

## 请求参数

### 消息

`messages`数组包含要发送给LLM的对话历史。每条消息包含：

* `role`：可以是"user"或"assistant"
* `content`：消息内容，可以是：  
   * 带有`text`字段的文本内容  
   * 带有`data`（base64）和`mimeType`字段的图像内容

### 模型偏好

`modelPreferences`对象允许服务器指定其模型选择偏好：

* `hints`：客户端可用于选择适当模型的模型名称建议数组：  
   * `name`：可以匹配完整或部分模型名称的字符串（例如"claude-3"，"sonnet"）  
   * 客户端可以将提示映射到不同提供商的等效模型  
   * 多个提示按偏好顺序评估
* 优先级值（0-1标准化）：  
   * `costPriority`：最小化成本的重要性  
   * `speedPriority`：低延迟响应的重要性  
   * `intelligencePriority`：高级模型能力的重要性

客户端根据这些偏好和其可用模型做出最终的模型选择。

### 系统提示

可选的`systemPrompt`字段允许服务器请求特定的系统提示。客户端可能会修改或忽略此项。

### 上下文包含

`includeContext`参数指定要包含哪些MCP上下文：

* `"none"`：无额外上下文
* `"thisServer"`：包含来自请求服务器的上下文
* `"allServers"`：包含来自所有已连接MCP服务器的上下文

客户端控制实际包含的上下文。

### 采样参数

通过以下参数微调LLM采样：

* `temperature`：控制随机性（0.0到1.0）
* `maxTokens`：生成的最大标记数
* `stopSequences`：停止生成的序列数组
* `metadata`：其他提供商特定参数

## 响应格式

客户端返回补全结果：

```typescript
{
  model: string,  // 使用的模型名称
  stopReason?: "endTurn" | "stopSequence" | "maxTokens" | string,
  role: "user" | "assistant",
  content: {
    type: "text" | "image",
    text?: string,
    data?: string,
    mimeType?: string
  }
}
```

## 示例请求

以下是向客户端请求采样的示例：

```json
{
  "method": "sampling/createMessage",
  "params": {
    "messages": [
      {
        "role": "user",
        "content": {
          "type": "text",
          "text": "当前目录中有哪些文件？"
        }
      }
    ],
    "systemPrompt": "你是一个有帮助的文件系统助手。",
    "includeContext": "thisServer",
    "maxTokens": 100
  }
}
```

## 最佳实践

在实现采样时：

1. 始终提供清晰、结构良好的提示
2. 适当处理文本和图像内容
3. 设置合理的标记限制
4. 通过`includeContext`包含相关上下文
5. 在使用前验证响应
6. 优雅地处理错误
7. 考虑对采样请求进行速率限制
8. 记录预期的采样行为
9. 使用各种模型参数进行测试
10. 监控采样成本

## 人类参与的控制

采样设计考虑了人类监督：

### 对于提示

* 客户端应向用户显示建议的提示
* 用户应能够修改或拒绝提示
* 系统提示可以被过滤或修改
* 上下文包含由客户端控制

### 对于补全内容

* 客户端应向用户显示补全内容
* 用户应能够修改或拒绝补全内容
* 客户端可以过滤或修改补全内容
* 用户控制使用哪个模型

## 安全考虑

在实现采样时：

* 验证所有消息内容
* 净化敏感信息
* 实施适当的速率限制
* 监控采样使用情况
* 加密传输中的数据
* 处理用户数据隐私
* 审计采样请求
* 控制成本暴露
* 实现超时
* 优雅地处理模型错误

## 常见模式

### 代理工作流

采样使以下代理模式成为可能：

* 读取和分析资源
* 基于上下文做出决策
* 生成结构化数据
* 处理多步骤任务
* 提供交互式帮助

### 上下文管理

上下文的最佳实践：

* 请求必要的最小上下文
* 清晰地结构化上下文
* 处理上下文大小限制
* 根据需要更新上下文
* 清理过时的上下文

### 错误处理

强大的错误处理应：

* 捕获采样失败
* 处理超时错误
* 管理速率限制
* 验证响应
* 提供备用行为
* 适当记录错误

## 局限性

了解这些限制：

* 采样依赖于客户端能力
* 用户控制采样行为
* 上下文大小有限制
* 可能应用速率限制
* 应考虑成本
* 模型可用性各不相同
* 响应时间各不相同
* 不支持所有内容类型

## 用小朋友也能懂的话来说

想象一下，采样就像是AI小助手在学校需要问老师一个问题🤔！

**采样是什么？**就是当AI服务器遇到一个难题，它可以"举手"向更聪明的AI老师（大语言模型）请教。不过，在问问题之前，它需要经过你（人类）的同意！

过程是这样的：
1. AI服务器写下它的问题📝
2. 你看到这个问题，可以修改或者说"可以问"👍
3. 问题被送到AI老师那里
4. AI老师给出答案
5. 你看到答案，可以修改或者说"可以使用"👍
6. 答案最后才会送回AI服务器

这就像是小朋友想问老师问题，但要先让家长看看问题是否合适，然后家长再检查老师的回答是否适合小朋友听。这样可以确保所有的对话都是安全且有帮助的！

AI服务器可以告诉你它想问的问题有多紧急（`speedPriority`），有多复杂（`intelligencePriority`），以及它愿意"付出"多少努力来得到答案（`costPriority`）。

有时候，AI服务器还会说："请把我正在看的这本书（上下文）也给老师看，这样老师能更好地回答我的问题。"

通过这种方式，AI服务器可以变得更聪明，解决更复杂的问题，同时你始终保持控制，确保一切都按照你希望的方式进行！✨ 