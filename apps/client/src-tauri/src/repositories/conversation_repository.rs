use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{Conversation, NewConversation};
use crate::schema::conversations;

pub struct ConversationRepository {
    pool: DbPool,
}

impl ConversationRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    // 创建新会话
    pub fn create(&self, new_conversation: NewConversation) -> RepositoryResult<Conversation> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::insert_into(conversations::table)
            .values(&new_conversation)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        conversations::table
            .filter(conversations::id.eq(&new_conversation.id))
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据ID查找会话
    pub fn find_by_id(&self, id: &str) -> RepositoryResult<Conversation> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        conversations::table
            .filter(conversations::id.eq(id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("会话 ID: {}", id))
                }
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 根据聊天ID查找会话列表
    pub fn find_by_chat_id(&self, chat_id: &str) -> RepositoryResult<Vec<Conversation>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        conversations::table
            .filter(conversations::chat_id.eq(chat_id))
            .order(conversations::created_at.desc())
            .load::<Conversation>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据聊天ID查找单个会话（通常聊天和会话是一对一的）
    pub fn find_one_by_chat_id(&self, chat_id: &str) -> RepositoryResult<Conversation> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        conversations::table
            .filter(conversations::chat_id.eq(chat_id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("聊天 ID: {} 的会话不存在", chat_id))
                }
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 查找所有会话
    pub fn find_all(&self) -> RepositoryResult<Vec<Conversation>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        conversations::table
            .order(conversations::created_at.desc())
            .load::<Conversation>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 更新会话
    pub fn update(&self, id: &str, conversation: Conversation) -> RepositoryResult<Conversation> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(conversations::table.filter(conversations::id.eq(id)))
            .set((
                conversations::chat_id.eq(&conversation.chat_id),
                conversations::updated_at.eq(Utc::now().naive_utc()),
            ))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        self.find_by_id(id)
    }

    // 删除会话
    pub fn delete(&self, id: &str) -> RepositoryResult<usize> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::delete(conversations::table.filter(conversations::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 创建新会话（自动生成ID和时间戳）
    pub fn create_with_defaults(&self, chat_id: String) -> RepositoryResult<Conversation> {
        let now = Utc::now().naive_utc();
        let new_conversation = NewConversation {
            id: Uuid::new_v4().to_string(),
            created_at: now,
            updated_at: now,
            chat_id,
        };

        self.create(new_conversation)
    }
}
