// 消息仓库

use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{Message, NewMessage};
use crate::schema::messages;

pub struct MessageRepository;

impl MessageRepository {
    // 创建消息
    pub fn create(
        pool: &DbPool,
        content: String,
        chat_id: &str,
        sender_id: &str,
    ) -> Result<Message, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let new_message = NewMessage {
            id: Uuid::new_v4().to_string(),
            content,
            created_at: Utc::now().naive_utc(),
            updated_at: Utc::now().naive_utc(),
            chat_id: chat_id.to_string(),
            sender_id: sender_id.to_string(),
        };

        diesel::insert_into(messages::table)
            .values(&new_message)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        let message = messages::table
            .filter(messages::id.eq(&new_message.id))
            .select(Message::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(message)
    }

    // 获取消息
    pub fn get(pool: &DbPool, id: &str) -> Result<Message, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let message = messages::table
            .filter(messages::id.eq(id))
            .select(Message::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(message)
    }

    // 获取聊天的所有消息
    pub fn get_by_chat_id(pool: &DbPool, chat_id: &str) -> Result<Vec<Message>, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let messages_list = messages::table
            .filter(messages::chat_id.eq(chat_id))
            .order(messages::created_at.asc())
            .select(Message::as_select())
            .load(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(messages_list)
    }

    // 获取用户的所有消息
    pub fn get_by_sender_id(pool: &DbPool, sender_id: &str) -> Result<Vec<Message>, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let messages_list = messages::table
            .filter(messages::sender_id.eq(sender_id))
            .order(messages::created_at.desc())
            .select(Message::as_select())
            .load(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(messages_list)
    }

    // 更新消息
    pub fn update(
        pool: &DbPool,
        id: &str,
        content: String,
    ) -> Result<Message, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        diesel::update(messages::table.filter(messages::id.eq(id)))
            .set((
                messages::content.eq(content),
                messages::updated_at.eq(Utc::now().naive_utc()),
            ))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        let updated_message = messages::table
            .filter(messages::id.eq(id))
            .select(Message::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(updated_message)
    }

    // 删除消息
    pub fn delete(pool: &DbPool, id: &str) -> Result<(), RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        diesel::delete(messages::table.filter(messages::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(())
    }
} 