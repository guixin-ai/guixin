// 用户相关命令 
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;
use crate::services::user_service::UserService;

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

/// 创建AI用户
/// 
/// 创建一个新的AI用户，需要指定名称和描述
#[tauri::command]
pub fn create_ai_user(
    state: State<'_, AppState>,
    name: String,
    description: Option<String>,
) -> Result<CreateAiUserResponse, String> {
    let pool = state.db_pool.lock().map_err(|_| "无法获取数据库连接池".to_string())?;
    
    // 创建AI用户，is_ai设置为true
    let user = UserService::create_user(&pool, name, description, Some(true))
        .map_err(|e| format!("创建AI用户失败: {}", e))?;

    Ok(CreateAiUserResponse {
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
pub fn get_current_user(
    state: State<'_, AppState>,
) -> Result<UserResponse, String> {
    let user = state.current_user.lock().map_err(|_| "无法获取当前用户状态".to_string())?;
    
    Ok(UserResponse {
        id: user.id.clone(),
        name: user.name.clone(),
        description: user.description.clone(),
        is_ai: user.is_ai,
        created_at: user.created_at.to_string(),
        updated_at: user.updated_at.to_string(),
    })
} 