# 选中聊天的流程文档

本文档描述了在聊天页面选中聊天的完整流程，从UI交互到数据流向和状态更新的处理步骤。

## 整体流程

```mermaid
flowchart TD
    A[用户界面点击] -->|选中聊天| B[调用setActiveChat]
    B -->|更新状态| C[ChatsStore状态更新]
    C -->|激活chatId变更| D[ChatsStore自动加载会话]
    D -->|调用服务| E[调用ChatService]
    E -->|读取数据库| F[(数据库)]
    E -->|返回数据| D
    D -->|更新当前会话状态| G[更新currentConversation]
    G -->|渲染UI| H[ChatConversationFeature显示]
    G -->|标记已读| I[重置未读计数]
```

## 详细流程

```mermaid
sequenceDiagram
    participant User as 用户界面
    participant ChatsPage as 聊天页面组件<br>src/pages/chat/chats.tsx
    participant ChatsStore as 聊天状态管理<br>src/models/chats-model.ts
    participant ConvFeature as 会话功能组件<br>src/features/chat-conversation-feature
    participant ChatService as 聊天服务<br>src/services/chat-service.ts
    participant DB as 数据库<br>SQLite

    User->>ChatsPage: 点击聊天项
    ChatsPage->>ChatsStore: 调用setActiveChat(chatId)
    ChatsStore->>ChatsStore: 更新activeChatId状态
    ChatsStore->>ChatsStore: 自动调用loadConversation(chatId)
    ChatsStore->>ChatService: 获取聊天信息getChatById
    ChatService->>DB: 查询聊天数据
    DB-->>ChatService: 返回聊天数据
    ChatService-->>ChatsStore: 返回Chat对象

    ChatsStore->>ChatService: 获取聊天参与者getChatParticipants
    ChatService->>DB: 查询参与者数据
    DB-->>ChatService: 返回参与者列表
    ChatService-->>ChatsStore: 返回Participant对象数组

    ChatsStore->>ChatService: 获取聊天消息getChatMessages
    ChatService->>DB: 查询消息记录(分页)
    DB-->>ChatService: 返回消息数据
    ChatService-->>ChatsStore: 返回MessageWithDetails数组

    ChatsStore->>ChatsStore: 创建Conversation对象
    ChatsStore->>ChatsStore: 更新状态(currentConversation)

    ChatsStore->>ChatService: 重置未读计数resetUnreadCount
    ChatService->>DB: 更新未读计数为0
    DB-->>ChatService: 返回操作结果
    ChatService-->>ChatsStore: 返回操作结果

    ChatsStore->>ChatsStore: 更新participants未读计数
    ChatsStore-->>ChatsPage: 状态更新，触发重渲染
    ChatsPage->>ConvFeature: 渲染对应chatId的会话组件
    ConvFeature->>ChatsStore: 获取currentConversation
    ChatsStore-->>ConvFeature: 返回会话数据
    ConvFeature-->>User: 显示聊天内容
```

## 数据流图

```mermaid
flowchart TB
    subgraph 用户界面
        A[聊天列表项] --> B[点击事件]
    end

    subgraph 状态管理 - ChatsStore
        B --> C[setActiveChat方法]
        C --> D[更新activeChatId]
        D --> E1[调用loadConversation]
        E1 --> G[获取聊天对象]
        G --> H[获取参与者数据]
        H --> Z[获取聊天消息]
        Z --> I[更新currentConversation]
        I --> J[标记消息已读]
    end

    subgraph 组件渲染
        D --> E[ChatPage组件重渲染]
        I --> F[ChatConversationFeature加载]
    end

    subgraph 服务层
        G --> K[chatService.getChatById]
        H --> L[chatService.getChatParticipants]
        Z --> X[chatService.getChatMessages]
        J --> M[chatService.resetUnreadCount]
    end

    subgraph 数据访问
        K --> N[数据库查询]
        L --> O[数据库查询]
        X --> Y[数据库查询]
        M --> P[数据库更新]
    end

    P --> Q[返回操作结果]
    Q --> R[更新聊天列表未读计数]
    R --> S[UI更新显示]
```

## 组件关系

```mermaid
erDiagram
    ChatPage ||--o{ ChatsStore : "使用"
    ChatPage ||--o{ UserStore : "使用"
    ChatPage ||--|| ChatConversationFeature : "包含"
    ChatConversationFeature ||--o{ ChatsStore : "使用"
    ChatsStore ||--o{ ChatService : "调用"
    ChatService ||--o{ Database : "访问"
```

## 关键代码解析

### 1. 聊天列表项点击处理 (src/pages/chat/chats.tsx)

```tsx
// 聊天列表项渲染与点击处理
filteredChats.map(chat => (
  <div
    key={chat.id}
    onClick={() => setActiveChat(chat.id)}
    className={`flex items-center p-3 cursor-pointer transition-all ${activeChatId === chat.id ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
  >
    {/* 聊天项内容 */}
  </div>
));
```

### 2. ChatsStore中的状态更新和自动加载会话 (src/models/chats-model.ts)

```typescript
setActiveChat: (chatId) => {
  set(state => {
    state.activeChatId = chatId;
    return state;
  });

  // 激活聊天后，立即加载会话
  const currentUser = useAppStore.getState().currentUser;
  if (currentUser && chatId) {
    get().loadConversation(chatId);
  }
},
```

### 3. 加载会话并获取消息 (src/models/chats-model.ts)

```typescript
loadConversation: async (chatId: string) => {
  try {
    set(state => {
      state.isLoadingConversation = true;
      state.loadError = null;
    });

    // 获取当前用户
    const currentUser = useAppStore.getState().currentUser;
    if (!currentUser) {
      throw new Error('未登录');
    }

    // 获取聊天信息
    const chat = await chatService.getChatById(chatId);

    // 获取聊天参与者
    const participants = await get().getChatParticipants(chatId);

    // 获取聊天消息
    const messages = await get().loadMessages(chatId);

    // 创建会话对象并更新状态
    set(state => {
      state.currentConversation = {
        id: chat.id,
        chatId: chat.id,
        title: chat.title,
        type: chat.type_,
        participants: participants,
        messages: messages,
        // ... 其他属性
      };
      state.isLoadingConversation = false;
    });

    // 标记为已读
    await get().resetUnreadCount(chatId, currentUser.id);
  } catch (err) {
    // 处理错误
  }
};
```

### 4. 会话组件获取数据并显示 (src/features/chat-conversation-feature.tsx)

```typescript
// 使用聊天store
const { loadConversation, sendMessage, currentConversation, isLoadingConversation, loadError } =
  useChatsStore();

// 监听currentConversation变化，更新activeChat
useEffect(() => {
  if (currentConversation) {
    setActiveChat({
      id: currentConversation.chatId,
      name: currentConversation.title,
      avatar: currentConversation.title.charAt(0).toUpperCase(),
    });
  }
}, [currentConversation]);

// 加载消息
const handleLoadMessages = async () => {
  return currentConversation ? currentConversation.messages : [];
};
```

### 5. 获取聊天消息 (src/services/chat-service.ts)

```typescript
/**
 * 获取聊天消息列表
 * @param request 获取聊天消息请求
 * @returns 消息列表及详情
 */
async getChatMessages(request: GetChatMessagesRequest): Promise<MessageWithDetails[]> {
  return await invoke<MessageWithDetails[]>('get_chat_messages', { request });
}
```

## 注意事项

1. 选中聊天时，ChatsStore中的activeChatId会更新
2. activeChatId变更会触发自动加载会话数据
3. 会话数据包括聊天详情、参与者信息和消息列表
4. 加载会话后，同时获取聊天消息并自动标记为已读
5. 加载会话后，会自动标记消息为已读并重置未读计数
6. 整个流程遵循单向数据流模式，符合React最佳实践
7. 状态管理使用Zustand，采用immer中间件实现不可变数据更新
8. 聊天数据全部存储在ChatsStore中，不再需要单独的会话存储
