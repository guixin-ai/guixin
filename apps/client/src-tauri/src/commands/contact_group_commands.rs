use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{command, State};

use crate::models::ContactGroup;
use crate::repositories::error::RepositoryError;
use crate::services::ContactGroupService;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct CreateGroupRequest {
    name: String,
    description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateGroupRequest {
    id: String,
    name: String,
    description: Option<String>,
}

// 创建联系人组
#[command]
pub fn create_contact_group(
    state: State<AppState>,
    request: CreateGroupRequest,
) -> Result<ContactGroup, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactGroupService::new(pool.clone());

    service
        .create_group(request.name, request.description)
        .map_err(|e| format!("创建联系人组失败: {}", e))
}

// 获取所有联系人组
#[command]
pub fn get_all_contact_groups(state: State<AppState>) -> Result<Vec<ContactGroup>, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactGroupService::new(pool.clone());

    service
        .get_all_groups()
        .map_err(|e| format!("获取联系人组失败: {}", e))
}

// 根据ID获取联系人组
#[command]
pub fn get_contact_group_by_id(state: State<AppState>, id: String) -> Result<ContactGroup, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactGroupService::new(pool.clone());

    service.get_group_by_id(&id).map_err(|e| match e {
        RepositoryError::NotFound(_) => format!("联系人组不存在: {}", id),
        _ => format!("获取联系人组失败: {}", e),
    })
}

// 更新联系人组
#[command]
pub fn update_contact_group(
    state: State<AppState>,
    request: UpdateGroupRequest,
) -> Result<ContactGroup, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactGroupService::new(pool.clone());

    service
        .update_group(&request.id, request.name, request.description)
        .map_err(|e| match e {
            RepositoryError::NotFound(_) => format!("联系人组不存在: {}", request.id),
            RepositoryError::AlreadyExists(_) => format!("联系人组名称已存在"),
            _ => format!("更新联系人组失败: {}", e),
        })
}

// 删除联系人组
#[command]
pub fn delete_contact_group(state: State<AppState>, id: String) -> Result<bool, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactGroupService::new(pool.clone());

    service
        .delete_group(&id)
        .map(|_| true)
        .map_err(|e| match e {
            RepositoryError::NotFound(_) => format!("联系人组不存在: {}", id),
            _ => format!("删除联系人组失败: {}", e),
        })
}
