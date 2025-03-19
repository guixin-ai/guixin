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
    pub role: String,
    pub unread_count: i32,
    pub last_read_message_id: Option<String>,
    pub chat_id: String,
    pub user_id: String,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = chat_participants)]
pub struct NewChatParticipant {
    pub id: String,
    pub joined_at: NaiveDateTime,
    pub role: String,
    pub unread_count: i32,
    pub last_read_message_id: Option<String>,
    pub chat_id: String,
    pub user_id: String,
}

// Chat 模型
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = chats)]
pub struct Chat {
    pub id: String,
    pub title: String,
    pub type_: String,
    pub last_message_id: Option<String>,
    pub last_message_content: Option<String>,
    pub last_message_time: Option<NaiveDateTime>,
    pub last_message_sender_id: Option<String>,
    pub last_message_sender_name: Option<String>,
    pub last_message_type: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = chats)]
pub struct NewChat {
    pub id: String,
    pub title: String,
    pub type_: String,
    pub last_message_id: Option<String>,
    pub last_message_content: Option<String>,
    pub last_message_time: Option<NaiveDateTime>,
    pub last_message_sender_id: Option<String>,
    pub last_message_sender_name: Option<String>,
    pub last_message_type: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

// 带有详细信息的聊天结构体
#[derive(Debug, Serialize, Deserialize)]
pub struct ChatWithDetails {
    pub id: String,
    pub title: String,
    pub type_: String,
    pub last_message_id: Option<String>,
    pub last_message_content: Option<String>,
    pub last_message_time: Option<NaiveDateTime>,
    pub last_message_sender_name: Option<String>,
    pub last_message_type: Option<String>,
    pub unread_count: i32,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

impl From<Chat> for ChatWithDetails {
    fn from(chat: Chat) -> Self {
        Self {
            id: chat.id,
            title: chat.title,
            type_: chat.type_,
            last_message_id: chat.last_message_id,
            last_message_content: chat.last_message_content,
            last_message_time: chat.last_message_time,
            last_message_sender_name: chat.last_message_sender_name,
            last_message_type: chat.last_message_type,
            unread_count: 0, // 需要从 ChatParticipant 中获取
            created_at: chat.created_at,
            updated_at: chat.updated_at,
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

// Message 模型 - 修改
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = messages)]
pub struct Message {
    pub id: String,
    pub content: String,
    pub content_type: String,
    pub status: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub conversation_id: String,
    pub sender_id: String,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = messages)]
pub struct NewMessage {
    pub id: String,
    pub content: String,
    pub content_type: String,
    pub status: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub conversation_id: String,
    pub sender_id: String,
}

// 带有详细信息的消息结构体，包含发送者信息、接收状态和附件
#[derive(Debug, Serialize, Deserialize)]
pub struct MessageWithDetails {
    pub id: String,
    pub content: String,
    pub content_type: String,
    pub status: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub conversation_id: String,
    pub sender_id: String,
    pub sender_name: Option<String>,
    pub receipts: Vec<MessageReceipt>,
    pub attachments: Vec<Attachment>,
}

// User 模型
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize, Clone)]
#[diesel(table_name = users)]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: Option<String>,
    pub avatar_url: Option<String>,
    pub description: Option<String>,
    pub is_ai: bool,
    pub cloud_id: Option<String>,
    pub sync_enabled: bool,
    pub last_sync_time: Option<NaiveDateTime>,
    pub theme: String,
    pub language: String,
    pub font_size: i32,
    pub custom_settings: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = users)]
pub struct NewUser {
    pub id: String,
    pub name: String,
    pub email: Option<String>,
    pub avatar_url: Option<String>,
    pub description: Option<String>,
    pub is_ai: bool,
    pub cloud_id: Option<String>,
    pub sync_enabled: bool,
    pub last_sync_time: Option<NaiveDateTime>,
    pub theme: String,
    pub language: String,
    pub font_size: i32,
    pub custom_settings: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}
