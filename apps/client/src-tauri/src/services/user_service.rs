use diesel::prelude::*;
use uuid::Uuid;
use chrono::Utc;
use anyhow::{anyhow, Result};

use crate::db::{DbConnection, DbPool};
use crate::models::{User, NewUser};
use crate::schema::users;
use crate::repositories::user_repository::UserRepository;
use crate::repositories::user_contact_repository::UserContactRepository;

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

    // 创建AI用户
    pub fn create_ai_user(
        conn: &mut DbConnection,
        name: &str,
        description: Option<&str>,
    ) -> Result<User> {
        // 创建新的AI用户
        let new_user = NewUser {
            id: Uuid::new_v4().to_string(),
            name: name.to_string(),
            description: description.map(|desc| desc.to_string()),
            is_ai: true,
            created_at: Utc::now().naive_utc(),
            updated_at: Utc::now().naive_utc(),
        };

        diesel::insert_into(users::table)
            .values(&new_user)
            .execute(conn)
            .map_err(|e| anyhow!("创建AI用户失败: {}", e))?;

        users::table
            .filter(users::id.eq(&new_user.id))
            .select(User::as_select())
            .first(conn)
            .map_err(|e| anyhow!("获取新创建的AI用户失败: {}", e))
    }

    // 创建AI用户并添加为联系人
    pub fn create_ai_user_and_add_as_contact(
        pool: &DbPool,
        user_id: &str,
        name: &str,
        description: Option<&str>,
    ) -> Result<User> {
        // 获取连接
        let mut conn = pool.get().map_err(|e| anyhow!("获取数据库连接失败: {}", e))?;
        
        // 开始事务
        conn.transaction(|conn| {
            // 1. 创建AI用户
            let ai_user = Self::create_ai_user(conn, name, description)?;
            
            // 2. 添加为联系人 - 使用同一个事务连接
            UserContactRepository::create_with_conn(conn, user_id, &ai_user.id)
                .map_err(|e| anyhow!("添加联系人失败: {}", e))?;
            
            Ok(ai_user)
        })
    }
}
