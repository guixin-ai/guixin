use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::RepositoryError;
use crate::db::DbPool;
use crate::models::{NewUser, User};
use crate::schema::users;

pub struct UserRepository;

impl UserRepository {
    // 创建用户
    pub fn create(
        pool: &DbPool,
        name: String,
        description: Option<String>,
        is_ai: bool,
    ) -> Result<User, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let new_user = NewUser {
            id: Uuid::new_v4().to_string(),
            name,
            description,
            is_ai,
            created_at: Utc::now().naive_utc(),
            updated_at: Utc::now().naive_utc(),
        };

        diesel::insert_into(users::table)
            .values(&new_user)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        let user = users::table
            .filter(users::id.eq(&new_user.id))
            .select(User::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(user)
    }

    // 获取用户
    pub fn get(pool: &DbPool, id: &str) -> Result<User, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let user = users::table
            .filter(users::id.eq(id))
            .select(User::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(user)
    }

    // 获取所有用户
    pub fn get_all(pool: &DbPool) -> Result<Vec<User>, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let users_list = users::table
            .select(User::as_select())
            .load(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(users_list)
    }

    // 更新用户
    pub fn update(
        pool: &DbPool,
        id: &str,
        name: Option<String>,
        description: Option<String>,
        is_ai: Option<bool>,
    ) -> Result<User, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;
        let now = Utc::now().naive_utc();
        
        let target = users::table.filter(users::id.eq(id));
        
        // 根据提供的字段更新
        if let Some(name) = name {
            diesel::update(target.clone())
                .set(users::name.eq(name))
                .execute(&mut conn)
                .map_err(RepositoryError::DatabaseError)?;
        }
        
        if let Some(description) = description {
            diesel::update(target.clone())
                .set(users::description.eq(description))
                .execute(&mut conn)
                .map_err(RepositoryError::DatabaseError)?;
        }
        
        if let Some(is_ai) = is_ai {
            diesel::update(target.clone())
                .set(users::is_ai.eq(is_ai))
                .execute(&mut conn)
                .map_err(RepositoryError::DatabaseError)?;
        }
        
        // 更新时间
        diesel::update(target)
            .set(users::updated_at.eq(now))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        let updated_user = users::table
            .filter(users::id.eq(id))
            .select(User::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(updated_user)
    }

    // 删除用户
    pub fn delete(pool: &DbPool, id: &str) -> Result<(), RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        diesel::delete(users::table.filter(users::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(())
    }
}
