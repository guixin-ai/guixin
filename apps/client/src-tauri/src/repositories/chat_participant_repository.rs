// 聊天参与者仓库

use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::RepositoryError;
use crate::db::DbPool;
use crate::models::{ChatParticipant, NewChatParticipant};
use crate::schema::chat_participants;

pub struct ChatParticipantRepository;

impl ChatParticipantRepository {
    // 创建聊天参与者
    pub fn create(
        pool: &DbPool,
        chat_id: &str,
        user_id: &str,
    ) -> Result<ChatParticipant, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let new_participant = NewChatParticipant {
            id: Uuid::new_v4().to_string(),
            joined_at: Utc::now().naive_utc(),
            chat_id: chat_id.to_string(),
            user_id: user_id.to_string(),
        };

        diesel::insert_into(chat_participants::table)
            .values(&new_participant)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        let participant = chat_participants::table
            .filter(chat_participants::id.eq(&new_participant.id))
            .select(ChatParticipant::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(participant)
    }

    // 获取聊天参与者
    pub fn get(pool: &DbPool, id: &str) -> Result<ChatParticipant, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let participant = chat_participants::table
            .filter(chat_participants::id.eq(id))
            .select(ChatParticipant::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(participant)
    }

    // 根据聊天ID获取所有参与者
    pub fn get_by_chat_id(pool: &DbPool, chat_id: &str) -> Result<Vec<ChatParticipant>, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let participants = chat_participants::table
            .filter(chat_participants::chat_id.eq(chat_id))
            .select(ChatParticipant::as_select())
            .load(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(participants)
    }

    // 根据用户ID获取所有参与的聊天
    pub fn get_by_user_id(pool: &DbPool, user_id: &str) -> Result<Vec<ChatParticipant>, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let participants = chat_participants::table
            .filter(chat_participants::user_id.eq(user_id))
            .select(ChatParticipant::as_select())
            .load(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(participants)
    }

    // 删除聊天参与者
    pub fn delete(pool: &DbPool, id: &str) -> Result<(), RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        diesel::delete(chat_participants::table.filter(chat_participants::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(())
    }

    // 根据聊天ID和用户ID删除参与者
    pub fn delete_by_chat_and_user(
        pool: &DbPool,
        chat_id: &str,
        user_id: &str,
    ) -> Result<(), RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        diesel::delete(
            chat_participants::table
                .filter(chat_participants::chat_id.eq(chat_id))
                .filter(chat_participants::user_id.eq(user_id)),
        )
        .execute(&mut conn)
        .map_err(RepositoryError::DatabaseError)?;

        Ok(())
    }
} 