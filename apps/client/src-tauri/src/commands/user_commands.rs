// 用户相关命令 
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;
use crate::services::user_service::UserService;
use crate::models::User;
use crate::repositories::user_repository::UserRepository;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateAiUserResponse {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub is_ai: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserResponse {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub is_ai: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            name: user.name,
            description: user.description,
            is_ai: user.is_ai,
            created_at: user.created_at.to_string(),
            updated_at: user.updated_at.to_string(),
        }
    }
}

/// 创建AI用户
/// 
/// 创建一个新的AI用户，需要指定名称和描述
#[tauri::command]
pub async fn create_ai_user(
    pool: State<'_, AppState>,
    name: String,
    description: Option<String>,
) -> Result<UserResponse, String> {
    // 获取数据库连接池
    let pool = pool.db_pool.lock().expect("无法获取数据库连接池");
    let mut conn = pool.get().map_err(|e| e.to_string())?;

    // 使用用户服务创建AI用户
    let user = UserService::create_ai_user(&mut conn, &name, description.as_deref())
        .map_err(|e| e.to_string())?;

    Ok(UserResponse {
        id: user.id,
        name: user.name,
        description: user.description,
        is_ai: user.is_ai,
        created_at: user.created_at.to_string(),
        updated_at: user.updated_at.to_string(),
    })
}

/// 获取当前用户
/// 
/// 获取当前应用状态中的当前用户信息
#[tauri::command]
pub fn get_current_user(state: State<AppState>) -> Result<UserResponse, String> {
    let current_user = state.current_user.lock().expect("无法获取当前用户");
    let user_response = UserResponse::from(current_user.clone());
    Ok(user_response)
}

/// 获取指定用户
#[tauri::command]
pub fn get_user(id: String, state: State<AppState>) -> Result<UserResponse, String> {
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    match UserRepository::get(&pool, &id) {
        Ok(user) => Ok(UserResponse::from(user)),
        Err(e) => Err(e.to_string()),
    }
} 