use diesel::prelude::*;
use uuid::Uuid;
use chrono::Utc;
use anyhow::{anyhow, Result};

use crate::db::{DbConnection, DbPool};
use crate::models::{User, NewUser};
use crate::schema::users;
use crate::repositories::user_repository::UserRepository;

use super::ServiceResult;

pub struct UserService;

impl UserService {
    // 创建用户
    pub fn create_user(
        pool: &DbPool,
        name: String,
        description: Option<String>,
        is_ai: Option<bool>,
    ) -> ServiceResult<User> {
        let is_ai = is_ai.unwrap_or(false);
        let user = UserRepository::create(pool, name, description, is_ai)?;
        Ok(user)
    }

    // 获取用户
    pub fn get_user(pool: &DbPool, id: &str) -> ServiceResult<User> {
        let user = UserRepository::get(pool, id)?;
        Ok(user)
    }

    // 获取所有用户
    pub fn get_all_users(pool: &DbPool) -> ServiceResult<Vec<User>> {
        let users = UserRepository::get_all(pool)?;
        Ok(users)
    }

    // 更新用户
    pub fn update_user(
        pool: &DbPool,
        id: &str,
        name: Option<String>,
        description: Option<String>,
        is_ai: Option<bool>,
    ) -> ServiceResult<User> {
        let user = UserRepository::update(pool, id, name, description, is_ai)?;
        Ok(user)
    }

    // 删除用户
    pub fn delete_user(pool: &DbPool, id: &str) -> ServiceResult<()> {
        UserRepository::delete(pool, id)?;
        Ok(())
    }

    // 获取默认用户，如果不存在则创建
    pub fn get_default_user(conn: &mut DbConnection) -> Result<User> {
        // 尝试获取第一个用户
        let default_user = users::table
            .select(User::as_select())
            .first::<User>(conn)
            .optional()
            .map_err(|e| anyhow!("查询用户失败: {}", e))?;

        if let Some(user) = default_user {
            return Ok(user);
        }

        // 如果没有用户，创建一个默认用户
        let new_user = NewUser {
            id: Uuid::new_v4().to_string(),
            name: "默认用户".to_string(),
            description: Some("系统创建的默认用户".to_string()),
            is_ai: false,
            created_at: Utc::now().naive_utc(),
            updated_at: Utc::now().naive_utc(),
        };

        diesel::insert_into(users::table)
            .values(&new_user)
            .execute(conn)
            .map_err(|e| anyhow!("创建默认用户失败: {}", e))?;

        users::table
            .filter(users::id.eq(&new_user.id))
            .select(User::as_select())
            .first(conn)
            .map_err(|e| anyhow!("获取新创建的默认用户失败: {}", e))
    }
}
