# Prisma 模式文件参考

本目录包含 Prisma 数据库模式和相关配置，**仅供参考**。实际项目中使用的是 Diesel ORM。

## 说明

这个 Prisma 配置文件 (`schema.prisma`) 只是作为数据库模型的可视化参考，不会在实际应用中使用。它提供了一种更直观的方式来查看和理解数据库结构。

## 数据模型

当前模型包括：

- `User`: 用户模型，包含 id、name、description 和 is_ai 字段（is_ai 用于标识用户是否为AI）
- `UserContact`: 用户联系人关系模型，表示用户与其他用户之间的联系人关系
  - 只存储用户ID和联系人ID的简单映射
- `Chat`: 聊天模型，表示一个聊天会话
  - 包含未读消息数量(`unread_count`)
  - 包含最后一条消息内容(`last_message`)
  - 包含最后一条消息时间(`last_message_time`)
- `ChatParticipant`: 聊天参与者模型，表示用户与聊天的多对多关系
- `Message`: 消息模型，包含消息内容和发送者信息

这些模型与 Diesel ORM 中定义的模型保持一致，但使用 Prisma 的语法表示。

## 自动更新机制

数据库包含以下自动更新触发器：

- `update_users_updated_at`: 在用户更新时，自动更新更新时间
- `update_user_contacts_updated_at`: 在用户联系人关系更新时，自动更新更新时间
- `update_chats_updated_at`: 在聊天更新时，自动更新更新时间
- `update_messages_updated_at`: 在消息更新时，自动更新更新时间
- `update_chat_last_message`: 在新消息插入时，自动更新聊天的最后消息内容和时间

## 如何使用这个参考

您可以使用 Prisma Studio 来可视化查看这个数据模型：

```bash
npx prisma studio
```

这将打开一个网页界面，您可以在其中查看数据模型的结构。

## 实际项目中的数据库访问

实际项目中，数据库访问是通过 Rust 的 Diesel ORM 实现的，相关代码位于：

- `src/models.rs`: 数据模型定义
- `src/db.rs`: 数据库连接管理
- `src/lib.rs`: 数据库操作命令

## 数据库位置

默认情况下，数据库文件位于：

- Windows: `%APPDATA%\guixin\database.sqlite`
- macOS: `~/Library/Application Support/guixin/database.sqlite`
- Linux: `~/.local/share/guixin/database.sqlite`
