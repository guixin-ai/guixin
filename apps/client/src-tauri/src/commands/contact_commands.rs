use serde::{Deserialize, Serialize};
use tauri::{command, State};

use crate::models::{Contact, ContactWithGroup};
use crate::repositories::error::RepositoryError;
use crate::services::ContactService;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct CreateContactRequest {
    name: String,
    description: Option<String>,
    group_id: String,
    contact_user_id: String,
    user_id: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateContactRequest {
    id: String,
    name: String,
    description: Option<String>,
    group_id: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateAIContactRequest {
    // Agent参数
    name: String,
    model_name: String,
    system_prompt: String,
    temperature: f32,
    max_tokens: Option<i32>,
    top_p: Option<f32>,
    avatar_url: Option<String>,
    description: Option<String>,
    is_streaming: bool,

    // 联系人参数
    group_id: String,
    owner_user_id: String,
}

// 创建联系人
#[command]
pub fn create_contact(
    state: State<AppState>,
    request: CreateContactRequest,
) -> Result<Contact, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactService::new(pool.clone());

    service
        .create_contact(
            request.name,
            request.description,
            request.group_id,
            request.contact_user_id,
            request.user_id,
        )
        .map_err(|e| format!("创建联系人失败: {}", e))
}

/// 创建AI联系人（原子操作）
///
/// 这个命令执行以下步骤：
/// 1. 创建Agent
/// 2. 创建AI用户
/// 3. 更新Agent关联到AI用户
/// 4. 创建联系人用户链接
/// 5. 创建联系人
///
/// 所有操作在一个事务中执行，确保原子性
#[command]
pub fn create_ai_contact(
    state: State<AppState>,
    request: CreateAIContactRequest,
) -> Result<Contact, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactService::new(pool.clone());

    service
        .create_ai_contact(
            request.name,
            request.model_name,
            request.system_prompt,
            request.temperature,
            request.max_tokens,
            request.top_p,
            request.avatar_url,
            request.description.clone(),
            request.is_streaming,
            request.description,
            request.group_id,
            request.owner_user_id,
        )
        .map_err(|e| format!("创建AI联系人失败: {}", e))
}

// 获取所有联系人
#[command]
pub fn get_all_contacts(state: State<AppState>) -> Result<Vec<Contact>, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactService::new(pool.clone());

    service
        .get_all_contacts()
        .map_err(|e| format!("获取联系人失败: {}", e))
}

// 根据ID获取联系人
#[command]
pub fn get_contact_by_id(state: State<AppState>, id: String) -> Result<Contact, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactService::new(pool.clone());

    service.get_contact_by_id(&id).map_err(|e| match e {
        RepositoryError::NotFound(_) => format!("联系人不存在: {}", id),
        _ => format!("获取联系人失败: {}", e),
    })
}

// 根据用户ID获取联系人
#[command]
pub fn get_contacts_by_user_id(
    state: State<AppState>,
    user_id: String,
) -> Result<Vec<Contact>, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactService::new(pool.clone());

    service
        .get_contacts_by_owner_id(&user_id)
        .map_err(|e| format!("获取用户联系人失败: {}", e))
}

// 根据分组ID获取联系人
#[command]
pub fn get_contacts_by_group_id(
    state: State<AppState>,
    group_id: String,
) -> Result<Vec<Contact>, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactService::new(pool.clone());

    service
        .get_contacts_by_group_id(&group_id)
        .map_err(|e| format!("获取分组联系人失败: {}", e))
}

// 根据联系人用户ID获取联系人
#[command]
pub fn get_contacts_by_contact_user_id(
    state: State<AppState>,
    contact_user_id: String,
) -> Result<Vec<Contact>, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactService::new(pool.clone());

    service
        .get_contacts_by_user_link_id(&contact_user_id)
        .map_err(|e| format!("获取联系人用户的联系人失败: {}", e))
}

// 更新联系人
#[command]
pub fn update_contact(
    state: State<AppState>,
    request: UpdateContactRequest,
) -> Result<Contact, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactService::new(pool.clone());

    service
        .update_contact(
            &request.id,
            request.name,
            request.description,
            request.group_id,
        )
        .map_err(|e| match e {
            RepositoryError::NotFound(_) => format!("联系人不存在: {}", request.id),
            _ => format!("更新联系人失败: {}", e),
        })
}

// 删除联系人
#[command]
pub fn delete_contact(state: State<AppState>, id: String, user_id: String) -> Result<bool, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactService::new(pool.clone());

    service
        .delete_contact(&id, &user_id)
        .map(|_| true)
        .map_err(|e| match e {
            RepositoryError::NotFound(_) => format!("联系人不存在: {}", id),
            _ => format!("删除联系人失败: {}", e),
        })
}

// 获取所有联系人及其分组信息
#[command]
pub fn get_all_contacts_with_group(
    state: State<AppState>,
) -> Result<Vec<ContactWithGroup>, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactService::new(pool.clone());

    service
        .get_all_contacts_with_group()
        .map_err(|e| format!("获取联系人及分组信息失败: {}", e))
}

// 根据ID获取联系人及其分组信息
#[command]
pub fn get_contact_by_id_with_group(
    state: State<AppState>,
    id: String,
) -> Result<ContactWithGroup, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactService::new(pool.clone());

    service
        .get_contact_by_id_with_group(&id)
        .map_err(|e| match e {
            RepositoryError::NotFound(_) => format!("联系人不存在: {}", id),
            _ => format!("获取联系人及分组信息失败: {}", e),
        })
}

// 根据用户ID获取联系人及其分组信息
#[command]
pub fn get_contacts_by_user_id_with_group(
    state: State<AppState>,
    user_id: String,
) -> Result<Vec<ContactWithGroup>, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactService::new(pool.clone());

    service
        .get_contacts_by_owner_id_with_group(&user_id)
        .map_err(|e| format!("获取用户联系人及分组信息失败: {}", e))
}

// 根据分组ID获取联系人及其分组信息
#[command]
pub fn get_contacts_by_group_id_with_group(
    state: State<AppState>,
    group_id: String,
) -> Result<Vec<ContactWithGroup>, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactService::new(pool.clone());

    service
        .get_contacts_by_group_id_with_group(&group_id)
        .map_err(|e| format!("获取分组联系人及分组信息失败: {}", e))
}
