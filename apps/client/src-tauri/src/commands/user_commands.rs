use serde::{Deserialize, Serialize};
use tauri::{command, State};

use crate::models::User;
use crate::repositories::error::RepositoryError;
use crate::services::UserService;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    name: String,
    email: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserRequest {
    id: String,
    name: String,
    email: Option<String>,
    avatar_url: Option<String>,
    description: Option<String>,
    is_ai: bool,
    cloud_id: Option<String>,
    sync_enabled: bool,
    theme: String,
    language: String,
    font_size: i32,
    custom_settings: Option<String>,
}

// 创建用户
#[command]
pub fn create_user(state: State<AppState>, request: CreateUserRequest) -> Result<User, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = UserService::new(pool.clone());

    service
        .create_user(request.name, request.email)
        .map_err(|e| format!("创建用户失败: {}", e))
}

// 获取所有用户
#[command]
pub fn get_all_users(state: State<AppState>) -> Result<Vec<User>, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = UserService::new(pool.clone());

    service
        .get_all_users()
        .map_err(|e| format!("获取用户失败: {}", e))
}

// 根据ID获取用户
#[command]
pub fn get_user_by_id(state: State<AppState>, id: String) -> Result<User, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = UserService::new(pool.clone());

    service.get_user_by_id(&id).map_err(|e| match e {
        RepositoryError::NotFound(_) => format!("用户不存在: {}", id),
        _ => format!("获取用户失败: {}", e),
    })
}

// 更新用户
#[command]
pub fn update_user(state: State<AppState>, request: UpdateUserRequest) -> Result<User, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = UserService::new(pool.clone());

    // 先获取现有用户
    let user_result = service.get_user_by_id(&request.id);
    if let Err(e) = user_result {
        return Err(match e {
            RepositoryError::NotFound(_) => format!("用户不存在: {}", request.id),
            _ => format!("获取用户失败: {}", e),
        });
    }

    let mut user = user_result.unwrap();

    // 更新字段
    user.name = request.name;
    user.email = request.email;
    user.avatar_url = request.avatar_url;
    user.description = request.description;
    user.is_ai = request.is_ai;
    user.cloud_id = request.cloud_id;
    user.sync_enabled = request.sync_enabled;
    user.theme = request.theme;
    user.language = request.language;
    user.font_size = request.font_size;
    user.custom_settings = request.custom_settings;

    service
        .update_user(&request.id, user)
        .map_err(|e| format!("更新用户失败: {}", e))
}

// 删除用户
#[command]
pub fn delete_user(state: State<AppState>, id: String) -> Result<bool, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = UserService::new(pool.clone());

    service.delete_user(&id).map(|_| true).map_err(|e| match e {
        RepositoryError::NotFound(_) => format!("用户不存在: {}", id),
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
