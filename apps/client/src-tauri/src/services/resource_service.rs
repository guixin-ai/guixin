// 资源相关服务
use std::fs;
use std::path::Path;
use uuid::Uuid;
use anyhow::anyhow;
use diesel::connection::Connection;

use crate::db::{DbPool, RESOURCES_DIR_NAME, IMAGES_DIR_NAME, TEXTS_DIR_NAME};
use crate::models::Resource;
use crate::repositories::resource_repository::ResourceRepository;
use crate::repositories::error::RepositoryError;
use super::ServiceResult;

pub struct ResourceService;

impl ResourceService {
    // 创建图片资源
    pub fn create_image_resource(
        pool: &DbPool,
        user_id: &str,
        name: &str,
        description: Option<&str>,
        image_data: &[u8],
        file_name: &str,
        app_resource_path: &Path,
    ) -> ServiceResult<Resource> {
        // 获取或提取文件扩展名
        let extension = Path::new(file_name)
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("png")
            .to_string();
        
        // 生成唯一文件名
        let unique_file_name = format!("{}.{}", Uuid::new_v4(), extension);
        
        // 创建图片目录
        let images_dir = app_resource_path.join(IMAGES_DIR_NAME);
        if !images_dir.exists() {
            fs::create_dir_all(&images_dir)
                .map_err(|e| anyhow!("创建图片目录失败: {}", e))?;
        }
        
        // 图片完整路径
        let image_path = images_dir.join(&unique_file_name);
        
        // 保存图片
        fs::write(&image_path, image_data)
            .map_err(|e| anyhow!("保存图片失败: {}", e))?;
        
        // 存储相对路径结构
        let relative_url = format!("{}/{}/{}",
            RESOURCES_DIR_NAME, IMAGES_DIR_NAME, unique_file_name);
        
        // 创建资源记录
        let resource = ResourceRepository::create(
            pool,
            name,
            "image",
            &relative_url,
            &unique_file_name,
            description,
            user_id,
        ).map_err(|e| anyhow!("创建资源记录失败: {}", e))?;
        
        Ok(resource)
    }
    
    // 创建文本资源
    pub fn create_text_resource(
        pool: &DbPool,
        user_id: &str,
        name: &str,
        content: &str,
        description: Option<&str>,
        app_resource_path: &Path,
    ) -> ServiceResult<Resource> {
        // 生成唯一文件名
        let unique_file_name = format!("{}.txt", Uuid::new_v4());
        
        // 创建文本目录
        let texts_dir = app_resource_path.join(TEXTS_DIR_NAME);
        if !texts_dir.exists() {
            fs::create_dir_all(&texts_dir)
                .map_err(|e| anyhow!("创建文本目录失败: {}", e))?;
        }
        
        // 文本完整路径
        let text_path = texts_dir.join(&unique_file_name);
        
        // 保存文本
        fs::write(&text_path, content)
            .map_err(|e| anyhow!("保存文本失败: {}", e))?;
        
        // 存储相对路径结构
        let relative_url = format!("{}/{}/{}",
            RESOURCES_DIR_NAME, TEXTS_DIR_NAME, unique_file_name);
        
        // 创建资源记录
        let resource = ResourceRepository::create(
            pool,
            name,
            "text",
            &relative_url,
            &unique_file_name,
            description,
            user_id,
        ).map_err(|e| anyhow!("创建资源记录失败: {}", e))?;
        
        Ok(resource)
    }
    
    // 获取资源
    pub fn get_resource(pool: &DbPool, id: &str) -> ServiceResult<Resource> {
        let resource = ResourceRepository::get(pool, id)
            .map_err(|e| anyhow!("获取资源失败: {}", e))?;
        Ok(resource)
    }
    
    // 获取用户的所有资源
    pub fn get_user_resources(pool: &DbPool, user_id: &str) -> ServiceResult<Vec<Resource>> {
        let resources = ResourceRepository::get_by_user_id(pool, user_id)
            .map_err(|e| anyhow!("获取用户资源失败: {}", e))?;
        Ok(resources)
    }
    
    // 获取用户的图片资源
    pub fn get_user_image_resources(pool: &DbPool, user_id: &str) -> ServiceResult<Vec<Resource>> {
        let resources = ResourceRepository::get_by_user_id_and_type(pool, user_id, "image")
            .map_err(|e| anyhow!("获取用户图片资源失败: {}", e))?;
        Ok(resources)
    }
    
    // 获取用户的文本资源
    pub fn get_user_text_resources(pool: &DbPool, user_id: &str) -> ServiceResult<Vec<Resource>> {
        let resources = ResourceRepository::get_by_user_id_and_type(pool, user_id, "text")
            .map_err(|e| anyhow!("获取用户文本资源失败: {}", e))?;
        Ok(resources)
    }
    
    // 更新资源
    pub fn update_resource(
        pool: &DbPool,
        id: &str,
        name: Option<&str>,
        description: Option<&str>,
    ) -> ServiceResult<Resource> {
        let resource = ResourceRepository::update(pool, id, name, description)
            .map_err(|e| anyhow!("更新资源失败: {}", e))?;
        Ok(resource)
    }
    
    // 删除资源
    pub fn delete_resource(pool: &DbPool, id: &str, app_resource_path: &Path) -> ServiceResult<()> {
        // 获取资源信息
        let resource = match ResourceRepository::get(pool, id) {
            Ok(res) => res,
            Err(RepositoryError::NotFound) => {
                // 资源已经不存在，视为删除成功
                return Ok(());
            },
            Err(e) => return Err(anyhow!("获取资源信息失败: {}", e)),
        };
        
        // 开始事务
        let mut conn = pool.get().map_err(|e| anyhow!("获取数据库连接失败: {}", e))?;
        
        conn.transaction(|_conn| {
            // 1. 删除数据库记录
            ResourceRepository::delete(pool, id)
                .map_err(|e| anyhow!("删除资源记录失败: {}", e))?;
            
            // 2. 删除文件
            let file_path = match resource.type_.as_str() {
                "image" => app_resource_path.join(IMAGES_DIR_NAME).join(&resource.file_name),
                "text" => app_resource_path.join(TEXTS_DIR_NAME).join(&resource.file_name),
                _ => return Err(anyhow!("未知的资源类型: {}", resource.type_)),
            };
            
            // 如果文件存在，则删除
            if file_path.exists() {
                fs::remove_file(&file_path)
                    .map_err(|e| anyhow!("删除文件失败: {}", e))?;
            }
            
            Ok(())
        })
    }
    
    // 读取文本资源内容
    pub fn read_text_resource_content(
        pool: &DbPool,
        id: &str,
        app_resource_path: &Path,
    ) -> ServiceResult<String> {
        // 获取资源信息
        let resource = ResourceRepository::get(pool, id)
            .map_err(|e| anyhow!("获取资源信息失败: {}", e))?;
        
        // 确保是文本资源
        if resource.type_ != "text" {
            return Err(anyhow!("不是文本资源"));
        }
        
        // 构建文件路径并读取内容
        let file_path = app_resource_path.join(TEXTS_DIR_NAME).join(&resource.file_name);
        let content = fs::read_to_string(&file_path)
            .map_err(|e| anyhow!("读取文本内容失败: {}", e))?;
        
        Ok(content)
    }
}