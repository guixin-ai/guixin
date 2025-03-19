use crate::db::DbPool;
use crate::models::{
    Conversation, Message, MessageReceipt, NewConversation, NewMessage, NewMessageReceipt,
};
use crate::repositories::conversation_repository::ConversationRepository;
use crate::repositories::error::{RepositoryError, RepositoryResult};
use crate::repositories::message_receipt_repository::MessageReceiptRepository;
use crate::repositories::message_repository::MessageRepository;

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
        &self,
        content: String,
        content_type: String,
        conversation_id: String,
        sender_id: String,
        receiver_ids: Vec<String>,
    ) -> RepositoryResult<Message> {
        // 检查会话是否存在
        self.conversation_repository.find_by_id(&conversation_id)?;

        // 创建消息
        let message = self.message_repository.create_with_defaults(
            content,
            content_type,
            conversation_id,
            sender_id,
        )?;

        // 为每个接收者创建消息接收记录
        for receiver_id in receiver_ids {
            self.message_receipt_repository.create_with_defaults(
                message.id.clone(),
                receiver_id,
                "delivered".to_string(),
            )?;
        }

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

    // 获取消息详情
    pub fn get_message_by_id(&self, id: &str) -> RepositoryResult<Message> {
        self.message_repository.find_by_id(id)
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

    // 删除消息
    pub fn delete_message(&self, id: &str) -> RepositoryResult<usize> {
        self.message_repository.delete(id)
    }
}
