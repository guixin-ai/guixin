use serde::{Deserialize, Serialize};
use tauri::{command, State};

use crate::models::User;
use crate::repositories::RepositoryError;
use crate::services::user_service::UserService;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    name: String,
    description: Option<String>,
    is_ai: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserRequest {
    id: String,
    name: Option<String>,
    description: Option<String>,
    is_ai: Option<bool>,
}

// 创建用户
#[command]
pub fn create_user(state: State<AppState>, request: CreateUserRequest) -> Result<User, String> {
    let pool = state.db_pool.lock().unwrap();

    UserService::create_user(&pool, request.name, request.description, request.is_ai)
        .map_err(|e| format!("创建用户失败: {}", e))
}

// 获取所有用户
#[command]
pub fn get_all_users(state: State<AppState>) -> Result<Vec<User>, String> {
    let pool = state.db_pool.lock().unwrap();

    UserService::get_all_users(&pool)
        .map_err(|e| format!("获取用户失败: {}", e))
}

// 根据ID获取用户
#[command]
pub fn get_user_by_id(state: State<AppState>, id: String) -> Result<User, String> {
    let pool = state.db_pool.lock().unwrap();

    UserService::get_user(&pool, &id)
        .map_err(|e| match e {
            anyhow::Error::new(RepositoryError::NotFound(_)) => format!("用户不存在: {}", id),
            _ => format!("获取用户失败: {}", e),
        })
}

// 更新用户
#[command]
pub fn update_user(state: State<AppState>, request: UpdateUserRequest) -> Result<User, String> {
    let pool = state.db_pool.lock().unwrap();

    UserService::update_user(&pool, &request.id, request.name, request.description, request.is_ai)
        .map_err(|e| match e {
            anyhow::Error::new(RepositoryError::NotFound(_)) => format!("用户不存在: {}", request.id),
            _ => format!("更新用户失败: {}", e),
        })
}

// 删除用户
#[command]
pub fn delete_user(state: State<AppState>, id: String) -> Result<bool, String> {
    let pool = state.db_pool.lock().unwrap();

    UserService::delete_user(&pool, &id)
        .map(|_| true)
        .map_err(|e| match e {
            anyhow::Error::new(RepositoryError::NotFound(_)) => format!("用户不存在: {}", id),
            _ => format!("删除用户失败: {}", e),
        })
}

// 获取当前默认用户
#[command]
pub fn get_current_user(state: State<AppState>) -> Result<User, String> {
    // 直接从应用状态中获取当前用户
    let current_user = {
        let guard = state.current_user.lock().unwrap();
        guard.clone()
    };
    Ok(current_user)
}

// 创建AI用户
#[command]
pub fn create_ai_user(state: State<AppState>, name: String, description: Option<String>) -> Result<User, String> {
    let pool = state.db_pool.lock().unwrap();

    UserService::create_user(&pool, name, description, Some(true))
        .map_err(|e| format!("创建AI用户失败: {}", e))
}
