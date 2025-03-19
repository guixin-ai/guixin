use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{ChatParticipant, NewChatParticipant};
use crate::schema::chat_participants;

pub struct ChatParticipantRepository {
    pool: DbPool,
}

impl ChatParticipantRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    // 创建新聊天参与者
    pub fn create(&self, new_participant: NewChatParticipant) -> RepositoryResult<ChatParticipant> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::insert_into(chat_participants::table)
            .values(&new_participant)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        chat_participants::table
            .filter(chat_participants::id.eq(&new_participant.id))
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据ID查找聊天参与者
    pub fn find_by_id(&self, id: &str) -> RepositoryResult<ChatParticipant> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        chat_participants::table
            .filter(chat_participants::id.eq(id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("聊天参与者 ID: {}", id))
                }
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 根据聊天ID查找参与者
    pub fn find_by_chat_id(&self, chat_id: &str) -> RepositoryResult<Vec<ChatParticipant>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        chat_participants::table
            .filter(chat_participants::chat_id.eq(chat_id))
            .load::<ChatParticipant>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据用户ID查找参与的聊天
    pub fn find_by_user_id(&self, user_id: &str) -> RepositoryResult<Vec<ChatParticipant>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        chat_participants::table
            .filter(chat_participants::user_id.eq(user_id))
            .load::<ChatParticipant>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 查找特定聊天中的特定用户
    pub fn find_by_chat_and_user(
        &self,
        chat_id: &str,
        user_id: &str,
    ) -> RepositoryResult<ChatParticipant> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        chat_participants::table
            .filter(chat_participants::chat_id.eq(chat_id))
            .filter(chat_participants::user_id.eq(user_id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => RepositoryError::NotFound(format!(
                    "聊天 ID: {} 中未找到用户 ID: {}",
                    chat_id, user_id
                )),
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 更新聊天参与者角色
    pub fn update_role(&self, id: &str, role: &str) -> RepositoryResult<ChatParticipant> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(chat_participants::table.filter(chat_participants::id.eq(id)))
            .set(chat_participants::role.eq(role))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        self.find_by_id(id)
    }

    // 更新未读消息计数
    pub fn update_unread_count(
        &self,
        chat_id: &str,
        user_id: &str,
        count: i32,
    ) -> RepositoryResult<ChatParticipant> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(
            chat_participants::table
                .filter(chat_participants::chat_id.eq(chat_id))
                .filter(chat_participants::user_id.eq(user_id)),
        )
        .set(chat_participants::unread_count.eq(count))
        .execute(&mut conn)
        .map_err(RepositoryError::DatabaseError)?;

        self.find_by_chat_and_user(chat_id, user_id)
    }

    // 增加未读消息计数
    pub fn increment_unread_count(
        &self,
        chat_id: &str,
        user_id: &str,
    ) -> RepositoryResult<ChatParticipant> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(
            chat_participants::table
                .filter(chat_participants::chat_id.eq(chat_id))
                .filter(chat_participants::user_id.eq(user_id)),
        )
        .set(chat_participants::unread_count.eq(chat_participants::unread_count + 1))
        .execute(&mut conn)
        .map_err(RepositoryError::DatabaseError)?;

        self.find_by_chat_and_user(chat_id, user_id)
    }

    // 重置未读消息计数
    pub fn reset_unread_count(
        &self,
        chat_id: &str,
        user_id: &str,
    ) -> RepositoryResult<ChatParticipant> {
        self.update_unread_count(chat_id, user_id, 0)
    }

    // 更新最后读取的消息ID
    pub fn update_last_read_message(
        &self,
        chat_id: &str,
        user_id: &str,
        message_id: &str,
    ) -> RepositoryResult<ChatParticipant> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(
            chat_participants::table
                .filter(chat_participants::chat_id.eq(chat_id))
                .filter(chat_participants::user_id.eq(user_id)),
        )
        .set((
            chat_participants::last_read_message_id.eq(message_id),
            chat_participants::unread_count.eq(0),
        ))
        .execute(&mut conn)
        .map_err(RepositoryError::DatabaseError)?;

        self.find_by_chat_and_user(chat_id, user_id)
    }

    // 删除聊天参与者
    pub fn delete(&self, id: &str) -> RepositoryResult<usize> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::delete(chat_participants::table.filter(chat_participants::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 从聊天中移除用户
    pub fn remove_from_chat(&self, chat_id: &str, user_id: &str) -> RepositoryResult<usize> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::delete(
            chat_participants::table
                .filter(chat_participants::chat_id.eq(chat_id))
                .filter(chat_participants::user_id.eq(user_id)),
        )
        .execute(&mut conn)
        .map_err(RepositoryError::DatabaseError)
    }

    // 创建新聊天参与者（自动生成ID和时间戳）
    pub fn create_with_defaults(
        &self,
        chat_id: String,
        user_id: String,
        role: String,
    ) -> RepositoryResult<ChatParticipant> {
        let joined_at = Utc::now().naive_utc();
        let new_participant = NewChatParticipant {
            id: Uuid::new_v4().to_string(),
            joined_at,
            role,
            unread_count: 0,
            last_read_message_id: None,
            chat_id,
            user_id,
        };

        self.create(new_participant)
    }
}
