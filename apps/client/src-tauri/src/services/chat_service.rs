use anyhow::anyhow;

use crate::db::DbPool;
use crate::models::{
    Chat, ChatParticipant, ChatWithDetails, Message, MessageReceipt, MessageWithDetails, NewChat,
    NewChatParticipant, User,
};
use crate::repositories::{
    chat_participant_repository::ChatParticipantRepository,
    chat_repository::ChatRepository,
    conversation_repository::ConversationRepository,
    error::{RepositoryError, RepositoryResult},
    message_receipt_repository::MessageReceiptRepository,
    message_repository::MessageRepository,
    user_repository::UserRepository,
};

use super::ServiceResult;

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

    // 创建聊天
    pub fn create_chat(pool: &DbPool) -> ServiceResult<Chat> {
        let chat = ChatRepository::create(pool)?;
        Ok(chat)
    }

    // 获取聊天
    pub fn get_chat(pool: &DbPool, id: &str) -> ServiceResult<Chat> {
        let chat = ChatRepository::get(pool, id)?;
        Ok(chat)
    }

    // 获取聊天详情
    pub fn get_chat_details(pool: &DbPool, id: &str) -> ServiceResult<ChatWithDetails> {
        let chat_details = ChatRepository::get_details(pool, id)?;
        Ok(chat_details)
    }

    // 获取所有聊天
    pub fn get_all_chats(pool: &DbPool) -> ServiceResult<Vec<Chat>> {
        let chats = ChatRepository::get_all(pool)?;
        Ok(chats)
    }

    // 获取用户的所有聊天
    pub fn get_user_chats(pool: &DbPool, user_id: &str) -> ServiceResult<Vec<Chat>> {
        // 验证用户是否存在
        UserRepository::get(pool, user_id)
            .map_err(|e| anyhow!("查找用户失败: {}", e))?;

        let chats = ChatRepository::get_by_user(pool, user_id)?;
        Ok(chats)
    }

    // 删除聊天
    pub fn delete_chat(pool: &DbPool, id: &str) -> ServiceResult<()> {
        // 验证聊天是否存在
        ChatRepository::get(pool, id)
            .map_err(|e| anyhow!("查找聊天失败: {}", e))?;

        ChatRepository::delete(pool, id)?;
        Ok(())
    }

    // 添加聊天参与者
    pub fn add_chat_participant(pool: &DbPool, chat_id: &str, user_id: &str) -> ServiceResult<()> {
        // 验证聊天是否存在
        ChatRepository::get(pool, chat_id)
            .map_err(|e| anyhow!("查找聊天失败: {}", e))?;

        // 验证用户是否存在
        UserRepository::get(pool, user_id)
            .map_err(|e| anyhow!("查找用户失败: {}", e))?;

        // 检查是否已存在
        match ChatParticipantRepository::create(pool, chat_id, user_id) {
            Ok(_) => Ok(()),
            Err(RepositoryError::AlreadyExists(_)) => Ok(()),
            Err(e) => Err(anyhow!("添加聊天参与者失败: {}", e)),
        }
    }

    // 获取聊天参与者
    pub fn get_chat_participants(pool: &DbPool, chat_id: &str) -> ServiceResult<Vec<User>> {
        // 验证聊天是否存在
        ChatRepository::get(pool, chat_id)
            .map_err(|e| anyhow!("查找聊天失败: {}", e))?;

        let users = ChatParticipantRepository::get_users_by_chat(pool, chat_id)?;
        Ok(users)
    }

    // 移除聊天参与者
    pub fn remove_chat_participant(pool: &DbPool, chat_id: &str, user_id: &str) -> ServiceResult<()> {
        // 验证聊天是否存在
        ChatRepository::get(pool, chat_id)
            .map_err(|e| anyhow!("查找聊天失败: {}", e))?;

        // 验证用户是否存在
        UserRepository::get(pool, user_id)
            .map_err(|e| anyhow!("查找用户失败: {}", e))?;

        ChatParticipantRepository::remove_from_chat(pool, chat_id, user_id)?;
        Ok(())
    }

    // 创建个人聊天（双人聊天）
    pub fn create_individual_chat(pool: &DbPool, user_id: &str, other_user_id: &str) -> ServiceResult<Chat> {
        // 验证用户是否存在
        UserRepository::get(pool, user_id)
            .map_err(|e| anyhow!("查找发起用户失败: {}", e))?;

        // 验证另一个用户是否存在
        UserRepository::get(pool, other_user_id)
            .map_err(|e| anyhow!("查找目标用户失败: {}", e))?;

        // 创建聊天
        let chat = ChatRepository::create(pool)?;

        // 添加发起用户
        match ChatParticipantRepository::create(pool, &chat.id, user_id) {
            Ok(_) => (),
            Err(e) => return Err(anyhow!("添加发起用户失败: {}", e)),
        }

        // 添加目标用户
        match ChatParticipantRepository::create(pool, &chat.id, other_user_id) {
            Ok(_) => (),
            Err(e) => {
                // 如果添加失败，需要删除前面创建的聊天
                let _ = ChatRepository::delete(pool, &chat.id);
                return Err(anyhow!("添加目标用户失败: {}", e));
            }
        }

        Ok(chat)
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
