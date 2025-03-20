use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{ChatParticipant, NewChatParticipant, User};
use crate::schema::{chat_participants, users};

pub struct ChatParticipantRepository;

impl ChatParticipantRepository {
    // 创建聊天参与者
    pub fn create(
        pool: &DbPool,
        chat_id: &str,
        user_id: &str,
    ) -> Result<ChatParticipant, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        // 检查是否已经存在
        let exists = chat_participants::table
            .filter(chat_participants::chat_id.eq(chat_id))
            .filter(chat_participants::user_id.eq(user_id))
            .count()
            .get_result::<i64>(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        if exists > 0 {
            return Err(RepositoryError::AlreadyExists(format!(
                "用户 {} 已经是聊天 {} 的参与者",
                user_id, chat_id
            )));
        }

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

    // 获取聊天的所有参与者
    pub fn get_by_chat(pool: &DbPool, chat_id: &str) -> Result<Vec<ChatParticipant>, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let participants = chat_participants::table
            .filter(chat_participants::chat_id.eq(chat_id))
            .select(ChatParticipant::as_select())
            .load(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(participants)
    }

    // 获取聊天的所有用户
    pub fn get_users_by_chat(pool: &DbPool, chat_id: &str) -> Result<Vec<User>, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let users_list = chat_participants::table
            .inner_join(users::table.on(users::id.eq(chat_participants::user_id)))
            .filter(chat_participants::chat_id.eq(chat_id))
            .select(User::as_select())
            .load(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(users_list)
    }

    // 获取用户参与的所有聊天
    pub fn get_by_user(pool: &DbPool, user_id: &str) -> Result<Vec<ChatParticipant>, RepositoryError> {
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

    // 移除用户从聊天
    pub fn remove_from_chat(pool: &DbPool, chat_id: &str, user_id: &str) -> Result<(), RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        diesel::delete(
            chat_participants::table
                .filter(chat_participants::chat_id.eq(chat_id))
                .filter(chat_participants::user_id.eq(user_id))
        )
        .execute(&mut conn)
        .map_err(RepositoryError::DatabaseError)?;

        Ok(())
    }
}
