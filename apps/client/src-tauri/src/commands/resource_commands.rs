use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::State;
use uuid::Uuid;
use crate::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadImageResponse {
    pub url: String,
    pub file_name: String,
    pub file_path: String,
}

/// 上传图片
/// 
/// 将图片保存到资源文件夹并返回可访问的URL
#[tauri::command]
pub async fn upload_image(
    state: State<'_, AppState>,
    image_data: Vec<u8>,
    file_name: Option<String>
) -> Result<UploadImageResponse, String> {
    // 获取或生成文件名
    let extension = match &file_name {
        Some(name) => {
            Path::new(name)
                .extension()
                .and_then(|ext| ext.to_str())
                .unwrap_or("png")
                .to_string()
        },
        None => "png".to_string(),
    };
    
    // 生成唯一文件名
    let unique_file_name = format!("{}.{}", Uuid::new_v4(), extension);
    
    // 从全局状态获取应用资源目录
    let app_resource_path = &state.app_resource_path;
    
    // 创建图片目录
    let images_dir = app_resource_path.join("images");
    if !images_dir.exists() {
        fs::create_dir_all(&images_dir)
            .map_err(|e| format!("创建图片目录失败: {}", e))?;
    }
    
    // 图片完整路径
    let image_path = images_dir.join(&unique_file_name);
    
    // 保存图片
    fs::write(&image_path, &image_data)
        .map_err(|e| format!("保存图片失败: {}", e))?;
    
    // 返回结果
    Ok(UploadImageResponse {
        url: format!("asset://{}", image_path.to_string_lossy()),
        file_name: unique_file_name,
        file_path: image_path.to_string_lossy().to_string(),
    })
}

/// 获取图片URL
/// 
/// 根据图片文件名获取可访问的URL
#[tauri::command]
pub async fn get_image_url(
    state: State<'_, AppState>,
    file_name: String
) -> Result<String, String> {
    // 从全局状态获取应用资源目录
    let app_resource_path = &state.app_resource_path;
    let image_path = app_resource_path.join("images").join(&file_name);
    
    if !image_path.exists() {
        return Err(format!("图片不存在: {}", file_name));
    }
    
    Ok(format!("asset://{}", image_path.to_string_lossy()))
} 