use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{MessageReceipt, NewMessageReceipt};
use crate::schema::message_receipts;

pub struct MessageReceiptRepository {
    pool: DbPool,
}

impl MessageReceiptRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    // 创建新消息接收记录
    pub fn create(&self, new_receipt: NewMessageReceipt) -> RepositoryResult<MessageReceipt> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::insert_into(message_receipts::table)
            .values(&new_receipt)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        message_receipts::table
            .filter(message_receipts::id.eq(&new_receipt.id))
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据ID查找消息接收记录
    pub fn find_by_id(&self, id: &str) -> RepositoryResult<MessageReceipt> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        message_receipts::table
            .filter(message_receipts::id.eq(id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("消息接收记录 ID: {}", id))
                }
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 根据消息ID查找消息接收记录
    pub fn find_by_message_id(&self, message_id: &str) -> RepositoryResult<Vec<MessageReceipt>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        message_receipts::table
            .filter(message_receipts::message_id.eq(message_id))
            .load::<MessageReceipt>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据接收者ID查找消息接收记录
    pub fn find_by_receiver_id(&self, receiver_id: &str) -> RepositoryResult<Vec<MessageReceipt>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        message_receipts::table
            .filter(message_receipts::receiver_id.eq(receiver_id))
            .order(message_receipts::created_at.desc())
            .load::<MessageReceipt>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据消息ID和接收者ID查找消息接收记录
    pub fn find_by_message_and_receiver(
        &self,
        message_id: &str,
        receiver_id: &str,
    ) -> RepositoryResult<MessageReceipt> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        message_receipts::table
            .filter(message_receipts::message_id.eq(message_id))
            .filter(message_receipts::receiver_id.eq(receiver_id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => RepositoryError::NotFound(format!(
                    "消息接收记录 message_id: {}, receiver_id: {}",
                    message_id, receiver_id
                )),
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 更新消息接收记录状态
    pub fn update_status(&self, id: &str, status: &str) -> RepositoryResult<MessageReceipt> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(message_receipts::table.filter(message_receipts::id.eq(id)))
            .set((
                message_receipts::status.eq(status),
                message_receipts::updated_at.eq(Utc::now().naive_utc()),
            ))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        self.find_by_id(id)
    }

    // 删除消息接收记录
    pub fn delete(&self, id: &str) -> RepositoryResult<usize> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::delete(message_receipts::table.filter(message_receipts::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 创建新消息接收记录（自动生成ID和时间戳）
    pub fn create_with_defaults(
        &self,
        message_id: String,
        receiver_id: String,
        status: String,
    ) -> RepositoryResult<MessageReceipt> {
        let now = Utc::now().naive_utc();
        let new_receipt = NewMessageReceipt {
            id: Uuid::new_v4().to_string(),
            status,
            created_at: now,
            updated_at: now,
            message_id,
            receiver_id,
        };

        self.create(new_receipt)
    }
}
