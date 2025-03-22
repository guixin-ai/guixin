# AI队列模型 (ai-queue.model.ts)

这个模型提供了AI回复队列的数据结构和状态管理功能，用于处理聊天中的AI回复消息。它使用zustand状态管理库实现，使组件可以直接访问和操作队列状态。

## 主要接口

### AIMember

AI成员信息接口，描述AI助手的基本信息。

```typescript
interface AIMember {
  id: string;           // AI成员唯一ID
  name: string;         // AI成员名称
  avatar: string;       // 头像
  description?: string; // 系统提示词/描述
  isAI: boolean;        // 是否为AI（通常为true）
}
```

### AIQueueItem

队列项接口，表示一个待处理的AI回复任务。

```typescript
interface AIQueueItem {
  chatId: string;         // 聊天ID
  messageId: string;      // 消息ID
  aiMember: AIMember;     // AI成员信息
  modelName: string;      // 使用的模型名称
  options?: {             // 模型参数选项
    temperature?: number; // 温度参数
    top_p?: number;       // 采样参数
    [key: string]: any;   // 其他可能的参数
  };
  abortController?: AbortController; // 用于中止请求
  status: 'pending' | 'processing' | 'completed' | 'error'; // 队列项状态
  createdAt: number;      // 创建时间戳
  updatedAt: number;      // 更新时间戳
  errorMessage?: string;  // 错误消息（如果有）
}
```

### AIResponseHandlers

回调处理器接口，用于处理AI响应的各个阶段。

```typescript
interface AIResponseHandlers {
  onStart?: (messageId: string, aiMember: AIMember) => void;        // 开始生成
  onContent?: (messageId: string, content: string, aiMember: AIMember) => void;  // 内容更新
  onComplete?: (messageId: string, fullContent: string, aiMember: AIMember) => void; // 完成生成
  onError?: (messageId: string, error: Error, aiMember: AIMember) => void;  // 生成出错
}
```

## 状态接口 (AIQueueState)

### 字段

- `queueItems`: 按聊天ID分组的队列项
- `processingItems`: 当前正在处理的队列项，按聊天ID索引
- `chatHistoryCache`: 消息历史缓存，按聊天ID存储
- `responseHandlers`: 响应处理器，按聊天ID存储

### 方法

#### 队列管理

- `addToQueue`: 添加AI项到队列
- `cancelChat`: 取消特定聊天中的所有AI响应
- `cancelAll`: 取消所有AI响应
- `getQueueStatus`: 获取队列状态信息

#### 消息历史管理

- `updateChatHistory`: 更新特定聊天的历史记录
- `addMessageToHistory`: 添加单条消息到历史记录
- `getChatHistory`: 获取特定聊天的历史记录

#### 处理器管理

- `registerHandlers`: 注册响应处理器
- `cancelProcessing`: 取消处理中的队列项
- `startProcessing`: 开始处理队列项
- `completeProcessing`: 完成处理队列项
- `errorProcessing`: 处理队列项出错

## 历史消息管理

AI队列模型内置了历史消息管理功能，用于跟踪和记录每个聊天的消息历史，以便AI生成连贯的回复。

### 历史消息的数据结构

历史消息使用 Ollama API 兼容的格式存储，每条消息包含角色和内容：

```typescript
interface OllamaMessage {
  role: 'user' | 'assistant' | 'system'; // 消息角色：用户、助手或系统
  content: string;                      // 消息内容
}
```

### 历史消息的存储方式

历史消息根据聊天ID存储在 `chatHistoryCache` 中，这是一个映射结构：

```typescript
chatHistoryCache: Record<string, OllamaMessage[]>
```

每个聊天ID对应一个消息数组，按照时间顺序排列。

### 历史消息管理方法

#### 初始化或更新整个历史记录

当需要设置聊天的完整历史记录时，使用 `updateChatHistory` 方法：

```typescript
updateChatHistory(chatId: string, messages: OllamaMessage[]): void
```

此方法会替换指定聊天的所有历史消息。通常在以下情况使用：
- 聊天初始化时
- 从外部数据源加载历史消息时
- 需要重置聊天上下文时

#### 添加单条消息

当用户发送新消息或AI回复完成时，使用 `addMessageToHistory` 方法添加单条消息：

```typescript
addMessageToHistory(chatId: string, message: OllamaMessage): void
```

此方法将新消息追加到历史记录末尾，保持消息的时间顺序。

#### 获取历史记录

需要访问历史消息时，使用 `getChatHistory` 方法：

```typescript
getChatHistory(chatId: string): OllamaMessage[]
```

返回指定聊天的完整历史消息数组。

### 历史消息的自动管理

模型还提供了历史消息的自动管理功能：

1. **AI回复完成时自动添加**：当 `completeProcessing` 方法被调用时，会自动将AI的回复添加到历史记录中：

```typescript
completeProcessing(chatId, messageId, content) {
  // ...其他逻辑...
  
  // 将回复添加到历史记录
  const currentHistory = state.chatHistoryCache[chatId] || [];
  state.chatHistoryCache[chatId] = [...currentHistory, {
    role: 'assistant',
    content: content
  }];
  
  // ...其他逻辑...
}
```

2. **在聊天页面中集成**：聊天页面组件在发送用户消息时，会将消息同步添加到历史记录：

```typescript
// 格式化消息为Ollama格式
const chatHistory: OllamaMessage[] = messages.map(msg => ({
  role: msg.isSelf ? 'user' : 'assistant',
  content: msg.content,
}));

// 更新历史记录
updateChatHistory(chatId, chatHistory);
```

### 历史消息在AI处理中的应用

使用历史消息实现连续对话的关键在于：

1. 获取最新的历史记录：
```typescript
const messages = getChatHistory(chatId);
```

2. 将历史记录传递给AI处理器：
```typescript
await aiProcessor.process({
  // ...其他参数...
  messages, // 包含完整对话历史
  // ...其他参数...
});
```

3. AI处理器会将历史消息与当前提问结合，生成上下文相关的回复。

### 消息历史管理的优势

- **独立的状态管理**：历史消息与UI状态分离，便于管理
- **按聊天分组**：每个聊天都有独立的历史记录，互不干扰
- **自动同步**：AI回复自动添加到历史记录，确保下次对话的连贯性
- **格式兼容**：直接使用Ollama API兼容格式，无需转换

## 使用示例

### 基本用法

```typescript
import { useAIQueueStore } from '@/models/ai-queue.model';

// 获取状态和方法
const {
  addToQueue,
  cancelChat,
  getChatHistory,
  registerHandlers
} = useAIQueueStore();

// 注册处理器
const unregister = registerHandlers(chatId, {
  onStart: (messageId, aiMember) => {
    console.log('开始生成回复', messageId);
  },
  onComplete: (messageId, content, aiMember) => {
    console.log('完成生成回复', messageId, content);
  }
});

// 添加到队列
addToQueue({
  chatId: 'chat-123',
  messageId: 'msg-456',
  aiMember: {
    id: 'ai-1',
    name: 'AI助手',
    avatar: '/images/ai-avatar.png',
    isAI: true
  },
  modelName: 'gemma3:1b'
});

// 取消处理
cancelChat('chat-123');

// 组件卸载时取消注册
useEffect(() => {
  return () => {
    unregister();
  };
}, []);
```

### 在组件中监听队列变化

```typescript
import { useAIQueueStore } from '@/models/ai-queue.model';

// 通过选择器提取需要的状态
const queueItems = useAIQueueStore(state => state.queueItems);
const processingItems = useAIQueueStore(state => state.processingItems);

// 监听队列长度变化
useEffect(() => {
  const unsubscribe = useAIQueueStore.subscribe(
    (state) => state.queueItems[chatId]?.length || 0,
    (currentLength) => {
      if (currentLength > 0) {
        // 队列有新项目时的处理逻辑
      }
    }
  );
  
  return () => unsubscribe();
}, [chatId]);
```

## 与aiProcessor服务的配合使用

需要与`ai-processor.service.ts`配合使用来处理实际的AI请求。模型层负责状态管理，而服务层负责API调用：

```typescript
import { aiProcessor } from '@/services/ai-processor.service';

// 获取队列中的下一个项目并处理
const processNextItem = async () => {
  const { queueItems, processingItems, getChatHistory } = useAIQueueStore.getState();
  
  // 如果当前已有处理中的项目，则不处理
  if (processingItems[chatId]) return;
  
  // 获取该聊天的队列
  const chatQueue = queueItems[chatId] || [];
  if (chatQueue.length === 0) return;
  
  // 获取下一个队列项
  const nextItem = chatQueue[0];
  
  // 获取消息历史
  const messages = getChatHistory(chatId);
  
  // 处理该队列项
  await aiProcessor.process({
    chatId: nextItem.chatId,
    messageId: nextItem.messageId,
    aiMember: nextItem.aiMember,
    modelName: nextItem.modelName,
    messages,
    options: nextItem.options,
    abortController: nextItem.abortController,
    callbacks: { /* ... */ }
  });
};
``` 