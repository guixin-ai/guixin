use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;
use crate::services::resource_service::ResourceService;
use crate::models::Resource;
use crate::db::{APP_DIR_NAME, RESOURCES_DIR_NAME, IMAGES_DIR_NAME};

#[derive(Debug, Serialize, Deserialize)]
pub struct ResourceResponse {
    pub id: String,
    pub name: String,
    pub type_: String,
    pub url: String,
    pub file_name: String,
    pub description: Option<String>,
    pub user_id: String,
    pub created_at: String,
    pub updated_at: String,
}

impl From<Resource> for ResourceResponse {
    fn from(resource: Resource) -> Self {
        Self {
            id: resource.id,
            name: resource.name,
            type_: resource.type_,
            url: resource.url,
            file_name: resource.file_name,
            description: resource.description,
            user_id: resource.user_id,
            created_at: resource.created_at.to_string(),
            updated_at: resource.updated_at.to_string(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadImageResponse {
    pub resource: ResourceResponse,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadTextResponse {
    pub resource: ResourceResponse,
}

/// 上传当前用户的图片
/// 
/// 将图片保存到资源文件夹，创建资源记录，并返回可访问的URL
///
/// ## 数据库影响
/// - 读取操作：无
/// - 写入操作：在 resources 表中创建新的资源记录
/// - 无修改或删除操作
#[tauri::command]
pub async fn upload_current_user_image(
    state: State<'_, AppState>,
    image_data: Vec<u8>,
    name: String,
    file_name: Option<String>,
    description: Option<String>
) -> Result<UploadImageResponse, String> {
    // 获取或生成文件名
    let file_name = file_name.unwrap_or_else(|| "image.png".to_string());
    
    // 从全局状态获取应用资源目录和数据库连接池
    let app_resource_path = &state.app_resource_path;
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    
    // 获取当前用户ID
    let current_user = state.current_user.lock().expect("无法获取当前用户状态");
    let user_id = current_user.id.clone();
    
    // 使用资源服务创建图片资源
    let resource = ResourceService::create_image_resource(
        &pool,
        &user_id,
        &name,
        description.as_deref(),
        &image_data,
        &file_name,
        app_resource_path,
    ).map_err(|e| e.to_string())?;
    
    // 返回结果
    Ok(UploadImageResponse {
        resource: ResourceResponse::from(resource),
    })
}

/// 上传当前用户的文本资源
/// 
/// 将文本内容保存到资源文件夹，创建资源记录，并返回可访问的URL
///
/// ## 数据库影响
/// - 读取操作：无
/// - 写入操作：在 resources 表中创建新的资源记录
/// - 无修改或删除操作
#[tauri::command]
pub async fn upload_current_user_text(
    state: State<'_, AppState>,
    content: String,
    name: String,
    description: Option<String>
) -> Result<UploadTextResponse, String> {
    // 从全局状态获取应用资源目录和数据库连接池
    let app_resource_path = &state.app_resource_path;
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    
    // 获取当前用户ID
    let current_user = state.current_user.lock().expect("无法获取当前用户状态");
    let user_id = current_user.id.clone();
    
    // 使用资源服务创建文本资源
    let resource = ResourceService::create_text_resource(
        &pool,
        &user_id,
        &name,
        &content,
        description.as_deref(),
        app_resource_path,
    ).map_err(|e| e.to_string())?;
    
    // 返回结果
    Ok(UploadTextResponse {
        resource: ResourceResponse::from(resource),
    })
}

/// 获取当前用户的所有资源
/// 
/// 返回当前用户的所有资源列表
///
/// ## 数据库影响
/// - 读取操作：从 resources 表中查询当前用户的所有资源
/// - 无写入、修改或删除操作
#[tauri::command]
pub async fn get_current_user_resources(
    state: State<'_, AppState>
) -> Result<Vec<ResourceResponse>, String> {
    // 获取数据库连接池
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    
    // 获取当前用户ID
    let current_user = state.current_user.lock().expect("无法获取当前用户状态");
    let user_id = current_user.id.clone();
    
    // 获取用户的所有资源
    let resources = ResourceService::get_user_resources(&pool, &user_id)
        .map_err(|e| e.to_string())?;
    
    // 转换为响应格式
    let responses = resources.into_iter()
        .map(ResourceResponse::from)
        .collect();
    
    Ok(responses)
}

/// 获取当前用户的图片资源
/// 
/// 返回当前用户的所有图片资源列表
///
/// ## 数据库影响
/// - 读取操作：从 resources 表中查询当前用户的所有图片资源
/// - 无写入、修改或删除操作
#[tauri::command]
pub async fn get_current_user_image_resources(
    state: State<'_, AppState>
) -> Result<Vec<ResourceResponse>, String> {
    // 获取数据库连接池
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    
    // 获取当前用户ID
    let current_user = state.current_user.lock().expect("无法获取当前用户状态");
    let user_id = current_user.id.clone();
    
    // 获取用户的图片资源
    let resources = ResourceService::get_user_image_resources(&pool, &user_id)
        .map_err(|e| e.to_string())?;
    
    // 转换为响应格式
    let responses = resources.into_iter()
        .map(ResourceResponse::from)
        .collect();
    
    Ok(responses)
}

/// 获取当前用户的文本资源
/// 
/// 返回当前用户的所有文本资源列表
///
/// ## 数据库影响
/// - 读取操作：从 resources 表中查询当前用户的所有文本资源
/// - 无写入、修改或删除操作
#[tauri::command]
pub async fn get_current_user_text_resources(
    state: State<'_, AppState>
) -> Result<Vec<ResourceResponse>, String> {
    // 获取数据库连接池
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    
    // 获取当前用户ID
    let current_user = state.current_user.lock().expect("无法获取当前用户状态");
    let user_id = current_user.id.clone();
    
    // 获取用户的文本资源
    let resources = ResourceService::get_user_text_resources(&pool, &user_id)
        .map_err(|e| e.to_string())?;
    
    // 转换为响应格式
    let responses = resources.into_iter()
        .map(ResourceResponse::from)
        .collect();
    
    Ok(responses)
}

/// 获取资源详情
/// 
/// 根据资源ID获取资源详情
///
/// ## 数据库影响
/// - 读取操作：从 resources 表中查询指定ID的资源
/// - 无写入、修改或删除操作
#[tauri::command]
pub async fn get_resource(
    state: State<'_, AppState>,
    id: String
) -> Result<ResourceResponse, String> {
    // 获取数据库连接池
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    
    // 获取资源
    let resource = ResourceService::get_resource(&pool, &id)
        .map_err(|e| e.to_string())?;
    
    Ok(ResourceResponse::from(resource))
}

/// 读取文本资源内容
/// 
/// 根据文本资源ID读取文本内容
///
/// ## 数据库影响
/// - 读取操作：从 resources 表中查询指定ID的资源
/// - 无写入、修改或删除操作
#[tauri::command]
pub async fn read_text_resource(
    state: State<'_, AppState>,
    id: String
) -> Result<String, String> {
    // 获取数据库连接池和资源目录
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    let app_resource_path = &state.app_resource_path;
    
    // 读取文本内容
    let content = ResourceService::read_text_resource_content(&pool, &id, app_resource_path)
        .map_err(|e| e.to_string())?;
    
    Ok(content)
}

/// 删除资源
/// 
/// 删除指定ID的资源，包括数据库记录和文件
///
/// ## 数据库影响
/// - 读取操作：从 resources 表中查询指定ID的资源
/// - 删除操作：从 resources 表中删除指定ID的资源
/// - 无写入或修改操作
#[tauri::command]
pub async fn delete_resource(
    state: State<'_, AppState>,
    id: String
) -> Result<(), String> {
    // 获取数据库连接池和资源目录
    let pool = state.db_pool.lock().expect("无法获取数据库连接池");
    let app_resource_path = &state.app_resource_path;
    
    // 删除资源
    ResourceService::delete_resource(&pool, &id, app_resource_path)
        .map_err(|e| e.to_string())
} 