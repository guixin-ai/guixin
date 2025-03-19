use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{ContactUserLink, NewContactUserLink};
use crate::schema::contact_user_links;

pub struct ContactUserLinkRepository {
    pool: DbPool,
}

impl ContactUserLinkRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    // 创建新联系人用户链接
    pub fn create(&self, new_link: NewContactUserLink) -> RepositoryResult<ContactUserLink> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::insert_into(contact_user_links::table)
            .values(&new_link)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        contact_user_links::table
            .filter(contact_user_links::id.eq(&new_link.id))
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据ID查找联系人用户链接
    pub fn find_by_id(&self, id: &str) -> RepositoryResult<ContactUserLink> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        contact_user_links::table
            .filter(contact_user_links::id.eq(id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("联系人用户链接 ID: {}", id))
                }
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 根据用户ID查找联系人用户链接
    pub fn find_by_user_id(&self, user_id: &str) -> RepositoryResult<Vec<ContactUserLink>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        contact_user_links::table
            .filter(contact_user_links::user_id.eq(user_id))
            .load::<ContactUserLink>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 查找所有联系人用户链接
    pub fn find_all(&self) -> RepositoryResult<Vec<ContactUserLink>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        contact_user_links::table
            .load::<ContactUserLink>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 删除联系人用户链接
    pub fn delete(&self, id: &str) -> RepositoryResult<usize> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::delete(contact_user_links::table.filter(contact_user_links::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 创建新联系人用户链接（自动生成ID和时间戳）
    pub fn create_with_defaults(&self, user_id: String) -> RepositoryResult<ContactUserLink> {
        let now = Utc::now().naive_utc();
        let new_link = NewContactUserLink {
            id: Uuid::new_v4().to_string(),
            user_id,
            created_at: now,
        };

        self.create(new_link)
    }
}
