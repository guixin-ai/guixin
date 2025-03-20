use anyhow::{anyhow, Result};
use chrono::Utc;
use diesel::{Connection, SqliteConnection};
use uuid::Uuid;

use crate::db::DbPool;
use crate::models::{
    Conversation, Message, MessageReceipt, NewConversation, NewMessage, NewMessageReceipt,
    MessageDetails, MessageWithDetails,
};
use crate::repositories::conversation_repository::ConversationRepository;
use crate::repositories::error::{RepositoryError, RepositoryResult};
use crate::repositories::message_receipt_repository::MessageReceiptRepository;
use crate::repositories::message_repository::MessageRepository;
use crate::repositories::chat_repository::ChatRepository;
use crate::repositories::user_repository::UserRepository;

use super::ServiceResult;

pub struct MessageService {
    message_repository: MessageRepository,
    message_receipt_repository: MessageReceiptRepository,
    conversation_repository: ConversationRepository,
}

impl MessageService {
    pub fn new(pool: DbPool) -> Self {
        Self {
            message_repository: MessageRepository::new(pool.clone()),
            message_receipt_repository: MessageReceiptRepository::new(pool.clone()),
            conversation_repository: ConversationRepository::new(pool),
        }
    }

    // 创建新会话
    pub fn create_conversation(&self, chat_id: String) -> RepositoryResult<Conversation> {
        self.conversation_repository.create_with_defaults(chat_id)
    }

    // 获取聊天的所有会话
    pub fn get_conversations_by_chat_id(
        &self,
        chat_id: &str,
    ) -> RepositoryResult<Vec<Conversation>> {
        self.conversation_repository.find_by_chat_id(chat_id)
    }

    // 获取会话详情
    pub fn get_conversation_by_id(&self, id: &str) -> RepositoryResult<Conversation> {
        self.conversation_repository.find_by_id(id)
    }

    // 删除会话
    pub fn delete_conversation(&self, id: &str) -> RepositoryResult<usize> {
        self.conversation_repository.delete(id)
    }

    // 发送消息
    pub fn send_message(
        pool: &SqliteConnection,
        chat_id: &str,
        sender_id: &str,
        content: &str,
    ) -> Result<Message> {
        // 验证聊天和发送者是否存在
        let chat_repo = ChatRepository::new(pool);
        let user_repo = UserRepository::new(pool);
        
        if chat_repo.get_by_id(chat_id)?.is_none() {
            return Err(anyhow!("聊天不存在"));
        }
        
        if user_repo.get_by_id(sender_id)?.is_none() {
            return Err(anyhow!("用户不存在"));
        }
        
        // 创建消息
        let message = Message {
            id: Uuid::new_v4().to_string(),
            content: content.to_string(),
            created_at: Utc::now().naive_utc(),
            updated_at: Utc::now().naive_utc(),
            chat_id: chat_id.to_string(),
            sender_id: sender_id.to_string(),
        };
        
        let message_repo = MessageRepository::new(pool);
        message_repo.create(&message)?;
        
        Ok(message)
    }
    
    // 获取聊天的消息列表
    pub fn get_chat_messages(
        pool: &SqliteConnection,
        chat_id: &str,
        page: i64,
        page_size: i64,
    ) -> Result<Vec<MessageWithDetails>> {
        let message_repo = MessageRepository::new(pool);
        let offset = (page - 1) * page_size;
        
        message_repo.get_messages_with_details_by_chat_id(chat_id, offset, page_size)
    }
    
    // 根据ID获取消息
    pub fn get_message_by_id(pool: &SqliteConnection, id: &str) -> Result<Message> {
        let message_repo = MessageRepository::new(pool);
        
        message_repo.get_by_id(id)?
            .ok_or_else(|| anyhow!("消息不存在"))
    }
    
    // 删除消息
    pub fn delete_message(pool: &SqliteConnection, id: &str) -> Result<()> {
        let message_repo = MessageRepository::new(pool);
        
        if message_repo.get_by_id(id)?.is_none() {
            return Err(anyhow!("消息不存在"));
        }
        
        message_repo.delete(id)?;
        Ok(())
    }

    // 获取消息详情
    pub fn get_message_details(pool: &DbPool, id: &str) -> ServiceResult<MessageDetails> {
        let message_details = MessageRepository::get_details(pool, id)?;
        Ok(message_details)
    }

    // 获取聊天的所有消息
    pub fn get_chat_messages(pool: &DbPool, chat_id: &str) -> ServiceResult<Vec<Message>> {
        // 验证聊天是否存在
        ChatRepository::get(pool, chat_id)
            .map_err(|e| anyhow!("查找聊天失败: {}", e))?;

        let messages = MessageRepository::get_by_chat(pool, chat_id)?;
        Ok(messages)
    }

    // 获取聊天的所有消息详情
    pub fn get_chat_message_details(pool: &DbPool, chat_id: &str) -> ServiceResult<Vec<MessageDetails>> {
        // 验证聊天是否存在
        ChatRepository::get(pool, chat_id)
            .map_err(|e| anyhow!("查找聊天失败: {}", e))?;

        let message_details = MessageRepository::get_details_by_chat(pool, chat_id)?;
        Ok(message_details)
    }

    // 更新消息内容
    pub fn update_message_content(
        pool: &DbPool,
        id: &str,
        content: String,
    ) -> ServiceResult<Message> {
        // 验证消息是否存在
        MessageRepository::get(pool, id)
            .map_err(|e| anyhow!("查找消息失败: {}", e))?;

        let message = MessageRepository::update_content(pool, id, content)?;
        Ok(message)
    }

    // 获取会话的所有消息
    pub fn get_messages_by_conversation_id(
        &self,
        conversation_id: &str,
    ) -> RepositoryResult<Vec<Message>> {
        self.message_repository
            .find_by_conversation_id(conversation_id)
    }

    // 获取消息的所有接收记录
    pub fn get_message_receipts(&self, message_id: &str) -> RepositoryResult<Vec<MessageReceipt>> {
        self.message_receipt_repository
            .find_by_message_id(message_id)
    }

    // 获取用户接收的所有消息记录
    pub fn get_received_messages(
        &self,
        receiver_id: &str,
    ) -> RepositoryResult<Vec<MessageReceipt>> {
        self.message_receipt_repository
            .find_by_receiver_id(receiver_id)
    }

    // 更新消息状态
    pub fn update_message_status(&self, id: &str, status: &str) -> RepositoryResult<Message> {
        self.message_repository.update_status(id, status)
    }

    // 更新消息接收记录状态
    pub fn update_receipt_status(
        &self,
        id: &str,
        status: &str,
    ) -> RepositoryResult<MessageReceipt> {
        self.message_receipt_repository.update_status(id, status)
    }

    // 标记消息为已读
    pub fn mark_message_as_read(
        &self,
        message_id: &str,
        receiver_id: &str,
    ) -> RepositoryResult<MessageReceipt> {
        // 查找消息接收记录
        let receipt = self
            .message_receipt_repository
            .find_by_message_and_receiver(message_id, receiver_id)?;

        // 更新状态为已读
        self.message_receipt_repository
            .update_status(&receipt.id, "read")
    }
}
