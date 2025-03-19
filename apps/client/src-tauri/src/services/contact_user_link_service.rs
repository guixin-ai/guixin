use crate::db::DbPool;
use crate::models::{ContactUserLink, NewContactUserLink};
use crate::repositories::contact_user_link_repository::ContactUserLinkRepository;
use crate::repositories::error::RepositoryResult;

pub struct ContactUserLinkService {
    repository: ContactUserLinkRepository,
}

impl ContactUserLinkService {
    pub fn new(pool: DbPool) -> Self {
        Self {
            repository: ContactUserLinkRepository::new(pool),
        }
    }

    // 创建新联系人用户链接
    pub fn create_contact_user_link(&self, user_id: String) -> RepositoryResult<ContactUserLink> {
        self.repository.create_with_defaults(user_id)
    }

    // 根据ID获取联系人用户链接
    pub fn get_contact_user_link_by_id(&self, id: &str) -> RepositoryResult<ContactUserLink> {
        self.repository.find_by_id(id)
    }

    // 根据用户ID获取联系人用户链接
    pub fn get_contact_user_links_by_user_id(
        &self,
        user_id: &str,
    ) -> RepositoryResult<Vec<ContactUserLink>> {
        self.repository.find_by_user_id(user_id)
    }

    // 获取所有联系人用户链接
    pub fn get_all_contact_user_links(&self) -> RepositoryResult<Vec<ContactUserLink>> {
        self.repository.find_all()
    }

    // 删除联系人用户链接
    pub fn delete_contact_user_link(&self, id: &str) -> RepositoryResult<usize> {
        self.repository.delete(id)
    }
}
