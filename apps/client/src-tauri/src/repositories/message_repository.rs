use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{Message, MessageWithDetails, NewMessage, MessageDetails, User};
use crate::schema::{messages, users};

pub struct MessageRepository;

impl MessageRepository {
    // 创建消息
    pub fn create(
        pool: &DbPool,
        content: String,
        chat_id: &str,
        sender_id: &str,
    ) -> Result<Message, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let new_message = NewMessage {
            id: Uuid::new_v4().to_string(),
            content,
            created_at: Utc::now().naive_utc(),
            updated_at: Utc::now().naive_utc(),
            chat_id: chat_id.to_string(),
            sender_id: sender_id.to_string(),
        };

        diesel::insert_into(messages::table)
            .values(&new_message)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        let message = messages::table
            .filter(messages::id.eq(&new_message.id))
            .select(Message::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(message)
    }

    // 获取消息
    pub fn get(pool: &DbPool, id: &str) -> Result<Message, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let message = messages::table
            .filter(messages::id.eq(id))
            .select(Message::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(message)
    }

    // 获取消息详情
    pub fn get_details(pool: &DbPool, id: &str) -> Result<MessageDetails, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let message = Self::get(pool, id)?;
        
        let sender = users::table
            .filter(users::id.eq(&message.sender_id))
            .select(User::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(message.to_details(sender))
    }

    // 获取聊天的所有消息
    pub fn get_by_chat(pool: &DbPool, chat_id: &str) -> Result<Vec<Message>, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let messages_list = messages::table
            .filter(messages::chat_id.eq(chat_id))
            .order(messages::created_at.asc())
            .select(Message::as_select())
            .load(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(messages_list)
    }

    // 获取聊天的所有消息详情
    pub fn get_details_by_chat(pool: &DbPool, chat_id: &str) -> Result<Vec<MessageDetails>, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        let messages_list = Self::get_by_chat(pool, chat_id)?;
        
        let mut message_details = Vec::new();
        
        for message in messages_list {
            let sender = users::table
                .filter(users::id.eq(&message.sender_id))
                .select(User::as_select())
                .first(&mut conn)
                .map_err(RepositoryError::DatabaseError)?;
                
            message_details.push(message.to_details(sender));
        }

        Ok(message_details)
    }

    // 更新消息内容
    pub fn update_content(
        pool: &DbPool,
        id: &str,
        content: String,
    ) -> Result<Message, RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        diesel::update(messages::table.filter(messages::id.eq(id)))
            .set((
                messages::content.eq(content),
                messages::updated_at.eq(Utc::now().naive_utc()),
            ))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        let updated_message = messages::table
            .filter(messages::id.eq(id))
            .select(Message::as_select())
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(updated_message)
    }

    // 删除消息
    pub fn delete(pool: &DbPool, id: &str) -> Result<(), RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;

        diesel::delete(messages::table.filter(messages::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        Ok(())
    }

    // 根据会话ID查找消息
    pub fn find_by_conversation_id(&self, conversation_id: &str) -> RepositoryResult<Vec<Message>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        messages::table
            .filter(messages::conversation_id.eq(conversation_id))
            .order(messages::created_at.asc())
            .load::<Message>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据发送者ID查找消息
    pub fn find_by_sender_id(&self, sender_id: &str) -> RepositoryResult<Vec<Message>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        messages::table
            .filter(messages::sender_id.eq(sender_id))
            .order(messages::created_at.desc())
            .load::<Message>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 更新消息
    pub fn update(&self, id: &str, message: Message) -> RepositoryResult<Message> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(messages::table.filter(messages::id.eq(id)))
            .set((
                messages::content.eq(&message.content),
                messages::content_type.eq(&message.content_type),
                messages::status.eq(&message.status),
                messages::updated_at.eq(Utc::now().naive_utc()),
            ))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        self.find_by_id(id)
    }

    // 更新消息状态
    pub fn update_status(&self, id: &str, status: &str) -> RepositoryResult<Message> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(messages::table.filter(messages::id.eq(id)))
            .set((
                messages::status.eq(status),
                messages::updated_at.eq(Utc::now().naive_utc()),
            ))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        self.find_by_id(id)
    }

    // 根据ID查找消息
    pub fn find_by_id(&self, id: &str) -> RepositoryResult<Message> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        messages::table
            .filter(messages::id.eq(id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("消息 ID: {}", id))
                }
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 创建新消息（自动生成ID和时间戳）
    pub fn create_with_defaults(
        &self,
        content: String,
        content_type: String,
        conversation_id: String,
        sender_id: String,
    ) -> RepositoryResult<Message> {
        let now = Utc::now().naive_utc();
        let new_message = NewMessage {
            id: Uuid::new_v4().to_string(),
            content,
            content_type,
            status: "sent".to_string(),
            created_at: now,
            updated_at: now,
            conversation_id,
            sender_id,
        };

        self.create(new_message)
    }

    // 分页查询会话消息
    pub fn find_by_conversation_id_paginated(
        &self,
        conversation_id: &str,
        page: u32,
        page_size: u32,
    ) -> RepositoryResult<Vec<Message>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        let offset = (page - 1) * page_size;

        messages::table
            .filter(messages::conversation_id.eq(conversation_id))
            .order(messages::created_at.desc()) // 默认从新到旧排序
            .limit(page_size.into())
            .offset(offset.into())
            .load::<Message>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 带详情信息的消息（包含发送者和接收状态等）
    pub fn find_by_conversation_with_details(
        &self,
        conversation_id: &str,
        page: u32,
        page_size: u32,
    ) -> RepositoryResult<Vec<MessageWithDetails>> {
        // 此处需要在models.rs中定义MessageWithDetails结构体
        // 目前简单返回消息列表，实际项目中应关联查询用户表和消息接收表
        let messages = self.find_by_conversation_id_paginated(conversation_id, page, page_size)?;

        // 将Message转换为MessageWithDetails
        let messages_with_details = messages
            .into_iter()
            .map(|msg| MessageWithDetails {
                id: msg.id,
                content: msg.content,
                content_type: msg.content_type,
                status: msg.status,
                created_at: msg.created_at,
                updated_at: msg.updated_at,
                conversation_id: msg.conversation_id.clone(),
                sender_id: msg.sender_id.clone(),
                sender_name: None,   // 需要关联查询用户表获取
                receipts: vec![],    // 需要关联查询消息接收表获取
                attachments: vec![], // 需要关联查询附件表获取
            })
            .collect();

        Ok(messages_with_details)
    }
}
