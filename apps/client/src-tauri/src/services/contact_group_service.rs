use crate::db::DbPool;
use crate::models::{ContactGroup, NewContactGroup};
use crate::repositories::contact_group_repository::ContactGroupRepository;
use crate::repositories::error::{RepositoryError, RepositoryResult};

pub struct ContactGroupService {
    repository: ContactGroupRepository,
}

impl ContactGroupService {
    pub fn new(pool: DbPool) -> Self {
        Self {
            repository: ContactGroupRepository::new(pool),
        }
    }

    // 创建新联系人组
    pub fn create_group(
        &self,
        name: String,
        description: Option<String>,
    ) -> RepositoryResult<ContactGroup> {
        // 检查是否已存在同名分组
        let existing_groups = self.repository.find_by_name(&name)?;
        if !existing_groups.is_empty() {
            return Err(RepositoryError::AlreadyExists(format!(
                "联系人组名称 '{}' 已存在",
                name
            )));
        }

        self.repository.create_with_defaults(name, description)
    }

    // 获取所有联系人组
    pub fn get_all_groups(&self) -> RepositoryResult<Vec<ContactGroup>> {
        self.repository.find_all()
    }

    // 根据ID获取联系人组
    pub fn get_group_by_id(&self, id: &str) -> RepositoryResult<ContactGroup> {
        self.repository.find_by_id(id)
    }

    // 更新联系人组
    pub fn update_group(
        &self,
        id: &str,
        name: String,
        description: Option<String>,
    ) -> RepositoryResult<ContactGroup> {
        // 检查分组是否存在
        let mut group = self.repository.find_by_id(id)?;

        // 如果名称变更，检查新名称是否已存在
        if group.name != name {
            let existing_groups = self.repository.find_by_name(&name)?;
            if !existing_groups.is_empty() {
                return Err(RepositoryError::AlreadyExists(format!(
                    "联系人组名称 '{}' 已存在",
                    name
                )));
            }
        }

        // 更新分组信息
        group.name = name;
        group.description = description;

        self.repository.update(id, group)
    }

    // 删除联系人组
    pub fn delete_group(&self, id: &str) -> RepositoryResult<usize> {
        // 检查分组是否存在
        self.repository.find_by_id(id)?;

        self.repository.delete(id)
    }
}
