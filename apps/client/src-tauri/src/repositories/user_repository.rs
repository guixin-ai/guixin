use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{NewUser, User};
use crate::schema::users;

pub struct UserRepository {
    pool: DbPool,
}

impl UserRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    // 创建新用户
    pub fn create(&self, new_user: NewUser) -> RepositoryResult<User> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::insert_into(users::table)
            .values(&new_user)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        users::table
            .filter(users::id.eq(&new_user.id))
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据ID查找用户
    pub fn find_by_id(&self, id: &str) -> RepositoryResult<User> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        users::table
            .filter(users::id.eq(id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("用户 ID: {}", id))
                }
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 查找所有用户
    pub fn find_all(&self) -> RepositoryResult<Vec<User>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        users::table
            .load::<User>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 更新用户
    pub fn update(&self, id: &str, user: User) -> RepositoryResult<User> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(users::table.filter(users::id.eq(id)))
            .set((
                users::name.eq(&user.name),
                users::email.eq(&user.email),
                users::avatar_url.eq(&user.avatar_url),
                users::description.eq(&user.description),
                users::is_ai.eq(user.is_ai),
                users::cloud_id.eq(&user.cloud_id),
                users::sync_enabled.eq(user.sync_enabled),
                users::last_sync_time.eq(user.last_sync_time),
                users::theme.eq(&user.theme),
                users::language.eq(&user.language),
                users::font_size.eq(user.font_size),
                users::custom_settings.eq(&user.custom_settings),
                users::updated_at.eq(Utc::now().naive_utc()),
            ))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        self.find_by_id(id)
    }

    // 删除用户
    pub fn delete(&self, id: &str) -> RepositoryResult<usize> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::delete(users::table.filter(users::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 创建新用户（自动生成ID和时间戳）
    pub fn create_with_defaults(
        &self,
        name: String,
        email: Option<String>,
    ) -> RepositoryResult<User> {
        let now = Utc::now().naive_utc();
        let new_user = NewUser {
            id: Uuid::new_v4().to_string(),
            name,
            email,
            avatar_url: None,
            description: None,
            is_ai: false,
            cloud_id: None,
            sync_enabled: false,
            last_sync_time: None,
            theme: "light".to_string(),
            language: "zh-CN".to_string(),
            font_size: 14,
            custom_settings: None,
            created_at: now,
            updated_at: now,
        };

        self.create(new_user)
    }
}
