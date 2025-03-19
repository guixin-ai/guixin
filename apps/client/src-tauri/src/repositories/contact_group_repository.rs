use diesel::prelude::*;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{ContactGroup, NewContactGroup};
use crate::schema::contact_groups;

pub struct ContactGroupRepository {
    pool: DbPool,
}

impl ContactGroupRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    // 创建新联系人组
    pub fn create(&self, new_group: NewContactGroup) -> RepositoryResult<ContactGroup> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::insert_into(contact_groups::table)
            .values(&new_group)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        contact_groups::table
            .filter(contact_groups::id.eq(&new_group.id))
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据ID查找联系人组
    pub fn find_by_id(&self, id: &str) -> RepositoryResult<ContactGroup> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        contact_groups::table
            .filter(contact_groups::id.eq(id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("联系人组 ID: {}", id))
                }
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 根据名称查找联系人组
    pub fn find_by_name(&self, name: &str) -> RepositoryResult<Vec<ContactGroup>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        contact_groups::table
            .filter(contact_groups::name.eq(name))
            .load::<ContactGroup>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 查找所有联系人组
    pub fn find_all(&self) -> RepositoryResult<Vec<ContactGroup>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        contact_groups::table
            .load::<ContactGroup>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 更新联系人组
    pub fn update(&self, id: &str, group: ContactGroup) -> RepositoryResult<ContactGroup> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(contact_groups::table.filter(contact_groups::id.eq(id)))
            .set((
                contact_groups::name.eq(&group.name),
                contact_groups::description.eq(&group.description),
            ))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        self.find_by_id(id)
    }

    // 删除联系人组
    pub fn delete(&self, id: &str) -> RepositoryResult<usize> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::delete(contact_groups::table.filter(contact_groups::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 创建新联系人组（自动生成ID）
    pub fn create_with_defaults(
        &self,
        name: String,
        description: Option<String>,
    ) -> RepositoryResult<ContactGroup> {
        let new_group = NewContactGroup {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            description,
        };

        self.create(new_group)
    }
}
