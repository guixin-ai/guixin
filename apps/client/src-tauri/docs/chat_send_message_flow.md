# 用户发送消息到聊天的流程图

本文档描述了用户发送消息给聊天的完整流程，从前端到后端的数据流向和处理步骤。

## 整体流程

```mermaid
flowchart TD
    A[用户界面] -->|发送消息请求| B[Tauri 命令处理层]
    B -->|调用服务| C[聊天服务层]
    C -->|执行数据库操作| D[聊天仓库层]
    D -->|数据库事务| E[(SQLite 数据库)]
    D -->|返回创建的消息| C
    C -->|返回消息数据| B
    B -->|返回消息结果| A
```

## 详细流程

```mermaid
sequenceDiagram
    participant User as 用户界面
    participant Commands as Tauri命令层<br>chat_commands.rs
    participant Service as 服务层<br>chat_service.rs
    participant Repo as 仓库层<br>chat_repository.rs
    participant DB as 数据库<br>SQLite

    User->>Commands: 调用send_message<br>ChatID, 发送者ID, 内容, 内容类型
    Commands->>Service: 调用ChatService.send_message
    Service->>Repo: 验证聊天存在
    Repo->>DB: 查询聊天记录
    DB-->>Repo: 返回聊天数据
    Service->>Repo: 验证发送者是聊天参与者
    Repo->>DB: 查询参与者记录
    DB-->>Repo: 返回参与者数据
    Service->>Repo: 调用chat_repository.send_message<br>开始事务处理

    Note over Repo,DB: 开始数据库事务

    Repo->>DB: 查询会话ID
    DB-->>Repo: 返回会话ID
    Repo->>DB: 创建消息记录
    Repo->>DB: 查询所有接收者
    DB-->>Repo: 返回接收者列表

    loop 为每个接收者
        Repo->>DB: 创建消息接收记录
    end

    Repo->>DB: 更新接收者未读消息计数
    Repo->>DB: 查询发送者名称
    DB-->>Repo: 返回发送者名称
    Repo->>DB: 更新聊天最后消息信息
    Repo->>DB: 查询创建的消息
    DB-->>Repo: 返回消息数据

    Note over Repo,DB: 结束数据库事务

    Repo-->>Service: 返回创建的消息
    Service-->>Commands: 返回消息数据
    Commands-->>User: 返回发送结果
```

# 获取指定聊天的消息记录流程图

本部分描述了获取指定聊天的消息记录的完整流程，从前端到后端的数据流向和处理步骤。

## 整体流程

```mermaid
flowchart TD
    A[用户界面] -->|请求获取聊天消息| B[Tauri 命令处理层]
    B -->|调用服务| C[聊天服务层]
    C -->|查询数据库| D[消息仓库层]
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
    participant MsgRepo as 消息仓库层
    participant DB as 数据库<br>SQLite

    User->>Commands: 调用get_chat_messages<br>ChatID, 分页参数
    Commands->>Service: 调用ChatService.get_chat_messages

    Service->>ChatRepo: 验证聊天存在
    ChatRepo->>DB: 查询聊天记录
    DB-->>ChatRepo: 返回聊天数据

    Service->>ChatRepo: 获取聊天会话ID
    ChatRepo->>DB: 查询会话ID
    DB-->>ChatRepo: 返回会话ID

    Service->>MsgRepo: 查询消息列表
    MsgRepo->>DB: 按会话ID查询消息
    DB-->>MsgRepo: 返回消息数据

    loop 为每条消息
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
        J --> K[查询消息记录]
        K --> L[查询消息接收状态]
        L --> M[查询消息附件]
    end

    M --> N[组装消息数据]
    N --> O[分页处理]
    O --> P[返回消息列表]
    P --> Q[返回给服务层]
    Q --> R[返回给命令层]
    R --> S[返回给前端]
    S --> T[更新UI显示]
```

## 数据模型关系

```mermaid
erDiagram
    CHAT ||--o{ CHAT_PARTICIPANT : "包含"
    CHAT ||--|| CONVERSATION : "拥有"
    CONVERSATION ||--o{ MESSAGE : "包含"
    USER ||--o{ MESSAGE : "发送"
    USER ||--o{ CHAT_PARTICIPANT : "参与"
    MESSAGE ||--o{ MESSAGE_RECEIPT : "有接收记录"
    USER ||--o{ MESSAGE_RECEIPT : "接收消息"
    MESSAGE ||--o{ ATTACHMENT : "有附件"
```

## 注意事项

1. 消息查询应支持分页，避免一次加载过多数据
2. 返回消息时应包含发送者信息、接收状态和附件信息
3. 消息应按时间顺序排序，通常最新的消息在最下方
4. 前端应处理不同类型的消息显示（文本、图片、文件等）
5. 可以考虑实现消息加载时的滚动加载机制，提高用户体验

## 关键代码解析

### 1. 前端调用

用户在前端调用Tauri命令发送消息：

```javascript
// 前端示例代码
await invoke('send_message', {
  chatId: 'chat-123',
  senderId: 'user-456',
  content: '你好！',
  contentType: 'text',
});
```

### 2. Tauri命令处理 (chat_commands.rs)

```rust
#[command]
pub fn send_message(
    state: State<AppState>,
    request: SendMessageRequest,
) -> Result<Message, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ChatService::new(pool.clone());

    service.send_message(
        &request.chat_id,
        &request.sender_id,
        request.content,
        request.content_type,
    )
    .map_err(|e| format!("发送消息失败: {}", e))
}
```

### 3. 服务层处理 (chat_service.rs)

```rust
pub fn send_message(
    &self,
    chat_id: &str,
    sender_id: &str,
    content: String,
    content_type: String,
) -> RepositoryResult<Message> {
    // 1. 检查聊天是否存在
    self.chat_repository.find_by_id(chat_id)?;

    // 2. 检查发送者是否是聊天参与者
    self.participant_repository.find_by_chat_and_user(chat_id, sender_id)?;

    // 3. 发送消息
    self.chat_repository.send_message(chat_id, sender_id, content, content_type)
}
```

### 4. 仓库层处理 (chat_repository.rs)

```rust
pub fn send_message(
    &self,
    chat_id: &str,
    sender_id: &str,
    content: String,
    content_type: String,
) -> RepositoryResult<Message> {
    let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

    conn.transaction(|conn| {
        // 事务处理，包括创建消息、更新未读计数等多个操作
        // ...
    })
    .map_err(RepositoryError::DatabaseError)
}
```

## 代码实现建议

### 1. Tauri命令层 (chat_commands.rs)

```rust
#[derive(Debug, Deserialize)]
pub struct GetChatMessagesRequest {
    chat_id: String,
    page: Option<u32>,
    page_size: Option<u32>,
}

/// 获取指定聊天的消息记录
///
/// # 参数
/// * `request` - 包含聊天ID和分页参数的请求
///
/// # 返回
/// * `Result<Vec<MessageWithDetails>, String>` - 成功返回消息列表，失败返回错误信息
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

### 2. 服务层实现 (chat_service.rs)

```rust
/// 获取指定聊天的消息记录
///
/// # 参数
/// * `chat_id` - 聊天ID
/// * `page` - 页码，从1开始
/// * `page_size` - 每页消息数量
///
/// # 返回
/// * `RepositoryResult<Vec<MessageWithDetails>>` - 消息列表及详情
pub fn get_chat_messages(
    &self,
    chat_id: &str,
    page: u32,
    page_size: u32,
) -> RepositoryResult<Vec<MessageWithDetails>> {
    // 1. 检查聊天是否存在
    self.chat_repository.find_by_id(chat_id)?;

    // 2. 获取聊天的会话ID
    let conversation = self.conversation_repository.find_by_chat_id(chat_id)?;

    // 3. 获取会话的消息
    self.message_repository.find_by_conversation_with_details(
        &conversation.id,
        page,
        page_size
    )
}
```

## 注意事项

1. 整个流程在一个数据库事务中完成，确保数据一致性
2. 为每个接收者创建消息接收记录，用于跟踪消息状态
3. 更新接收者的未读消息计数
4. 更新聊天的最后消息信息，便于前端显示聊天列表
5. 返回创建的消息数据给前端，用于更新聊天界面
