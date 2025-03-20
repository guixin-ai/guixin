# 数据库关系图

本文档描述了应用程序的数据库结构和表之间的关系。

## 实体关系图 (ERD)

```mermaid
erDiagram
    User ||--o{ Message : "发送"
    User ||--o{ ChatParticipant : "参与"
    Chat ||--o{ ChatParticipant : "包含"
    Chat ||--o{ Message : "包含"

    User {
        string id PK
        string name
        string description
        boolean is_ai
        datetime createdAt
        datetime updatedAt
    }

    Chat {
        string id PK
        datetime createdAt
        datetime updatedAt
    }

    ChatParticipant {
        string id PK
        datetime joinedAt
        string chatId FK "Chat.id"
        string userId FK "User.id"
    }

    Message {
        string id PK
        string content
        datetime createdAt
        datetime updatedAt
        string chatId FK "Chat.id"
        string senderId FK "User.id"
    }
```

## 基数关系图

下面使用类图表示各实体间的基数关系，更直观地展示一对一、一对多等关系：

```mermaid
classDiagram
    User "1" --> "*" Message : 发送
    User "1" --> "*" ChatParticipant : 参与
    Chat "1" --> "*" ChatParticipant : 包含
    Chat "1" --> "*" Message : 包含

    class User {
        +String id
        +String name
        +String description
        +Boolean is_ai
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Chat {
        +String id
        +DateTime createdAt
        +DateTime updatedAt
    }

    class ChatParticipant {
        +String id
        +DateTime joinedAt
        +String chatId
        +String userId
    }

    class Message {
        +String id
        +String content
        +DateTime createdAt
        +DateTime updatedAt
        +String chatId
        +String senderId
    }
```

## 关系类型说明

在上面的基数关系图中：

- **1对多关系 (1:N)**
  - User 与 Message：一个用户可以发送多条消息
  - User 与 ChatParticipant：一个用户可以参与多个聊天
  - Chat 与 ChatParticipant：一个聊天可以包含多个参与者
  - Chat 与 Message：一个聊天可以包含多条消息

- **多对多关系 (M:N)**
  - User 与 Chat：通过 ChatParticipant 表实现，一个用户可以参与多个聊天，一个聊天可以有多个用户参与

## 表关系说明

### 用户相关

1. **User (用户)**
   - 包含基本用户信息
   - 一个用户可以发送多条消息 (`messages`)
   - 一个用户可以参与多个聊天 (`chats`)

### 聊天相关

2. **Chat (聊天)**
   - 代表一个聊天会话
   - 包含多个参与者 (`participants`)
   - 包含多条消息 (`messages`)

3. **ChatParticipant (聊天参与者)**
   - 多对多关系表，连接Chat和User
   - 一个用户在一个聊天中只能有一个参与记录

4. **Message (消息)**
   - 包含消息内容
   - 有一个发送者 (`sender`)
   - 属于一个聊天 (`chat`)

## 主要业务流程

### 创建聊天流程

1. 创建一个Chat实例
2. 创建ChatParticipant记录，添加参与者

### 发送消息流程

1. 在指定Chat中创建Message，指定发送者

### 获取聊天历史流程

1. 查询指定Chat的所有Message
2. 按时间顺序排列显示
