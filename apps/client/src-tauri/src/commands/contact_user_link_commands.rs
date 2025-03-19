use serde::{Deserialize, Serialize};
use tauri::{command, State};

use crate::models::ContactUserLink;
use crate::repositories::error::RepositoryError;
use crate::services::ContactUserLinkService;
use crate::AppState;

// 获取联系人用户链接
#[command]
pub fn get_contact_user_link_by_id(
    state: State<AppState>,
    id: String,
) -> Result<ContactUserLink, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactUserLinkService::new(pool.clone());

    service
        .get_contact_user_link_by_id(&id)
        .map_err(|e| match e {
            RepositoryError::NotFound(_) => format!("联系人用户链接不存在: {}", id),
            _ => format!("获取联系人用户链接失败: {}", e),
        })
}

// 获取联系人用户链接对应的用户ID
#[command]
pub fn get_user_id_by_contact_user_link(
    state: State<AppState>,
    user_link_id: String,
) -> Result<String, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactUserLinkService::new(pool.clone());

    service
        .get_contact_user_link_by_id(&user_link_id)
        .map(|link| link.user_id)
        .map_err(|e| match e {
            RepositoryError::NotFound(_) => format!("联系人用户链接不存在: {}", user_link_id),
            _ => format!("获取联系人用户链接失败: {}", e),
        })
}
