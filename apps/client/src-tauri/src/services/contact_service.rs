use crate::db::DbPool;
use crate::models::{Contact, ContactWithGroup, NewContact};
use crate::repositories::contact_repository::ContactRepository;
use crate::repositories::error::{RepositoryError, RepositoryResult};

pub struct ContactService {
    repository: ContactRepository,
}

impl ContactService {
    pub fn new(pool: DbPool) -> Self {
        Self {
            repository: ContactRepository::new(pool),
        }
    }

    // 创建新联系人
    pub fn create_contact(
        &self,
        name: String,
        description: Option<String>,
        group_id: String,
        user_link_id: String,
        owner_id: String,
    ) -> RepositoryResult<Contact> {
        self.repository
            .create_with_defaults(name, description, group_id, user_link_id, owner_id)
    }

    // 获取所有联系人
    pub fn get_all_contacts(&self) -> RepositoryResult<Vec<Contact>> {
        self.repository.find_all()
    }

    // 根据ID获取联系人
    pub fn get_contact_by_id(&self, id: &str) -> RepositoryResult<Contact> {
        self.repository.find_by_id(id)
    }

    // 根据拥有者ID获取联系人
    pub fn get_contacts_by_owner_id(&self, owner_id: &str) -> RepositoryResult<Vec<Contact>> {
        self.repository.find_by_owner_id(owner_id)
    }

    // 根据分组ID获取联系人
    pub fn get_contacts_by_group_id(&self, group_id: &str) -> RepositoryResult<Vec<Contact>> {
        self.repository.find_by_group_id(group_id)
    }

    // 根据联系人用户链接ID获取联系人
    pub fn get_contacts_by_user_link_id(
        &self,
        user_link_id: &str,
    ) -> RepositoryResult<Vec<Contact>> {
        self.repository.find_by_user_link_id(user_link_id)
    }

    // 更新联系人
    pub fn update_contact(
        &self,
        id: &str,
        name: String,
        description: Option<String>,
        group_id: String,
    ) -> RepositoryResult<Contact> {
        // 检查联系人是否存在
        let mut contact = self.repository.find_by_id(id)?;

        // 更新联系人信息
        contact.name = name;
        contact.description = description;
        contact.group_id = group_id;

        self.repository.update(id, contact)
    }

    // 删除联系人及其相关数据
    pub fn delete_contact(&self, id: &str, owner_id: &str) -> RepositoryResult<()> {
        // 检查联系人是否存在
        self.repository.find_by_id(id)?;

        // 删除联系人及其相关数据
        self.repository
            .delete_contact_with_related_data(id, owner_id)
    }

    // 获取所有联系人及其分组信息
    pub fn get_all_contacts_with_group(&self) -> RepositoryResult<Vec<ContactWithGroup>> {
        self.repository.find_all_with_group()
    }

    // 根据ID获取联系人及其分组信息
    pub fn get_contact_by_id_with_group(&self, id: &str) -> RepositoryResult<ContactWithGroup> {
        self.repository.find_by_id_with_group(id)
    }

    // 根据拥有者ID获取联系人及其分组信息
    pub fn get_contacts_by_owner_id_with_group(
        &self,
        owner_id: &str,
    ) -> RepositoryResult<Vec<ContactWithGroup>> {
        self.repository.find_by_owner_id_with_group(owner_id)
    }

    // 根据分组ID获取联系人及其分组信息
    pub fn get_contacts_by_group_id_with_group(
        &self,
        group_id: &str,
    ) -> RepositoryResult<Vec<ContactWithGroup>> {
        self.repository.find_by_group_id_with_group(group_id)
    }

    /// 创建AI联系人（原子操作）
    ///
    /// 这个方法执行以下步骤：
    /// 1. 创建Agent
    /// 2. 创建AI用户
    /// 3. 更新Agent关联到AI用户
    /// 4. 创建联系人用户链接
    /// 5. 创建联系人
    ///
    /// 所有操作在一个事务中执行，确保原子性
    pub fn create_ai_contact(
        &self,
        // Agent参数
        agent_name: String,
        model_name: String,
        system_prompt: String,
        temperature: f32,
        max_tokens: Option<i32>,
        top_p: Option<f32>,
        avatar_url: Option<String>,
        agent_description: Option<String>,
        is_streaming: bool,

        // 联系人参数
        contact_description: Option<String>,
        group_id: String,
        owner_user_id: String,
    ) -> RepositoryResult<Contact> {
        self.repository.create_ai_contact(
            agent_name,
            model_name,
            system_prompt,
            temperature,
            max_tokens,
            top_p,
            avatar_url,
            agent_description,
            is_streaming,
            contact_description,
            group_id,
            owner_user_id,
        )
    }
}
