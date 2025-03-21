// 用户联系人仓库

use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{UserContact, NewUserContact};
use crate::schema::user_contacts::dsl::*;

pub struct UserContactRepository;

impl UserContactRepository {
    // 创建用户联系人关系
    pub fn create(pool: &DbPool, user_id_val: &str, contact_id_val: &str) -> RepositoryResult<UserContact> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;
        
        let new_user_contact = NewUserContact {
            id: Uuid::new_v4().to_string(),
            user_id: user_id_val.to_string(),
            contact_id: contact_id_val.to_string(),
            created_at: Utc::now().naive_utc(),
            updated_at: Utc::now().naive_utc(),
        };
        
        diesel::insert_into(user_contacts)
            .values(&new_user_contact)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;
            
        user_contacts
            .filter(id.eq(&new_user_contact.id))
            .first::<UserContact>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 获取用户联系人关系
    pub fn get(pool: &DbPool, id_val: &str) -> RepositoryResult<UserContact> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;
            
        user_contacts.find(id_val)
            .first::<UserContact>(&mut conn)
            .map_err(|error| {
                if let diesel::result::Error::NotFound = error {
                    RepositoryError::NotFound
                } else {
                    RepositoryError::DatabaseError(error)
                }
            })
    }

    // 获取用户的所有联系人ID
    pub fn get_by_user_id(pool: &DbPool, user_id_val: &str) -> RepositoryResult<Vec<UserContact>> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;
            
        user_contacts
            .filter(user_id.eq(user_id_val))
            .load::<UserContact>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 检查联系人关系是否存在
    pub fn exists(pool: &DbPool, user_id_val: &str, contact_id_val: &str) -> RepositoryResult<bool> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;
            
        use diesel::dsl::exists;
        use diesel::select;
        
        select(exists(
            user_contacts
                .filter(user_id.eq(user_id_val))
                .filter(contact_id.eq(contact_id_val))
        ))
        .get_result(&mut conn)
        .map_err(RepositoryError::DatabaseError)
    }

    // 删除用户联系人关系
    pub fn delete(pool: &DbPool, id_val: &str) -> RepositoryResult<()> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;
            
        diesel::delete(user_contacts.find(id_val))
            .execute(&mut conn)
            .map(|_| ())
            .map_err(RepositoryError::DatabaseError)
    }

    // 删除用户与联系人的关系
    pub fn delete_by_user_and_contact(pool: &DbPool, user_id_val: &str, contact_id_val: &str) -> RepositoryResult<()> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;
            
        diesel::delete(
            user_contacts
                .filter(user_id.eq(user_id_val))
                .filter(contact_id.eq(contact_id_val))
        )
        .execute(&mut conn)
        .map(|_| ())
        .map_err(RepositoryError::DatabaseError)
    }
} 