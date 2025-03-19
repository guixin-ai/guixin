# 获取聊天消息流程

本文档描述了获取特定聊天的消息记录的完整流程，从前端到后端的数据流向和处理步骤。

## 整体流程

```mermaid
flowchart TD
    A[用户界面] -->|请求获取聊天消息| B[Tauri 命令处理层]
    B -->|调用服务| C[聊天服务层]
    C -->|查询数据库| D[会话/消息仓库层]
    D -->|数据库查询| E[(SQLite 数据库)]
    E -->|返回消息数据| D
    D -->|返回消息列表| C
    C -->|返回消息数据| B
    B -->|返回消息结果| A
```

## 详细流程

```mermaid
sequenceDiagram
    participant User as 用户界面
    participant Commands as Tauri命令层<br>chat_commands.rs
    participant Service as 服务层<br>chat_service.rs
    participant ChatRepo as 聊天仓库层
    participant ConvRepo as 会话仓库层
    participant MsgRepo as 消息仓库层
    participant DB as 数据库<br>SQLite

    User->>Commands: 调用get_chat_messages<br>ChatID, 分页参数
    Commands->>Service: 调用ChatService.get_chat_messages

    Service->>ChatRepo: 验证聊天存在
    ChatRepo->>DB: 查询聊天记录
    DB-->>ChatRepo: 返回聊天数据

    Service->>ConvRepo: 获取聊天会话ID
    ConvRepo->>DB: 查询会话ID
    DB-->>ConvRepo: 返回会话ID

    Service->>MsgRepo: 查询消息列表(带详情)
    MsgRepo->>DB: 按会话ID查询消息(分页)
    DB-->>MsgRepo: 返回消息数据

    loop 可选：关联查询
        MsgRepo->>DB: 查询消息发送者信息
        DB-->>MsgRepo: 返回发送者数据
        MsgRepo->>DB: 查询消息接收状态
        DB-->>MsgRepo: 返回接收状态数据
        MsgRepo->>DB: 查询消息附件
        DB-->>MsgRepo: 返回附件数据
    end

    MsgRepo-->>Service: 返回完整消息列表
    Service-->>Commands: 返回消息数据
    Commands-->>User: 返回消息列表结果
```

## 数据流图

```mermaid
flowchart TB
    subgraph 前端
        A[用户界面] --> B[聊天消息列表]
        B --> C[Tauri API调用]
    end

    subgraph 后端 - Tauri命令层
        C --> D[get_chat_messages命令]
        D --> E[参数验证与处理]
    end

    subgraph 后端 - 服务层
        E --> F[ChatService实例]
        F --> G[验证聊天存在]
        G --> H[获取会话ID]
        H --> I[调用消息仓库]
    end

    subgraph 后端 - 仓库层
        I --> J[MessageRepository实例]
        J --> K[分页查询消息记录]
        K --> L[查询消息发送者信息]
        L --> M[查询消息接收状态]
        M --> N[查询消息附件]
    end

    N --> O[组装MessageWithDetails]
    O --> P[分页处理]
    P --> Q[返回消息列表]
    Q --> R[返回给服务层]
    R --> S[返回给命令层]
    S --> T[返回给前端]
    T --> U[更新UI显示]
```

## 数据模型关系

```mermaid
erDiagram
    CHAT ||--|| CONVERSATION : "拥有"
    CONVERSATION ||--o{ MESSAGE : "包含"
    USER ||--o{ MESSAGE : "发送"
    MESSAGE ||--o{ MESSAGE_RECEIPT : "有接收记录"
    USER ||--o{ MESSAGE_RECEIPT : "接收消息"
    MESSAGE ||--o{ ATTACHMENT : "有附件"
```

## 注意事项

1. 消息查询支持分页，避免一次加载过多数据
2. 返回的消息包含发送者信息、接收状态和附件信息
3. 消息默认按时间倒序排序，从新到旧
4. 前端可以通过指定页码和每页消息数进行灵活加载
5. 消息查询经过多层验证，确保数据安全和一致性

## 关键代码解析

### 1. 前端调用

用户在前端调用Tauri命令获取聊天消息：

```javascript
// 前端示例代码
await invoke('get_chat_messages', {
  chatId: 'chat-123',
  page: 1,
  pageSize: 20,
}).then(messages => {
  // 处理返回的消息列表
  console.log(messages);
});
```

### 2. Tauri命令处理 (chat_commands.rs)

```rust
#[command]
pub fn get_chat_messages(
    state: State<AppState>,
    request: GetChatMessagesRequest,
) -> Result<Vec<MessageWithDetails>, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ChatService::new(pool.clone());

    let page = request.page.unwrap_or(1);
    let page_size = request.page_size.unwrap_or(20);

    service.get_chat_messages(&request.chat_id, page, page_size)
        .map_err(|e| format!("获取聊天消息失败: {}", e))
}
```

### 3. 服务层处理 (chat_service.rs)

```rust
pub fn get_chat_messages(
    &self,
    chat_id: &str,
    page: u32,
    page_size: u32,
) -> RepositoryResult<Vec<MessageWithDetails>> {
    // 1. 检查聊天是否存在
    self.chat_repository.find_by_id(chat_id)?;

    // 2. 获取聊天的会话ID
    let conversation = self.conversation_repository.find_one_by_chat_id(chat_id)?;

    // 3. 获取会话的消息
    self.message_repository.find_by_conversation_with_details(
        &conversation.id,
        page,
        page_size
    )
}
```

### 4. 仓库层处理 (message_repository.rs)

```rust
pub fn find_by_conversation_with_details(
    &self,
    conversation_id: &str,
    page: u32,
    page_size: u32
) -> RepositoryResult<Vec<MessageWithDetails>> {
    let messages = self.find_by_conversation_id_paginated(conversation_id, page, page_size)?;

    // 将Message转换为MessageWithDetails
    let messages_with_details = messages.into_iter()
        .map(|msg| MessageWithDetails {
            id: msg.id,
            content: msg.content,
            content_type: msg.content_type,
            status: msg.status,
            created_at: msg.created_at,
            updated_at: msg.updated_at,
            conversation_id: msg.conversation_id.clone(),
            sender_id: msg.sender_id.clone(),
            sender_name: None, // 需要关联查询用户表获取
            receipts: vec![], // 需要关联查询消息接收表获取
            attachments: vec![], // 需要关联查询附件表获取
        })
        .collect();

    Ok(messages_with_details)
}
```

## 完整处理流程

1. 用户请求获取特定聊天的消息记录
2. Tauri命令层接收请求，验证并解析参数
3. 聊天服务层验证聊天存在性，获取对应会话ID
4. 消息仓库层执行分页查询，获取基本消息数据
5. 可选：关联查询发送者信息、接收状态和附件
6. 组装完整的消息数据，包含所有详细信息
7. 返回分页后的消息列表给前端
8. 前端更新UI，展示聊天消息

## 优化建议

1. 可以实现消息缓存机制，减少重复查询
2. 考虑使用WebSocket实现实时消息推送
3. 前端可实现虚拟滚动，提高大量消息的显示性能
4. 对于图片和文件类消息，可实现懒加载和缩略图预览
5. 添加消息搜索功能，方便用户查找历史消息
