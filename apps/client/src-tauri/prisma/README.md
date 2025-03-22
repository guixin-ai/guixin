# Prisma 模式文件参考

本目录包含 Prisma 数据库模式和相关配置，**仅供参考**。实际项目中使用的是 Diesel ORM。

## 说明

这个 Prisma 配置文件 (`schema.prisma`) 只是作为数据库模型的可视化参考，不会在实际应用中使用。它提供了一种更直观的方式来查看和理解数据库结构。

## 数据模型

当前模型包括：

- `User`: 用户模型，包含用户基本信息
  - 包含 id、name、avatar_url、description 和 is_ai 字段
  - avatar_url 存储用户头像的URL
  - is_ai 用于标识用户是否为AI
- `Agent`: AI代理模型，与用户一对一关联
  - 包含 provider (模型提供商)
  - 包含 model_name (模型名称，如"Llama-3.2")
  - 包含 system_prompt (系统提示词，控制AI的行为)
  - 包含多种模型参数:
    - temperature (控制输出随机性)
    - top_p (影响token选择的多样性)
    - top_k (限制每步考虑的token数量)
    - repeat_penalty (重复惩罚系数)
    - stop_sequences (停止序列，以逗号分隔)
    - max_tokens (最大生成token数)
    - presence_penalty (存在惩罚)
    - frequency_penalty (频率惩罚)
  - 一个用户最多关联一个Agent
- `UserContact`: 用户联系人关系模型，表示用户与其他用户之间的联系人关系
  - 只存储用户ID和联系人ID的简单映射
- `Chat`: 聊天模型，表示一个聊天会话
  - 包含聊天名称(`name`)
  - 包含头像URL数组(`avatar_urls`)，以逗号分隔存储
  - 包含未读消息数量(`unread_count`)
  - 包含最后一条消息内容(`last_message`)
  - 包含最后一条消息时间(`last_message_time`)
- `ChatParticipant`: 聊天参与者模型，表示用户与聊天的多对多关系
  - 包含用户在特定聊天中的昵称(`nickname`)
  - 包含用户在特定聊天中的描述(`description`)
  - 允许用户在不同聊天中使用不同的昵称和描述
- `Message`: 消息模型，包含消息内容和发送者信息
- `Resource`: 资源模型，表示用户拥有的资源
  - 包含资源名称(`name`)和类型(`type`)
  - 类型字段(`type`)用于区分不同类型的资源，如"text"或"image"
  - 包含资源URL(`url`)，用于访问资源内容
  - 包含文件名(`file_name`)，用于标识资源文件
  - 包含可选的描述(`description`)
  - 每个资源都关联到一个用户，表示资源的所有者

这些模型与 Diesel ORM 中定义的模型保持一致，但使用 Prisma 的语法表示。

## 自动更新机制

数据库包含以下自动更新触发器：

- `update_users_updated_at`: 在用户更新时，自动更新更新时间
- `update_user_contacts_updated_at`: 在用户联系人关系更新时，自动更新更新时间
- `update_chats_updated_at`: 在聊天更新时，自动更新更新时间
- `update_messages_updated_at`: 在消息更新时，自动更新更新时间
- `update_chat_last_message`: 在新消息插入时，自动更新聊天的最后消息内容和时间
- `update_agents_updated_at`: 在Agent更新时，自动更新更新时间
- `update_chat_participants_updated_at`: 在聊天参与者信息更新时，自动更新更新时间
- `update_resources_updated_at`: 在资源更新时，自动更新更新时间

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
