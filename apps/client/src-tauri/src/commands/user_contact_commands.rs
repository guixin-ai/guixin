use crate::repositories::user_contact_repository::UserContactRepository;
use crate::repositories::user_repository::UserRepository;
use crate::repositories::error::RepositoryError;
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

#[tauri::command]
pub async fn get_user_contacts(current_user_id: String, state: State<'_, AppState>) -> Result<Vec<ContactResponse>, String> {
    // 获取用户的联系人关系
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
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

#[tauri::command]
pub async fn add_contact(user_id: String, contact_id: String, state: State<'_, AppState>) -> Result<(), String> {
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    
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

#[tauri::command]
pub async fn remove_contact(user_id: String, contact_id: String, state: State<'_, AppState>) -> Result<(), String> {
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    
    // 删除联系人关系
    UserContactRepository::delete_by_user_and_contact(&pool, &user_id, &contact_id)
        .map_err(|e| e.to_string())
} 