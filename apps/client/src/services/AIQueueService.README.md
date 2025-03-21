# AI队列服务 (AIQueueService)

## 概述

AIQueueService 是一个全局服务，用于管理AI回复的生成队列。主要解决多个AI助手回复和页面切换时队列执行中断的问题。

当用户在聊天页面与AI对话时，即使切换到其他页面，AI的回复过程也会在后台继续进行，不会中断。

## 核心功能

- **全局消息队列**：维护所有AI回复的生成队列
- **页面切换不中断**：用户切换页面不会中断AI生成过程
- **多AI成员回复**：支持同一聊天中多个AI成员按顺序回复
- **历史消息自动衔接**：AI成员可以看到包括前一个AI回复在内的完整上下文
- **事件通知机制**：提供事件回调，方便UI响应状态变化
- **错误处理**：统一处理各类错误情况并通知UI

## 快速开始

### 第一步：导入服务

```typescript
import { aiQueueService } from '@/services/index';
```

### 第二步：在聊天组件中注册处理器

```typescript
useEffect(() => {
  // 定义当前聊天的消息处理器
  const handlers = {
    // 当AI开始回复时调用
    onStart: (messageId, aiMember) => {
      // 在UI中创建一个空消息气泡，等待内容填充
      const emptyMessage = {
        id: messageId,
        content: '',
        isSelf: false,
        senderId: aiMember.id,
        timestamp: new Date().toLocaleTimeString(),
        isStreaming: true
      };
      
      // 添加到消息列表
      addMessageToUI(emptyMessage);
    },
    
    // 当收到AI部分回复内容时调用
    onContent: (messageId, content, aiMember) => {
      // 更新UI中的消息内容
      updateMessageInUI(messageId, currentContent => currentContent + content);
    },
    
    // 当AI回复完成时调用
    onComplete: (messageId, fullContent, aiMember) => {
      // 完成消息，移除loading状态
      updateMessageInUI(messageId, fullContent, false);
    },
    
    // 当AI回复出错时调用
    onError: (messageId, error, aiMember) => {
      // 显示错误信息
      updateMessageInUI(messageId, error.message, false, true);
    }
  };
  
  // 注册处理器并获取取消注册函数
  const unregister = aiQueueService.registerHandlers(chatId, handlers);
  
  // 组件卸载时取消注册
  return () => unregister();
}, [chatId]);
```

### 第三步：初始化历史消息并添加AI成员到队列

```typescript
// 发送消息函数
const handleSend = () => {
  // 1. 处理用户消息
  const userMessage = {
    id: `user-${Date.now()}`,
    content: inputValue,
    isSelf: true,
    timestamp: new Date().toLocaleTimeString()
  };
  
  // 添加用户消息到UI和存储
  addMessageToUI(userMessage);
  addMessageToStorage(chatId, userMessage);
  
  // 清空输入框
  setInputValue('');
  
  // 2. 获取当前聊天中的所有AI成员
  const aiMembers = getChatAIMembers(chatId);
  if (aiMembers.length === 0) return;
  
  // 3. 获取聊天历史记录
  const chatHistory = getChatMessages(chatId).map(msg => ({
    role: msg.isSelf ? 'user' : 'assistant',
    content: msg.content
  }));
  
  // 4. 初始化历史消息
  aiQueueService.updateChatHistory(chatId, chatHistory);
  
  // 5. 添加最新的用户消息到历史
  aiQueueService.addMessageToHistory(chatId, {
    role: 'user',
    content: inputValue
  });
  
  // 6. 为每个AI成员创建回复任务
  aiMembers.forEach(aiMember => {
    // 生成唯一消息ID
    const messageId = `ai-${aiMember.id}-${Date.now()}`;
    
    // 添加到队列（注意这里不需要传递messages）
    aiQueueService.addToQueue({
      chatId,
      messageId,
      aiMember,
      modelName: 'gemma3:1b', // 可配置
      options: {
        temperature: 0.7,
        top_p: 0.9
      }
    });
  });
  
  // 7. 启动队列处理
  aiQueueService.startProcessing();
};
```

### 第四步：取消生成（可选）

```typescript
// 取消按钮点击处理
const handleCancelGeneration = () => {
  // 取消当前聊天的所有AI回复
  aiQueueService.cancelChat(chatId);
};

// 或取消所有聊天的AI回复（如退出应用时）
const handleCancelAll = () => {
  aiQueueService.cancelAll();
};
```

## 实现细节

### 历史消息的处理与消息链管理

AI队列服务内部维护了一个按聊天ID索引的历史消息缓存。当用户发送消息后，需要先初始化这个历史消息缓存，然后再添加AI成员到队列中。

与传统方法不同，AI队列项不再包含历史消息字段，而是在生成过程中动态获取最新的历史消息。这确保了每个AI成员都能看到完整的聊天历史，包括前一个AI成员的回复。

当某个AI回复完成后，系统会自动将这个回复添加到历史消息缓存中，作为后续AI成员回复的上下文。这种机制使得多个AI成员之间的对话更加连贯。

## API 参考

### 主要方法

#### registerHandlers(chatId, handlers)

注册特定聊天的消息处理器

```typescript
const unregister = aiQueueService.registerHandlers('chat-123', {
  onStart: (messageId, aiMember) => { /* ... */ },
  onContent: (messageId, content, aiMember) => { /* ... */ },
  onComplete: (messageId, fullContent, aiMember) => { /* ... */ },
  onError: (messageId, error, aiMember) => { /* ... */ }
});
```

返回一个取消注册的函数，应在组件卸载时调用。

#### updateChatHistory(chatId, messages)

更新特定聊天的历史记录

```typescript
aiQueueService.updateChatHistory('chat-123', [
  { role: 'user', content: '你好' },
  { role: 'assistant', content: '你好！有什么可以帮助你的吗？' }
]);
```

#### addMessageToHistory(chatId, message)

添加单条消息到历史记录

```typescript
aiQueueService.addMessageToHistory('chat-123', {
  role: 'user',
  content: '我想了解一下你的功能'
});
```

#### addToQueue(item)

添加AI回复任务到队列（不包含历史消息，也不会立即处理）

```typescript
aiQueueService.addToQueue({
  chatId: 'chat-123',
  messageId: 'ai-456-789',
  aiMember: {
    id: 'ai-456',
    name: 'AI助手',
    avatar: '/avatars/ai.png',
    isAI: true,
    description: '你是一个有帮助的AI助手'
  },
  modelName: 'gemma3:1b',
  options: {
    temperature: 0.7,
    top_p: 0.9
  }
});
```

#### startProcessing()

启动队列处理（需要在设置好初始历史消息后调用）

```typescript
aiQueueService.startProcessing();
```

#### getChatHistory(chatId)

获取特定聊天的历史记录

```typescript
const history = aiQueueService.getChatHistory('chat-123');
console.log(history);
```

#### cancelChat(chatId)

取消特定聊天的所有AI回复任务

```typescript
aiQueueService.cancelChat('chat-123');
```

#### cancelAll()

取消所有聊天的所有AI回复任务

```typescript
aiQueueService.cancelAll();
```

#### getQueueStatus()

获取当前队列状态

```typescript
const status = aiQueueService.getQueueStatus();
console.log(status);
// {
//   queueLength: 2,
//   isProcessing: true,
//   currentItem: {
//     chatId: 'chat-123',
//     messageId: 'ai-456-789',
//     aiMember: {
//       id: 'ai-456',
//       name: 'AI助手'
//     }
//   }
// }
```

### 事件监听

服务基于 EventEmitter 实现，可以监听特定事件：

```typescript
import { aiQueueService, AIQueueEvents } from '@/services/ai-queue.service';

// 监听队列变化
aiQueueService.on(AIQueueEvents.QUEUE_CHANGED, (status) => {
  console.log('队列状态:', status);
});

// 监听处理开始
aiQueueService.on(AIQueueEvents.PROCESSING_STARTED, (info) => {
  console.log('开始处理:', info);
});

// 监听处理完成
aiQueueService.on(AIQueueEvents.PROCESSING_COMPLETED, (info) => {
  console.log('处理完成:', info);
});

// 监听处理错误
aiQueueService.on(AIQueueEvents.PROCESSING_ERROR, (info) => {
  console.log('处理错误:', info);
});

// 监听队列清空
aiQueueService.on(AIQueueEvents.QUEUE_CLEARED, () => {
  console.log('队列已清空');
});

// 移除监听器
aiQueueService.removeListener(AIQueueEvents.QUEUE_CHANGED, handlerFunction);
```

## 最佳实践

1. **初始化历史再启动处理**：确保先调用`updateChatHistory`设置初始历史，再启动队列处理

   ```typescript
   // 正确的顺序
   aiQueueService.updateChatHistory(chatId, messages);
   aiQueueService.addToQueue({...}); // 可以添加多个
   aiQueueService.startProcessing();
   ```

2. **组件卸载时取消注册**：确保在组件卸载时取消处理器注册，避免内存泄漏

   ```typescript
   useEffect(() => {
     const unregister = aiQueueService.registerHandlers(chatId, handlers);
     return () => unregister();
   }, [chatId]);
   ```

3. **不要重复注册处理器**：一个聊天ID只需要注册一次处理器

4. **更新UI时注意性能**：在 onContent 回调中，避免频繁重渲染整个消息列表

5. **错误处理**：在 onError 回调中妥善处理错误，并向用户显示友好的错误信息

6. **取消生成**：提供明确的UI控件让用户取消正在进行的AI生成 