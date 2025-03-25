// 资源仓库

use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::RepositoryError;
use crate::db::DbPool;
use crate::models::{Resource, NewResource};
use crate::schema::resources;

pub struct ResourceRepository;

impl ResourceRepository {
    // 创建资源
    pub fn create(
        pool: &DbPool,
        name: &str,
        type_: &str,
        url: &str,
        file_name: &str,
        description: Option<&str>,
        user_id: &str,
    ) -> Result<Resource, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let new_resource = NewResource {
            id: Uuid::new_v4().to_string(),
            name: name.to_string(),
            type_: type_.to_string(),
            url: url.to_string(),
            file_name: file_name.to_string(),
            description: description.map(|desc| desc.to_string()),
            user_id: user_id.to_string(),
            created_at: Utc::now().naive_utc(),
            updated_at: Utc::now().naive_utc(),
        };

        diesel::insert_into(resources::table)
            .values(&new_resource)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        let resource = resources::table
            .filter(resources::id.eq(&new_resource.id))
            .select(Resource::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(resource)
    }

    // 获取资源
    pub fn get(pool: &DbPool, id: &str) -> Result<Resource, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let resource = resources::table
            .filter(resources::id.eq(id))
            .select(Resource::as_select())
            .first(&mut conn)
            .map_err(|e| {
                if let diesel::result::Error::NotFound = e {
                    RepositoryError::NotFound
                } else {
                    RepositoryError::DatabaseError(e)
                }
            })?;

        Ok(resource)
    }

    // 获取用户的所有资源
    pub fn get_by_user_id(pool: &DbPool, user_id: &str) -> Result<Vec<Resource>, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let resources_list = resources::table
            .filter(resources::user_id.eq(user_id))
            .order(resources::created_at.desc())
            .select(Resource::as_select())
            .load(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(resources_list)
    }

    // 按类型获取用户的资源
    pub fn get_by_user_id_and_type(
        pool: &DbPool, 
        user_id: &str, 
        type_: &str
    ) -> Result<Vec<Resource>, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let resources_list = resources::table
            .filter(resources::user_id.eq(user_id))
            .filter(resources::type_.eq(type_))
            .order(resources::created_at.desc())
            .select(Resource::as_select())
            .load(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(resources_list)
    }

    // 更新资源
    pub fn update(
        pool: &DbPool,
        id: &str,
        name: Option<&str>,
        description: Option<&str>,
    ) -> Result<Resource, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;
        
        // 检查资源是否存在
        let _resource = resources::table
            .filter(resources::id.eq(id))
            .select(Resource::as_select())
            .first(&mut conn)
            .map_err(|e| {
                if let diesel::result::Error::NotFound = e {
                    RepositoryError::NotFound
                } else {
                    RepositoryError::DatabaseError(e)
                }
            })?;

        // 更新名称（如果提供）
        if let Some(new_name) = name {
            diesel::update(resources::table.filter(resources::id.eq(id)))
                .set(resources::name.eq(new_name))
                .execute(&mut conn)
                .map_err(RepositoryError::DatabaseError)?;
        }
        
        // 更新描述（如果提供）
        if let Some(new_desc) = description {
            diesel::update(resources::table.filter(resources::id.eq(id)))
                .set(resources::description.eq(new_desc))
                .execute(&mut conn)
                .map_err(RepositoryError::DatabaseError)?;
        }
        
        // 获取更新后的资源
        let updated_resource = resources::table
            .filter(resources::id.eq(id))
            .select(Resource::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(updated_resource)
    }

    // 删除资源
    pub fn delete(pool: &DbPool, id: &str) -> Result<(), RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        diesel::delete(resources::table.filter(resources::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(())
    }
} 