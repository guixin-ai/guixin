use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{
    Agent, Chat, ChatParticipant, Contact, ContactGroup, ContactUserLink, ContactWithGroup,
    Conversation, NewAgent, NewContact, NewContactUserLink, NewUser, User,
};
use crate::schema::{
    agents, attachments, chat_participants, chats, contact_groups, contact_user_links, contacts,
    conversations, message_receipts, messages, users,
};

pub struct ContactRepository {
    pool: DbPool,
}

impl ContactRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    // 创建新联系人
    pub fn create(&self, new_contact: NewContact) -> RepositoryResult<Contact> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::insert_into(contacts::table)
            .values(&new_contact)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        contacts::table
            .filter(contacts::id.eq(&new_contact.id))
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据ID查找联系人
    pub fn find_by_id(&self, id: &str) -> RepositoryResult<Contact> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        contacts::table
            .filter(contacts::id.eq(id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("联系人 ID: {}", id))
                }
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 根据拥有者ID查找联系人
    pub fn find_by_owner_id(&self, owner_id: &str) -> RepositoryResult<Vec<Contact>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        contacts::table
            .filter(contacts::owner_id.eq(owner_id))
            .load::<Contact>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据组ID查找联系人
    pub fn find_by_group_id(&self, group_id: &str) -> RepositoryResult<Vec<Contact>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        contacts::table
            .filter(contacts::group_id.eq(group_id))
            .load::<Contact>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据联系人用户链接ID查找联系人
    pub fn find_by_user_link_id(&self, user_link_id: &str) -> RepositoryResult<Vec<Contact>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        contacts::table
            .filter(contacts::user_link_id.eq(user_link_id))
            .load::<Contact>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 查找所有联系人
    pub fn find_all(&self) -> RepositoryResult<Vec<Contact>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        contacts::table
            .load::<Contact>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 更新联系人
    pub fn update(&self, id: &str, contact: Contact) -> RepositoryResult<Contact> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(contacts::table.filter(contacts::id.eq(id)))
            .set((
                contacts::name.eq(&contact.name),
                contacts::description.eq(&contact.description),
                contacts::group_id.eq(&contact.group_id),
                contacts::owner_id.eq(&contact.owner_id),
                contacts::user_link_id.eq(&contact.user_link_id),
                contacts::updated_at.eq(Utc::now().naive_utc()),
            ))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        self.find_by_id(id)
    }

    // 删除联系人及相关数据
    pub fn delete_contact_with_related_data(
        &self,
        contact_id: &str,
        owner_id: &str,
    ) -> RepositoryResult<()> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        // 开始事务
        conn.transaction(|conn| {
            // 1. 获取联系人信息
            let contact = contacts::table
                .filter(contacts::id.eq(contact_id))
                .first::<Contact>(conn)?;

            // 2. 获取关联的用户ID和分组ID
            let group_id = contact.group_id.clone();
            let user_link_id = contact.user_link_id.clone();

            let user_link = contact_user_links::table
                .filter(contact_user_links::id.eq(&user_link_id))
                .first::<ContactUserLink>(conn)?;

            let linked_user_id = user_link.user_id.clone();

            // 3. 找到当前用户和联系人用户之间的单聊
            // 首先找到两个用户都参与的聊天
            let owner_chats = chat_participants::table
                .filter(chat_participants::user_id.eq(owner_id))
                .select(chat_participants::chat_id)
                .load::<String>(conn)?;

            let contact_chats = chat_participants::table
                .filter(chat_participants::user_id.eq(&linked_user_id))
                .select(chat_participants::chat_id)
                .load::<String>(conn)?;

            // 找出两个用户共同参与的聊天
            let common_chat_ids: Vec<String> = owner_chats
                .into_iter()
                .filter(|id| contact_chats.contains(id))
                .collect();

            // 从共同聊天中筛选出类型为"individual"的单聊
            let individual_chats = chats::table
                .filter(chats::id.eq_any(&common_chat_ids))
                .filter(chats::type_.eq("individual"))
                .load::<Chat>(conn)?;

            let individual_chat_ids: Vec<String> = individual_chats
                .iter()
                .map(|chat| chat.id.clone())
                .collect();

            // 4. 删除单聊及相关数据
            for chat_id in &individual_chat_ids {
                // 获取会话ID
                let conversation = conversations::table
                    .filter(conversations::chat_id.eq(chat_id))
                    .first::<Conversation>(conn)?;

                // 删除所有消息的附件
                diesel::delete(
                    attachments::table.filter(
                        attachments::message_id.eq_any(
                            messages::table
                                .filter(messages::conversation_id.eq(&conversation.id))
                                .select(messages::id),
                        ),
                    ),
                )
                .execute(conn)?;

                // 删除所有消息的接收记录
                diesel::delete(
                    message_receipts::table.filter(
                        message_receipts::message_id.eq_any(
                            messages::table
                                .filter(messages::conversation_id.eq(&conversation.id))
                                .select(messages::id),
                        ),
                    ),
                )
                .execute(conn)?;

                // 删除所有消息
                diesel::delete(
                    messages::table.filter(messages::conversation_id.eq(&conversation.id)),
                )
                .execute(conn)?;

                // 删除会话
                diesel::delete(conversations::table.filter(conversations::id.eq(&conversation.id)))
                    .execute(conn)?;

                // 删除聊天参与者
                diesel::delete(
                    chat_participants::table.filter(chat_participants::chat_id.eq(chat_id)),
                )
                .execute(conn)?;

                // 删除聊天
                diesel::delete(chats::table.filter(chats::id.eq(chat_id))).execute(conn)?;
            }

            // 5. 删除联系人
            diesel::delete(contacts::table.filter(contacts::id.eq(contact_id))).execute(conn)?;

            // 6. 检查联系人分组是否还有其他联系人
            let remaining_contacts_in_group: i64 = contacts::table
                .filter(contacts::group_id.eq(&group_id))
                .count()
                .get_result(conn)?;

            // 如果分组中没有其他联系人，则删除分组
            if remaining_contacts_in_group == 0 {
                diesel::delete(contact_groups::table.filter(contact_groups::id.eq(&group_id)))
                    .execute(conn)?;
            }

            // 7. 检查是否还有其他联系人使用同一个用户链接
            let remaining_contacts_with_link: i64 = contacts::table
                .filter(contacts::user_link_id.eq(&user_link_id))
                .count()
                .get_result(conn)?;

            // 如果没有其他联系人使用该链接，则删除链接
            if remaining_contacts_with_link == 0 {
                diesel::delete(
                    contact_user_links::table.filter(contact_user_links::id.eq(&user_link_id)),
                )
                .execute(conn)?;

                // 8. 检查关联用户是否还参与其他聊天或拥有其他联系人
                // 获取该用户参与的所有聊天
                let user_chats_count: i64 = chat_participants::table
                    .filter(chat_participants::user_id.eq(&linked_user_id))
                    .count()
                    .get_result(conn)?;

                // 检查用户是否拥有其他联系人
                let user_owned_contacts_count: i64 = contacts::table
                    .filter(contacts::owner_id.eq(&linked_user_id))
                    .count()
                    .get_result(conn)?;

                // 如果用户没有参与任何聊天且没有拥有任何联系人，可以删除用户
                if user_chats_count == 0 && user_owned_contacts_count == 0 {
                    // 检查是否为AI用户，如果是，还需要删除关联的Agent
                    let user = users::table
                        .filter(users::id.eq(&linked_user_id))
                        .first::<User>(conn)?;

                    if user.is_ai {
                        diesel::delete(agents::table.filter(agents::user_id.eq(&linked_user_id)))
                            .execute(conn)?;
                    }

                    // 删除用户
                    diesel::delete(users::table.filter(users::id.eq(&linked_user_id)))
                        .execute(conn)?;
                }
                // 如果用户还参与其他聊天或拥有其他联系人，则保留用户
            }

            Ok(())
        })
        .map_err(RepositoryError::DatabaseError)
    }

    // 创建新联系人（自动生成ID和时间戳）
    pub fn create_with_defaults(
        &self,
        name: String,
        description: Option<String>,
        group_id: String,
        user_link_id: String,
        owner_id: String,
    ) -> RepositoryResult<Contact> {
        let now = Utc::now().naive_utc();
        let new_contact = NewContact {
            id: Uuid::new_v4().to_string(),
            name,
            description,
            created_at: now,
            updated_at: now,
            group_id,
            user_link_id,
            owner_id,
        };

        self.create(new_contact)
    }

    // 查询所有联系人及其分组信息
    pub fn find_all_with_group(&self) -> RepositoryResult<Vec<ContactWithGroup>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        let results = contacts::table
            .inner_join(contact_groups::table)
            .load::<(Contact, ContactGroup)>(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(results
            .into_iter()
            .map(|(contact, group)| ContactWithGroup { contact, group })
            .collect())
    }

    // 根据拥有者ID查询联系人及其分组信息
    pub fn find_by_owner_id_with_group(
        &self,
        owner_id: &str,
    ) -> RepositoryResult<Vec<ContactWithGroup>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        let results = contacts::table
            .inner_join(contact_groups::table)
            .filter(contacts::owner_id.eq(owner_id))
            .load::<(Contact, ContactGroup)>(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(results
            .into_iter()
            .map(|(contact, group)| ContactWithGroup { contact, group })
            .collect())
    }

    // 根据分组ID查询联系人及其分组信息
    pub fn find_by_group_id_with_group(
        &self,
        group_id: &str,
    ) -> RepositoryResult<Vec<ContactWithGroup>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        let results = contacts::table
            .inner_join(contact_groups::table)
            .filter(contacts::group_id.eq(group_id))
            .load::<(Contact, ContactGroup)>(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(results
            .into_iter()
            .map(|(contact, group)| ContactWithGroup { contact, group })
            .collect())
    }

    // 根据ID查询联系人及其分组信息
    pub fn find_by_id_with_group(&self, id: &str) -> RepositoryResult<ContactWithGroup> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        let result = contacts::table
            .inner_join(contact_groups::table)
            .filter(contacts::id.eq(id))
            .first::<(Contact, ContactGroup)>(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("联系人 ID: {}", id))
                }
                _ => RepositoryError::DatabaseError(e),
            })?;

        Ok(ContactWithGroup {
            contact: result.0,
            group: result.1,
        })
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
        // 获取数据库连接
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        // 开始事务
        conn.transaction(|conn| {
            // 1. 创建Agent
            let agent_id = Uuid::new_v4().to_string();
            let now = Utc::now().naive_utc();
            let new_agent = NewAgent {
                id: agent_id.clone(),
                name: agent_name.clone(),
                model_name,
                system_prompt,
                temperature,
                max_tokens,
                top_p,
                avatar_url: avatar_url.clone(),
                description: agent_description.clone(),
                is_streaming,
                user_id: None, // 暂时不关联用户
                created_at: now,
                updated_at: now,
            };

            // 插入Agent
            diesel::insert_into(agents::table)
                .values(&new_agent)
                .execute(conn)
                .map_err(RepositoryError::DatabaseError)?;

            let agent = agents::table
                .filter(agents::id.eq(&agent_id))
                .first::<Agent>(conn)
                .map_err(RepositoryError::DatabaseError)?;

            // 2. 创建AI用户
            let user_id = Uuid::new_v4().to_string();
            let new_user = NewUser {
                id: user_id.clone(),
                name: agent_name.clone(),
                email: None, // AI用户不需要邮箱
                avatar_url: avatar_url,
                description: agent_description,
                is_ai: true,
                cloud_id: None,
                sync_enabled: false,
                last_sync_time: None,
                theme: "system".to_string(),
                language: "zh-CN".to_string(),
                font_size: 14,
                custom_settings: None,
                created_at: now,
                updated_at: now,
            };

            // 插入User
            diesel::insert_into(users::table)
                .values(&new_user)
                .execute(conn)
                .map_err(RepositoryError::DatabaseError)?;

            let ai_user = users::table
                .filter(users::id.eq(&user_id))
                .first::<User>(conn)
                .map_err(RepositoryError::DatabaseError)?;

            // 3. 更新Agent关联到AI用户
            diesel::update(agents::table.filter(agents::id.eq(&agent.id)))
                .set(agents::user_id.eq(Some(&ai_user.id)))
                .execute(conn)
                .map_err(RepositoryError::DatabaseError)?;

            // 4. 创建联系人用户链接
            let user_link_id = Uuid::new_v4().to_string();
            let new_user_link = NewContactUserLink {
                id: user_link_id.clone(),
                user_id: ai_user.id.clone(),
                created_at: now,
            };

            // 插入ContactUserLink
            diesel::insert_into(contact_user_links::table)
                .values(&new_user_link)
                .execute(conn)
                .map_err(RepositoryError::DatabaseError)?;

            let user_link = contact_user_links::table
                .filter(contact_user_links::id.eq(&user_link_id))
                .first::<ContactUserLink>(conn)
                .map_err(RepositoryError::DatabaseError)?;

            // 5. 创建联系人
            let contact_id = Uuid::new_v4().to_string();
            let new_contact = NewContact {
                id: contact_id,
                name: agent_name,
                description: contact_description,
                group_id,
                owner_id: owner_user_id,
                user_link_id: user_link.id,
                created_at: now,
                updated_at: now,
            };

            // 插入Contact
            diesel::insert_into(contacts::table)
                .values(&new_contact)
                .execute(conn)
                .map_err(RepositoryError::DatabaseError)?;

            let contact = contacts::table
                .filter(contacts::id.eq(&new_contact.id))
                .first::<Contact>(conn)
                .map_err(RepositoryError::DatabaseError)?;

            Ok(contact)
        })
    }
}
