# 资源

从服务器向LLMs公开数据和内容

资源（Resources）是模型上下文协议（MCP）中的核心原语，允许服务器公开可被客户端读取并用作LLM交互上下文的数据和内容。

资源被设计为**应用程序控制**的，这意味着客户端应用程序可以决定如何以及何时使用它们。不同的MCP客户端可能会以不同方式处理资源。例如：

* Claude桌面版目前要求用户在使用资源之前明确选择它们
* 其他客户端可能会基于启发式算法自动选择资源
* 某些实现甚至可能允许AI模型自己决定使用哪些资源

服务器开发者在实现资源支持时应该准备好处理任何这些交互模式。为了自动向模型公开数据，服务器开发者应该使用**模型控制**的原语，如工具（Tools）。

## 概述

资源代表MCP服务器想要提供给客户端的任何类型的数据。这可以包括：

* 文件内容
* 数据库记录
* API响应
* 实时系统数据
* 截图和图像
* 日志文件
* 以及更多

每个资源都由唯一的URI标识，并且可以包含文本或二进制数据。

## 资源URI

资源使用以下格式的URI进行标识：

```
[协议]://[主机]/[路径]
```

例如：

* `file:///home/user/documents/report.pdf`
* `postgres://database/customers/schema`
* `screen://localhost/display1`

协议和路径结构由MCP服务器实现定义。服务器可以定义自己的自定义URI方案。

## 资源类型

资源可以包含两种类型的内容：

### 文本资源

文本资源包含UTF-8编码的文本数据。这些适用于：

* 源代码
* 配置文件
* 日志文件
* JSON/XML数据
* 纯文本

### 二进制资源

二进制资源包含以base64编码的原始二进制数据。这些适用于：

* 图像
* PDF文件
* 音频文件
* 视频文件
* 其他非文本格式

## 资源发现

客户端可以通过两种主要方法发现可用资源：

### 直接资源

服务器通过`resources/list`端点公开具体资源列表。每个资源包括：

```typescript
{
  uri: string;           // 资源的唯一标识符
  name: string;          // 人类可读的名称
  description?: string;  // 可选描述
  mimeType?: string;     // 可选MIME类型
}
```

### 资源模板

对于动态资源，服务器可以公开URI模板，客户端可以使用这些模板构造有效的资源URI：

```typescript
{
  uriTemplate: string;   // 遵循RFC 6570的URI模板
  name: string;          // 此类型的人类可读名称
  description?: string;  // 可选描述
  mimeType?: string;     // 所有匹配资源的可选MIME类型
}
```

## 读取资源

要读取资源，客户端使用资源URI发送`resources/read`请求。

服务器响应包含资源内容列表：

```typescript
{
  contents: [
    {
      uri: string;        // 资源的URI
      mimeType?: string;  // 可选MIME类型

      // 以下二选一：
      text?: string;      // 文本资源
      blob?: string;      // 二进制资源（base64编码）
    }
  ]
}
```

服务器可以响应一个`resources/read`请求返回多个资源。例如，当读取目录时，可以返回目录中的文件列表。

## 资源更新

MCP通过两种机制支持资源的实时更新：

### 列表变更

服务器可以通过`notifications/resources/list_changed`通知客户端其可用资源列表发生了变化。

### 内容变更

客户端可以订阅特定资源的更新：

1. 客户端发送带有资源URI的`resources/subscribe`
2. 当资源发生变化时，服务器发送`notifications/resources/updated`
3. 客户端可以使用`resources/read`获取最新内容
4. 客户端可以使用`resources/unsubscribe`取消订阅

## 示例实现

以下是在MCP服务器中实现资源支持的简单示例：

```typescript
const server = new Server({
  name: "example-server",
  version: "1.0.0"
}, {
  capabilities: {
    resources: {}
  }
});

// 列出可用资源
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "file:///logs/app.log",
        name: "应用日志",
        mimeType: "text/plain"
      }
    ]
  };
});

// 读取资源内容
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === "file:///logs/app.log") {
    const logContents = await readLogFile();
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: logContents
        }
      ]
    };
  }

  throw new Error("资源未找到");
});
```

## 最佳实践

在实现资源支持时：

1. 使用清晰、描述性的资源名称和URI
2. 包含有用的描述，以指导LLM理解
3. 在已知的情况下设置适当的MIME类型
4. 为动态内容实现资源模板
5. 对频繁变化的资源使用订阅
6. 使用清晰的错误消息优雅地处理错误
7. 为大型资源列表考虑分页
8. 在适当时缓存资源内容
9. 在处理前验证URI
10. 记录您的自定义URI方案

## 安全考虑

在公开资源时：

* 验证所有资源URI
* 实现适当的访问控制
* 净化文件路径以防止目录遍历
* 谨慎处理二进制数据
* 考虑对资源读取进行速率限制
* 审计资源访问
* 在传输中加密敏感数据
* 验证MIME类型
* 为长时间运行的读取实现超时
* 适当处理资源清理

## 用小朋友也能懂的话来说

想象一下，资源就像是各种宝藏🏆，放在不同的宝箱里！

**资源是什么？**就是AI小助手可以看到和使用的各种东西，比如故事书📚、照片🖼️、歌曲🎵等等。

当AI小助手需要帮你回答问题时，它可以打开这些宝箱看看里面有什么宝贝。

每个宝箱都有一个特殊的**地址**（这就是URI），比如"图书馆://故事书/小红帽.txt"。这个地址告诉AI去哪里找东西。

宝藏有两种类型：
- **文字宝藏**：像是故事书、笔记或者食谱📝
- **神奇宝藏**：像是照片、音乐或者视频🎬

AI小助手怎么知道有哪些宝箱呢？它可以问："有什么宝箱给我看吗？"（这是**资源发现**）。然后它会得到一份所有可用宝箱的清单。

当AI想要看宝箱里的东西时，它会说："请让我看看这个宝箱！"（这是**读取资源**）。宝箱就会打开，AI就能看到里面的内容了。

有些宝箱里的东西会不断变化（比如天气预报🌤️），所以AI可以说："请在内容变化时告诉我！"（这是**订阅**）。这样每当宝箱里的东西变了，AI就会立刻知道。

通过这种方式，AI小助手可以获取它需要的各种信息，更好地帮助你解决问题！✨ 