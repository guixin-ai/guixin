// 聊天仓库

use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::RepositoryError;
use crate::db::DbPool;
use crate::models::{Chat, NewChat};
use crate::schema::chats;

pub struct ChatRepository;

impl ChatRepository {
    // 创建聊天
    pub fn create(pool: &DbPool) -> Result<Chat, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let new_chat = NewChat {
            id: Uuid::new_v4().to_string(),
            unread_count: 0, // 初始未读消息为0
            last_message: None, // 初始没有最后消息
            last_message_time: None, // 初始没有最后消息时间
            created_at: Utc::now().naive_utc(),
            updated_at: Utc::now().naive_utc(),
        };

        diesel::insert_into(chats::table)
            .values(&new_chat)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        let chat = chats::table
            .filter(chats::id.eq(&new_chat.id))
            .select(Chat::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(chat)
    }

    // 获取聊天
    pub fn get(pool: &DbPool, id: &str) -> Result<Chat, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let chat = chats::table
            .filter(chats::id.eq(id))
            .select(Chat::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(chat)
    }

    // 获取所有聊天
    pub fn get_all(pool: &DbPool) -> Result<Vec<Chat>, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let chats_list = chats::table
            .select(Chat::as_select())
            .load(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(chats_list)
    }

    // 删除聊天
    pub fn delete(pool: &DbPool, id: &str) -> Result<(), RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        diesel::delete(chats::table.filter(chats::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(())
    }
} 