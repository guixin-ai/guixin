use crate::repositories::user_contact_repository::UserContactRepository;
use crate::repositories::user_repository::UserRepository;
use crate::repositories::error::RepositoryError;
use crate::services::user_service::UserService;
use crate::AppState;
use tauri::State;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ContactResponse {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub is_ai: bool,
}

/// 获取当前用户的联系人列表
/// 
/// 此命令会从应用状态中获取当前用户ID，不需要显式传递用户ID
///
/// ## 数据库影响
/// - 读取操作：查询 user_contacts 表获取当前用户的所有联系人关系
/// - 读取操作：对每个联系人关系，查询 users 表获取联系人详细信息
/// - 无写入或修改操作
#[tauri::command]
pub async fn get_current_user_contacts(state: State<'_, AppState>) -> Result<Vec<ContactResponse>, String> {
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    let current_user = state.current_user.lock().expect("无法获取当前用户状态");
    let current_user_id = current_user.id.clone();
    
    // 获取用户的联系人关系
    let contact_relations = UserContactRepository::get_by_user_id(&pool, &current_user_id)
        .map_err(|e| e.to_string())?;
    
    let mut contacts = Vec::new();
    
    // 获取每个联系人的详细信息
    for relation in contact_relations {
        match UserRepository::get(&pool, &relation.contact_id) {
            Ok(user) => {
                contacts.push(ContactResponse {
                    id: user.id,
                    name: user.name,
                    description: user.description,
                    is_ai: user.is_ai,
                });
            },
            Err(e) => {
                eprintln!("获取联系人信息失败 ID={}: {}", relation.contact_id, e);
                // 错误处理：跳过查询失败的联系人
                continue;
            }
        }
    }
    
    Ok(contacts)
}

/// 为当前用户添加联系人
/// 
/// 此命令会从应用状态中获取当前用户ID，不需要显式传递用户ID
///
/// ## 数据库影响
/// - 读取操作：检查 users 表中联系人是否存在
/// - 读取操作：检查 user_contacts 表中是否已存在此联系人关系
/// - 写入操作：如果联系人存在且关系不存在，则在 user_contacts 表中创建新记录
/// - 无修改或删除操作
#[tauri::command]
pub async fn add_current_user_contact(contact_id: String, state: State<'_, AppState>) -> Result<(), String> {
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    let current_user = state.current_user.lock().expect("无法获取当前用户状态");
    let user_id = current_user.id.clone();
    
    // 检查联系人是否存在
    match UserRepository::get(&pool, &contact_id) {
        Ok(_) => {},
        Err(RepositoryError::NotFound) => return Err("联系人不存在".to_string()),
        Err(e) => return Err(e.to_string()),
    }
    
    // 检查是否已经是联系人
    if UserContactRepository::exists(&pool, &user_id, &contact_id).map_err(|e| e.to_string())? {
        return Err("该用户已经是您的联系人".to_string());
    }
    
    // 添加联系人
    UserContactRepository::create(&pool, &user_id, &contact_id)
        .map(|_| ())
        .map_err(|e| e.to_string())
}

/// 从当前用户的联系人列表中移除联系人
/// 
/// 此命令会从应用状态中获取当前用户ID，不需要显式传递用户ID
///
/// ## 数据库影响
/// - 删除操作：从 user_contacts 表中删除当前用户与指定联系人之间的关系记录
/// - 不会删除 users 表中的用户数据，只删除关系
/// - 无读取或修改操作
#[tauri::command]
pub async fn remove_current_user_contact(contact_id: String, state: State<'_, AppState>) -> Result<(), String> {
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    let current_user = state.current_user.lock().expect("无法获取当前用户状态");
    let user_id = current_user.id.clone();
    
    // 删除联系人关系
    UserContactRepository::delete_by_user_and_contact(&pool, &user_id, &contact_id)
        .map_err(|e| e.to_string())
}

/// 创建AI用户并添加为当前用户的联系人
/// 
/// 此命令会创建一个新的AI用户，并将其添加为当前用户的联系人
///
/// ## 数据库影响
/// - 写入操作：在 users 表中创建新的AI用户记录
/// - 写入操作：在 user_contacts 表中创建当前用户与新AI用户的联系人关系
/// - 使用事务确保两个操作同时成功或同时失败
/// - 无修改或删除操作
#[tauri::command]
pub async fn create_current_user_ai_contact(
    name: String, 
    description: Option<String>, 
    state: State<'_, AppState>
) -> Result<ContactResponse, String> {
    // 获取数据库连接池和当前用户
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    let current_user = state.current_user.lock().expect("无法获取当前用户状态");
    
    // 调用服务创建AI用户并添加为联系人
    let ai_user = UserService::create_ai_user_and_add_as_contact(
        &pool,
        &current_user.id,
        &name,
        description.as_deref()
    ).map_err(|e| e.to_string())?;
    
    // 返回创建的AI用户信息
    Ok(ContactResponse {
        id: ai_user.id,
        name: ai_user.name,
        description: ai_user.description,
        is_ai: ai_user.is_ai,
    })
} 