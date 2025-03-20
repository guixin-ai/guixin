use crate::schema::*;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

// Agent 模型
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize, Clone)]
#[diesel(table_name = agents)]
pub struct Agent {
    pub id: String,
    pub name: String,
    pub model_name: String,
    pub system_prompt: String,
    pub temperature: f32,
    pub max_tokens: Option<i32>,
    pub top_p: Option<f32>,
    pub avatar_url: Option<String>,
    pub description: Option<String>,
    pub is_streaming: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub user_id: Option<String>,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = agents)]
pub struct NewAgent {
    pub id: String,
    pub name: String,
    pub model_name: String,
    pub system_prompt: String,
    pub temperature: f32,
    pub max_tokens: Option<i32>,
    pub top_p: Option<f32>,
    pub avatar_url: Option<String>,
    pub description: Option<String>,
    pub is_streaming: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub user_id: Option<String>,
}

// Attachment 模型
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = attachments)]
pub struct Attachment {
    pub id: String,
    pub file_name: String,
    pub file_type: String,
    pub file_size: i32,
    pub file_path: String,
    pub thumbnail_path: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub message_id: String,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = attachments)]
pub struct NewAttachment {
    pub id: String,
    pub file_name: String,
    pub file_type: String,
    pub file_size: i32,
    pub file_path: String,
    pub thumbnail_path: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub message_id: String,
}

// ChatParticipant 模型
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = chat_participants)]
pub struct ChatParticipant {
    pub id: String,
    pub joined_at: NaiveDateTime,
    pub chat_id: String,
    pub user_id: String,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = chat_participants)]
pub struct NewChatParticipant {
    pub id: String,
    pub joined_at: NaiveDateTime,
    pub chat_id: String,
    pub user_id: String,
}

// Chat 模型
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = chats)]
pub struct Chat {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = chats)]
pub struct NewChat {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

// 带有详细信息的聊天结构体
#[derive(Debug, Serialize, Deserialize)]
pub struct ChatWithDetails {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub last_message: Option<MessageDetails>,
    pub participants: Vec<UserDetails>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserDetails {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub is_ai: bool,
}

impl From<User> for UserDetails {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            name: user.name,
            description: user.description,
            is_ai: user.is_ai,
        }
    }
}

// ContactGroup 模型
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = contact_groups)]
pub struct ContactGroup {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = contact_groups)]
pub struct NewContactGroup {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
}

// ContactUserLink 模型 - 新增
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = contact_user_links)]
pub struct ContactUserLink {
    pub id: String,
    pub user_id: String,
    pub created_at: NaiveDateTime,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = contact_user_links)]
pub struct NewContactUserLink {
    pub id: String,
    pub user_id: String,
    pub created_at: NaiveDateTime,
}

// Contact 模型 - 修改
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = contacts)]
pub struct Contact {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub group_id: String,
    pub owner_id: String,
    pub user_link_id: String,
}

// 联系人与分组联合查询结果
#[derive(Debug, Serialize, Deserialize)]
pub struct ContactWithGroup {
    pub contact: Contact,
    pub group: ContactGroup,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = contacts)]
pub struct NewContact {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub group_id: String,
    pub owner_id: String,
    pub user_link_id: String,
}

// Conversation 模型
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = conversations)]
pub struct Conversation {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub chat_id: String,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = conversations)]
pub struct NewConversation {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub chat_id: String,
}

// MessageReceipt 模型 - 新增
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = message_receipts)]
pub struct MessageReceipt {
    pub id: String,
    pub status: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub message_id: String,
    pub receiver_id: String,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = message_receipts)]
pub struct NewMessageReceipt {
    pub id: String,
    pub status: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub message_id: String,
    pub receiver_id: String,
}

// Message 模型
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = messages)]
pub struct Message {
    pub id: String,
    pub content: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub chat_id: String,
    pub sender_id: String,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = messages)]
pub struct NewMessage {
    pub id: String,
    pub content: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub chat_id: String,
    pub sender_id: String,
}

// 消息详情
#[derive(Debug, Serialize, Deserialize)]
pub struct MessageDetails {
    pub id: String,
    pub content: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub sender: UserDetails,
}

impl Message {
    pub fn to_details(self, sender: User) -> MessageDetails {
        MessageDetails {
            id: self.id,
            content: self.content,
            created_at: self.created_at,
            updated_at: self.updated_at,
            sender: sender.into(),
        }
    }
}

// User 模型
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize, Clone)]
#[diesel(table_name = users)]
pub struct User {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub is_ai: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = users)]
pub struct NewUser {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub is_ai: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}
