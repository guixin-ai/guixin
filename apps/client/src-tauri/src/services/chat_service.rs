use crate::db::DbPool;
use crate::models::{
    Chat, ChatParticipant, ChatWithDetails, Message, MessageReceipt, MessageWithDetails, NewChat,
    NewChatParticipant,
};
use crate::repositories::chat_participant_repository::ChatParticipantRepository;
use crate::repositories::chat_repository::ChatRepository;
use crate::repositories::conversation_repository::ConversationRepository;
use crate::repositories::error::{RepositoryError, RepositoryResult};
use crate::repositories::message_receipt_repository::MessageReceiptRepository;
use crate::repositories::message_repository::MessageRepository;

pub struct ChatService {
    chat_repository: ChatRepository,
    participant_repository: ChatParticipantRepository,
    conversation_repository: ConversationRepository,
    message_repository: MessageRepository,
    message_receipt_repository: MessageReceiptRepository,
}

impl ChatService {
    pub fn new(pool: DbPool) -> Self {
        Self {
            chat_repository: ChatRepository::new(pool.clone()),
            participant_repository: ChatParticipantRepository::new(pool.clone()),
            conversation_repository: ConversationRepository::new(pool.clone()),
            message_repository: MessageRepository::new(pool.clone()),
            message_receipt_repository: MessageReceiptRepository::new(pool),
        }
    }

    // 创建新聊天
    pub fn create_chat(&self, title: String, chat_type: String) -> RepositoryResult<Chat> {
        self.chat_repository.create_with_defaults(title, chat_type)
    }

    // 获取所有聊天
    pub fn get_all_chats(&self) -> RepositoryResult<Vec<Chat>> {
        self.chat_repository.find_all()
    }

    // 根据ID获取聊天
    pub fn get_chat_by_id(&self, id: &str) -> RepositoryResult<Chat> {
        self.chat_repository.find_by_id(id)
    }

    // 根据类型获取聊天
    pub fn get_chats_by_type(&self, chat_type: &str) -> RepositoryResult<Vec<Chat>> {
        self.chat_repository.find_by_type(chat_type)
    }

    // 根据用户ID获取聊天
    pub fn get_chats_by_user_id(&self, user_id: &str) -> RepositoryResult<Vec<Chat>> {
        self.chat_repository.find_by_user_id(user_id)
    }

    // 根据用户ID获取带有详细信息的聊天列表
    pub fn get_chats_with_details_by_user_id(
        &self,
        user_id: &str,
    ) -> RepositoryResult<Vec<ChatWithDetails>> {
        self.chat_repository.find_with_details_by_user_id(user_id)
    }

    // 更新聊天
    pub fn update_chat(
        &self,
        id: &str,
        title: String,
        chat_type: String,
    ) -> RepositoryResult<Chat> {
        // 检查聊天是否存在
        let mut chat = self.chat_repository.find_by_id(id)?;

        // 更新聊天信息
        chat.title = title;
        chat.type_ = chat_type;

        self.chat_repository.update(id, chat)
    }

    // 删除聊天
    pub fn delete_chat(&self, id: &str) -> RepositoryResult<usize> {
        // 检查聊天是否存在
        self.chat_repository.find_by_id(id)?;

        self.chat_repository.delete(id)
    }

    // 添加聊天参与者
    pub fn add_participant(
        &self,
        chat_id: String,
        user_id: String,
        role: String,
    ) -> RepositoryResult<ChatParticipant> {
        // 检查聊天是否存在
        self.chat_repository.find_by_id(&chat_id)?;

        // 检查用户是否已经在聊天中
        let existing = self
            .participant_repository
            .find_by_chat_and_user(&chat_id, &user_id);
        if existing.is_ok() {
            return Err(RepositoryError::AlreadyExists(format!(
                "用户 {} 已经在聊天 {} 中",
                user_id, chat_id
            )));
        }

        self.participant_repository
            .create_with_defaults(chat_id, user_id, role)
    }

    // 获取聊天参与者
    pub fn get_participants(&self, chat_id: &str) -> RepositoryResult<Vec<ChatParticipant>> {
        self.participant_repository.find_by_chat_id(chat_id)
    }

    // 移除聊天参与者
    pub fn remove_participant(&self, chat_id: &str, user_id: &str) -> RepositoryResult<usize> {
        self.participant_repository
            .remove_from_chat(chat_id, user_id)
    }

    // 更新聊天的最后消息信息
    pub fn update_last_message(
        &self,
        chat_id: &str,
        message_id: &str,
        content: &str,
        message_type: &str,
        sender_id: &str,
    ) -> RepositoryResult<Chat> {
        self.chat_repository.update_last_message(
            chat_id,
            message_id,
            content,
            message_type,
            sender_id,
        )
    }

    // 增加未读消息计数
    pub fn increment_unread_count(
        &self,
        chat_id: &str,
        user_id: &str,
    ) -> RepositoryResult<ChatParticipant> {
        self.participant_repository
            .increment_unread_count(chat_id, user_id)
    }

    // 重置未读消息计数
    pub fn reset_unread_count(
        &self,
        chat_id: &str,
        user_id: &str,
    ) -> RepositoryResult<ChatParticipant> {
        self.participant_repository
            .reset_unread_count(chat_id, user_id)
    }

    // 标记消息为已读
    pub fn mark_as_read(
        &self,
        chat_id: &str,
        user_id: &str,
        message_id: &str,
    ) -> RepositoryResult<ChatParticipant> {
        self.participant_repository
            .update_last_read_message(chat_id, user_id, message_id)
    }

    /// 创建单聊（一对一聊天）
    ///
    /// 该方法在一个事务中完成以下操作：
    /// 1. 创建新的聊天记录
    /// 2. 添加两个参与者（发起者和接收者）
    /// 3. 创建会话记录
    /// 4. 如果提供了初始消息，则创建消息和消息接收记录
    ///
    /// # 参数
    /// * `initiator_id` - 发起聊天的用户ID
    /// * `receiver_id` - 接收聊天的用户ID
    /// * `title` - 聊天标题，通常是接收者的名称或自定义标题
    /// * `initial_message` - 可选的初始消息内容
    ///
    /// # 返回
    /// 成功创建的聊天记录
    pub fn create_individual_chat(
        &self,
        initiator_id: String,
        receiver_id: String,
        title: String,
        initial_message: Option<String>,
    ) -> RepositoryResult<Chat> {
        self.chat_repository.create_individual_chat(
            &initiator_id,
            &receiver_id,
            title,
            initial_message,
        )
    }

    /// 发送消息
    ///
    /// # 参数
    /// * `chat_id` - 聊天ID
    /// * `sender_id` - 发送者ID
    /// * `content` - 消息内容
    /// * `content_type` - 消息类型（text, image等）
    ///
    /// # 返回
    /// * `Result<Message, String>` - 成功返回创建的消息，失败返回错误信息
    pub fn send_message(
        &self,
        chat_id: &str,
        sender_id: &str,
        content: String,
        content_type: String,
    ) -> RepositoryResult<Message> {
        // 1. 检查聊天是否存在
        self.chat_repository.find_by_id(chat_id)?;

        // 2. 检查发送者是否是聊天参与者
        self.participant_repository
            .find_by_chat_and_user(chat_id, sender_id)?;

        // 3. 发送消息
        self.chat_repository
            .send_message(chat_id, sender_id, content, content_type)
    }

    /// 更新消息状态
    ///
    /// # 参数
    /// * `message_id` - 消息ID
    /// * `receiver_id` - 接收者ID
    /// * `status` - 新状态（delivered, read）
    ///
    /// # 返回
    /// * `Result<MessageReceipt, String>` - 成功返回更新后的接收记录，失败返回错误信息
    pub fn update_message_status(
        &self,
        message_id: &str,
        receiver_id: &str,
        status: String,
    ) -> RepositoryResult<MessageReceipt> {
        // 1. 检查消息是否存在
        self.message_repository.find_by_id(message_id)?;

        // 2. 检查接收者是否是消息的接收者
        self.message_receipt_repository
            .find_by_message_and_receiver(message_id, receiver_id)?;

        // 3. 更新状态
        self.chat_repository
            .update_message_receipt_status(message_id, receiver_id, status)
    }

    /// 获取聊天消息列表
    ///
    /// # 参数
    /// * `chat_id` - 聊天ID
    /// * `page` - 页码，从1开始
    /// * `page_size` - 每页消息数量
    ///
    /// # 返回
    /// * `RepositoryResult<Vec<MessageWithDetails>>` - 成功返回消息列表，失败返回错误信息
    pub fn get_chat_messages(
        &self,
        chat_id: &str,
        page: u32,
        page_size: u32,
    ) -> RepositoryResult<Vec<MessageWithDetails>> {
        // 1. 检查聊天是否存在
        self.chat_repository.find_by_id(chat_id)?;

        // 2. 获取聊天的会话ID
        let conversation = self.conversation_repository.find_one_by_chat_id(chat_id)?;

        // 3. 获取会话的消息
        self.message_repository
            .find_by_conversation_with_details(&conversation.id, page, page_size)
    }

    /// 获取用户的聊天列表（优化版）
    ///
    /// 该方法获取指定用户参与的所有聊天，并利用Chat表中缓存的最后消息信息
    /// 直接返回详细的聊天信息，无需额外查询Message表
    ///
    /// # 参数
    /// * `user_id` - 用户ID
    /// * `include_empty` - 是否包含没有消息的聊天
    /// * `sort_by` - 排序字段，默认按最后消息时间排序
    ///
    /// # 返回
    /// * `RepositoryResult<Vec<ChatWithDetails>>` - 成功返回聊天列表，失败返回错误信息
    pub fn get_user_chats(
        &self,
        user_id: &str,
        include_empty: bool,
        sort_by: &str,
    ) -> RepositoryResult<Vec<ChatWithDetails>> {
        self.chat_repository
            .find_user_chats(user_id, include_empty, sort_by)
    }
}
