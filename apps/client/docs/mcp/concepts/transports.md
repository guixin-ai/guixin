# 传输

了解MCP的通信机制

传输（Transports）在模型上下文协议（MCP）中为客户端和服务器之间的通信提供基础。传输层处理消息如何发送和接收的底层机制。

## 消息格式

MCP使用JSON-RPC 2.0作为其传输格式。传输层负责将MCP协议消息转换为JSON-RPC格式以进行传输，并将接收到的JSON-RPC消息转换回MCP协议消息。

使用了三种类型的JSON-RPC消息：

### 请求

```typescript
{
  jsonrpc: "2.0",
  id: number | string,
  method: string,
  params?: object
}
```

### 响应

```typescript
{
  jsonrpc: "2.0",
  id: number | string,
  result?: object,
  error?: {
    code: number,
    message: string,
    data?: unknown
  }
}
```

### 通知

```typescript
{
  jsonrpc: "2.0",
  method: string,
  params?: object
}
```

## 内置传输类型

MCP包含两种标准传输实现：

### 标准输入/输出（stdio）

stdio传输通过标准输入和输出流实现通信。这对于本地集成和命令行工具特别有用。

在以下情况使用stdio：

* 构建命令行工具
* 实现本地集成
* 需要简单的进程通信
* 使用shell脚本

```typescript
const server = new Server({
  name: "example-server",
  version: "1.0.0"
}, {
  capabilities: {}
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### 服务器发送事件（SSE）

SSE传输使用HTTP POST请求实现服务器到客户端的流式传输，用于客户端到服务器的通信。

在以下情况使用SSE：

* 只需要服务器到客户端的流式传输
* 在受限网络中工作
* 实现简单更新

```typescript
import express from "express";

const app = express();

const server = new Server({
  name: "example-server",
  version: "1.0.0"
}, {
  capabilities: {}
});

let transport: SSEServerTransport | null = null;

app.get("/sse", (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  server.connect(transport);
});

app.post("/messages", (req, res) => {
  if (transport) {
    transport.handlePostMessage(req, res);
  }
});

app.listen(3000);
```

## 自定义传输

MCP使实现特定需求的自定义传输变得简单。任何传输实现只需符合Transport接口：

您可以为以下目的实现自定义传输：

* 自定义网络协议
* 专用通信渠道
* 与现有系统集成
* 性能优化

```typescript
interface Transport {
  // 开始处理消息
  start(): Promise<void>;

  // 发送JSON-RPC消息
  send(message: JSONRPCMessage): Promise<void>;

  // 关闭连接
  close(): Promise<void>;

  // 回调
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;
}
```

## 错误处理

传输实现应处理各种错误场景：

1. 连接错误
2. 消息解析错误
3. 协议错误
4. 网络超时
5. 资源清理

错误处理示例：

```typescript
class ExampleTransport implements Transport {
  async start() {
    try {
      // 连接逻辑
    } catch (error) {
      this.onerror?.(new Error(`连接失败: ${error}`));
      throw error;
    }
  }

  async send(message: JSONRPCMessage) {
    try {
      // 发送逻辑
    } catch (error) {
      this.onerror?.(new Error(`发送消息失败: ${error}`));
      throw error;
    }
  }
}
```

## 最佳实践

在实现或使用MCP传输时：

1. 正确处理连接生命周期
2. 实现适当的错误处理
3. 在连接关闭时清理资源
4. 使用适当的超时
5. 在发送前验证消息
6. 记录传输事件以进行调试
7. 在适当时实现重新连接逻辑
8. 处理消息队列中的背压
9. 监控连接健康状况
10. 实施适当的安全措施

## 安全考虑

在实现传输时：

### 身份验证和授权

* 实现适当的身份验证机制
* 验证客户端凭据
* 使用安全的令牌处理
* 实现授权检查

### 数据安全

* 对网络传输使用TLS
* 加密敏感数据
* 验证消息完整性
* 实现消息大小限制
* 净化输入数据

### 网络安全

* 实现速率限制
* 使用适当的超时
* 处理拒绝服务场景
* 监控异常模式
* 实现适当的防火墙规则

## 调试传输

调试传输问题的提示：

1. 启用调试日志
2. 监控消息流
3. 检查连接状态
4. 验证消息格式
5. 测试错误场景
6. 使用网络分析工具
7. 实现健康检查
8. 监控资源使用情况
9. 测试边缘情况
10. 使用适当的错误跟踪

## 用小朋友也能懂的话来说

想象一下，传输就像是AI小助手和你之间的各种送信方式📨！

**传输是什么？**就是AI小助手和其他程序之间互相传递消息的方法。就像人们可以通过打电话、发短信或写信来交流一样，AI程序也需要各种方式来互相交谈。

在MCP中，所有的消息都使用一种特殊的语言格式（叫做JSON-RPC）。这就像大家约定好用同一种语言交流，这样彼此都能听懂对方在说什么。

MCP有两种主要的"送信方式"：
1. **标准输入/输出（stdio）**：这就像是直接和AI面对面对话，非常直接和简单。
2. **服务器发送事件（SSE）**：这更像是AI给你发送电子邮件，而你通过填写表格来回复它。

有时候，这两种方式都不适合特殊需求，所以开发者可以创建自己的"送信方式"。就像如果你想要用鸽子传信或者用烟信号，也可以自己设计一套系统！

在设计这些通信方式时，开发者需要考虑一些重要问题：
- 如果"信使"迷路了怎么办？（错误处理）
- 如何确保只有对的人能读到信？（安全性）
- 如何知道信是否被篡改了？（数据完整性）
- 如果有坏人试图偷看信件怎么办？（加密）

通过这些精心设计的"送信系统"，AI小助手可以安全、高效地与各种程序交谈，为你提供无缝的服务体验！✨ 