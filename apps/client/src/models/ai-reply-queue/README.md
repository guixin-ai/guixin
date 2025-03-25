# AI回复队列模型使用文档

这是一个AI消息回复队列管理模型，提供了队列状态管理、优先级处理和可视化支持。本文档介绍模型的使用方法和示例。

## 功能概述

- 管理AI消息回复的队列
- 支持消息优先级排序
- 多会话并行处理
- 进度跟踪和可视化
- 完整的事件通知机制
- 取消和错误处理

## 安装

模型已集成到项目中，无需额外安装。您只需导入即可使用：

```typescript
import { useAIReplyQueueStore } from '@/models';
```

## 基础用法

### 1. 添加回复到队列

```typescript
const { addToQueue } = useAIReplyQueueStore();

// 添加一个回复项到队列
const replyId = addToQueue({
  messageId: 'msg-123',           // 原始消息ID
  conversationId: 'conv-456',     // 会话ID
  content: '',                    // 初始内容
  priority: 10,                   // 优先级（数字越小优先级越高）
  modelName: 'gpt-3.5'            // 使用的模型
});
```

### 2. 处理回复进度和内容

```typescript
const { updateItemProgress, updateItemContent } = useAIReplyQueueStore();

// 更新处理进度
updateItemProgress(replyId, 30); // 更新进度为30%

// 更新内容
updateItemContent(replyId, '正在生成的回复内容...');
```

### 3. 完成或取消回复

```typescript
const { completeItem, failItem, cancelItem } = useAIReplyQueueStore();

// 完成回复
completeItem(replyId, '最终的回复内容');

// 处理失败
failItem(replyId, new Error('生成失败'));

// 取消回复
cancelItem(replyId);
```

### 4. 获取队列状态

```typescript
const { getQueueStats, getConversationItems } = useAIReplyQueueStore();

// 获取整体统计
const stats = getQueueStats();
console.log(`队列总数: ${stats.totalItems}, 处理中: ${stats.processingItems}`);

// 获取特定会话的队列项
const items = getConversationItems('conv-456');
console.log(`待处理: ${items.queued.length}, 处理中: ${items.processing ? 1 : 0}`);
```

## 事件监听

使用事件监听器响应队列变化：

```typescript
const { on } = useAIReplyQueueStore();

// 监听项目完成事件
const unsubscribe = on(AIReplyQueueEvents.ITEM_COMPLETED, (item) => {
  console.log(`回复已完成: ${item.id}`);
});

// 取消监听
unsubscribe();
```

可用的事件类型：
- `ITEM_ADDED`: 项目被添加到队列
- `ITEM_STARTED`: 开始处理项目 
- `ITEM_PROGRESS`: 项目进度更新
- `ITEM_COMPLETED`: 项目处理完成
- `ITEM_FAILED`: 项目处理失败
- `ITEM_CANCELLED`: 项目被取消
- `QUEUE_CHANGED`: 队列状态变化
- `PROCESSING_ITEM_CHANGED`: 处理中的项目变化

## 实战示例

### 与AI服务集成

```typescript
import { useAIReplyQueueStore } from '@/models';
import { aiService } from '@/services/ai.service';

async function sendMessage(message, conversationId) {
  const { addToQueue, updateItemContent, updateItemProgress, completeItem, failItem } = useAIReplyQueueStore();
  
  // 将消息添加到队列
  const replyId = addToQueue({
    messageId: message.id,
    conversationId,
    content: '',
    priority: 10,
    modelName: 'gemma-7b'
  });
  
  try {
    // 调用AI服务生成回复
    let accumulatedContent = '';
    
    await aiService.generateStreamingResponse({
      prompt: message.content,
      onContent: (chunk) => {
        // 更新累积内容
        accumulatedContent += chunk;
        // 更新队列项内容
        updateItemContent(replyId, accumulatedContent);
      },
      onProgress: (progress) => {
        // 更新进度
        updateItemProgress(replyId, progress);
      }
    });
    
    // 完成处理
    completeItem(replyId, accumulatedContent);
    
  } catch (error) {
    // 处理错误
    failItem(replyId, error);
    console.error('AI回复生成失败:', error);
  }
}
```

### 注册回调处理器

```typescript
const { registerHandlers } = useAIReplyQueueStore();

// 注册处理器
const unregister = registerHandlers('chat-component', {
  onStart: (item) => {
    // 显示加载指示器
    setIsLoading(true);
  },
  onContent: (item, content) => {
    // 更新聊天消息
    updateMessage(item.messageId, content);
  },
  onComplete: (item, finalContent) => {
    // 完成处理
    setIsLoading(false);
    markMessageComplete(item.messageId);
  },
  onFailed: (item, error) => {
    // 显示错误
    setIsLoading(false);
    showErrorMessage(error.message);
  }
});

// 组件卸载时取消注册
useEffect(() => {
  return () => {
    unregister();
  };
}, []);
```

## 可视化组件

以下是一些可集成到您应用中的UI组件示例：

### 进度指示器

```tsx
import React, { useEffect, useState } from 'react';
import { useAIReplyQueueStore, AIReplyQueueEvents } from '@/models';

export const AIProgressIndicator = ({ conversationId }) => {
  const { getConversationItems, on } = useAIReplyQueueStore();
  const [processing, setProcessing] = useState(getConversationItems(conversationId).processing);
  
  useEffect(() => {
    // 监听处理项变化
    const unsubscribe = on(AIReplyQueueEvents.PROCESSING_ITEM_CHANGED, (convId, item) => {
      if (convId === conversationId) {
        setProcessing(item);
      }
    });
    
    return unsubscribe;
  }, [conversationId]);
  
  if (!processing) return null;
  
  return (
    <div className="ai-progress-indicator">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${processing.progress || 0}%` }}
        />
      </div>
      <div className="progress-label">
        AI正在思考中... {processing.progress || 0}%
      </div>
    </div>
  );
};
```

### 会话队列组件

```tsx
import React, { useEffect, useState } from 'react';
import { useAIReplyQueueStore, AIReplyQueueEvents } from '@/models';

export const ConversationQueue = ({ conversationId }) => {
  const { getConversationItems, cancelItem, on } = useAIReplyQueueStore();
  const [items, setItems] = useState(getConversationItems(conversationId));
  
  useEffect(() => {
    const unsubscribe = on(AIReplyQueueEvents.QUEUE_CHANGED, () => {
      setItems(getConversationItems(conversationId));
    });
    
    return unsubscribe;
  }, [conversationId]);
  
  return (
    <div className="conversation-queue">
      {items.processing && (
        <div className="processing-item">
          <div className="model-name">{items.processing.modelName}</div>
          <div className="progress">{items.processing.progress || 0}%</div>
          <button onClick={() => cancelItem(items.processing.id)}>取消</button>
        </div>
      )}
      
      {items.queued.length > 0 && (
        <div className="queued-items">
          <h4>排队中 ({items.queued.length})</h4>
          {items.queued.map(item => (
            <div key={item.id} className="queue-item">
              <span>优先级: {item.priority}</span>
              <button onClick={() => cancelItem(item.id)}>取消</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 最佳实践

1. **设置适当的优先级**
   - 重要消息：1-5
   - 普通消息：10
   - 低优先级消息：20+

2. **始终处理错误**
   ```typescript
   try {
     // 处理逻辑
   } catch (error) {
     failItem(replyId, error);
   }
   ```

3. **使用取消令牌**
   ```typescript
   const signal = getAbortSignal(replyId);
   fetch(url, { signal });
   ```

4. **在合适的时机清理历史数据**
   ```typescript
   // 定期清理历史数据
   useEffect(() => {
     const interval = setInterval(() => {
       cleanupHistory();
     }, 60000);
     
     return () => clearInterval(interval);
   }, []);
   ```

5. **在组件卸载时取消相关队列项**
   ```typescript
   useEffect(() => {
     return () => {
       cancelConversationItems(conversationId);
     };
   }, [conversationId]);
   ```

## 常见问题

**Q: 为什么添加到队列的项目没有开始处理？**  
A: 可能是因为当前已达到最大并发处理数，或者该会话已有处理中的项目。

**Q: 如何调整队列的优先级？**  
A: 添加项目时设置更小的priority值可以提高优先级，或者调用optimizeQueue()重新排序。

**Q: 如何处理流式回复内容？**  
A: 使用updateItemContent方法更新内容，并使用updateItemProgress更新进度。

**Q: 如何在页面上显示队列状态？**  
A: 使用提供的统计API和React组件，或参照示例创建自定义组件。

## 更多信息

更多技术实现细节请参考[开发文档](./DEVELOPMENT.md)。 