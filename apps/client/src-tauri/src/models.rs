use crate::schema::*;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

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

// UserContact 模型
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = user_contacts)]
pub struct UserContact {
    pub id: String,
    pub user_id: String,
    pub contact_id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = user_contacts)]
pub struct NewUserContact {
    pub id: String,
    pub user_id: String,
    pub contact_id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

// Chat 模型
#[derive(Queryable, Selectable, Debug, Serialize, Deserialize)]
#[diesel(table_name = chats)]
pub struct Chat {
    pub id: String,
    pub unread_count: i32,
    pub last_message: Option<String>,
    pub last_message_time: Option<NaiveDateTime>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Insertable, Debug, Deserialize)]
#[diesel(table_name = chats)]
pub struct NewChat {
    pub id: String,
    pub unread_count: i32,
    pub last_message: Option<String>,
    pub last_message_time: Option<NaiveDateTime>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
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
