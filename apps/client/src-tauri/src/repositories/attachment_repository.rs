use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{Attachment, NewAttachment};
use crate::schema::attachments;

pub struct AttachmentRepository {
    pool: DbPool,
}

impl AttachmentRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    // 创建新附件
    pub fn create(&self, new_attachment: NewAttachment) -> RepositoryResult<Attachment> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::insert_into(attachments::table)
            .values(&new_attachment)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        attachments::table
            .filter(attachments::id.eq(&new_attachment.id))
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据ID查找附件
    pub fn find_by_id(&self, id: &str) -> RepositoryResult<Attachment> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        attachments::table
            .filter(attachments::id.eq(id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("附件 ID: {}", id))
                }
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 根据消息ID查找附件
    pub fn find_by_message_id(&self, message_id: &str) -> RepositoryResult<Vec<Attachment>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        attachments::table
            .filter(attachments::message_id.eq(message_id))
            .load::<Attachment>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据文件类型查找附件
    pub fn find_by_file_type(&self, file_type: &str) -> RepositoryResult<Vec<Attachment>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        attachments::table
            .filter(attachments::file_type.eq(file_type))
            .load::<Attachment>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 查找所有附件
    pub fn find_all(&self) -> RepositoryResult<Vec<Attachment>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        attachments::table
            .load::<Attachment>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 更新附件
    pub fn update(&self, id: &str, attachment: Attachment) -> RepositoryResult<Attachment> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(attachments::table.filter(attachments::id.eq(id)))
            .set((
                attachments::file_name.eq(&attachment.file_name),
                attachments::file_type.eq(&attachment.file_type),
                attachments::file_size.eq(attachment.file_size),
                attachments::file_path.eq(&attachment.file_path),
                attachments::thumbnail_path.eq(&attachment.thumbnail_path),
                attachments::updated_at.eq(Utc::now().naive_utc()),
            ))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        self.find_by_id(id)
    }

    // 删除附件
    pub fn delete(&self, id: &str) -> RepositoryResult<usize> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::delete(attachments::table.filter(attachments::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 创建新附件（自动生成ID和时间戳）
    pub fn create_with_defaults(
        &self,
        file_name: String,
        file_type: String,
        file_size: i32,
        file_path: String,
        thumbnail_path: Option<String>,
        message_id: String,
    ) -> RepositoryResult<Attachment> {
        let now = Utc::now().naive_utc();
        let new_attachment = NewAttachment {
            id: Uuid::new_v4().to_string(),
            file_name,
            file_type,
            file_size,
            file_path,
            thumbnail_path,
            created_at: now,
            updated_at: now,
            message_id,
        };

        self.create(new_attachment)
    }
}
