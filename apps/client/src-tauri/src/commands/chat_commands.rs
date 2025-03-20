use serde::{Deserialize, Serialize};
use tauri::{command, State};

use crate::models::{
    Chat, ChatParticipant, ChatWithDetails, Message, MessageReceipt, MessageWithDetails, User,
};
use crate::repositories::error::RepositoryError;
use crate::services::chat_service::ChatService;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct CreateChatRequest {
    title: String,
    chat_type: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateChatRequest {
    id: String,
    title: String,
    chat_type: String,
}

#[derive(Debug, Deserialize)]
pub struct AddParticipantRequest {
    chat_id: String,
    user_id: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateIndividualChatRequest {
    user_id: String,
    other_user_id: String,
}

#[derive(Debug, Deserialize)]
pub struct MarkAsReadRequest {
    chat_id: String,
    user_id: String,
    message_id: String,
}

#[derive(Debug, Deserialize)]
pub struct ResetUnreadCountRequest {
    chat_id: String,
    user_id: String,
}

#[derive(Debug, Deserialize)]
pub struct SendMessageRequest {
    chat_id: String,
    sender_id: String,
    content: String,
    content_type: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMessageStatusRequest {
    message_id: String,
    receiver_id: String,
    status: String,
}

#[derive(Debug, Deserialize)]
pub struct GetChatMessagesRequest {
    chat_id: String,
    page: Option<u32>,
    page_size: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct GetUserChatsRequest {
    user_id: String,
    include_empty: Option<bool>,
    sort_by: Option<String>, // 可选参数，例如"last_message_time"、"created_at"等
}

/// 创建新的聊天
///
/// # 参数
/// * `state` - 应用状态
///
/// # 返回
/// * `Result<Chat, String>` - 成功返回创建的聊天，失败返回错误信息
#[command]
pub fn create_chat(state: State<AppState>) -> Result<Chat, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::create_chat(&pool)
        .map_err(|e| format!("创建聊天失败: {}", e))
}

/// 获取系统中的所有聊天
///
/// # 参数
/// * `state` - 应用状态
///
/// # 返回
/// * `Result<Vec<Chat>, String>` - 成功返回聊天列表，失败返回错误信息
#[command]
pub fn get_all_chats(state: State<AppState>) -> Result<Vec<Chat>, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::get_all_chats(&pool)
        .map_err(|e| format!("获取聊天失败: {}", e))
}

/// 根据ID获取特定聊天
///
/// # 参数
/// * `state` - 应用状态
/// * `id` - 聊天ID
///
/// # 返回
/// * `Result<Chat, String>` - 成功返回聊天信息，失败返回错误信息
#[command]
pub fn get_chat_by_id(state: State<AppState>, id: String) -> Result<Chat, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::get_chat(&pool, &id)
        .map_err(|e| match e {
            anyhow::Error::new(RepositoryError::NotFound(_)) => format!("聊天不存在: {}", id),
            _ => format!("获取聊天失败: {}", e),
        })
}

/// 获取聊天详情，包含消息和参与者
///
/// # 参数
/// * `state` - 应用状态
/// * `id` - 聊天ID
///
/// # 返回
/// * `Result<ChatWithDetails, String>` - 成功返回带详细信息的聊天信息，失败返回错误信息
#[command]
pub fn get_chat_details(state: State<AppState>, id: String) -> Result<ChatWithDetails, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::get_chat_details(&pool, &id)
        .map_err(|e| match e {
            anyhow::Error::new(RepositoryError::NotFound(_)) => format!("聊天不存在: {}", id),
            _ => format!("获取聊天详情失败: {}", e),
        })
}

/// 根据聊天类型获取聊天列表
///
/// # 参数
/// * `state` - 应用状态
/// * `chat_type` - 聊天类型
///
/// # 返回
/// * `Result<Vec<Chat>, String>` - 成功返回符合类型的聊天列表，失败返回错误信息
#[command]
pub fn get_chats_by_type(state: State<AppState>, chat_type: String) -> Result<Vec<Chat>, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::get_chats_by_type(&pool, &chat_type)
        .map_err(|e| format!("获取聊天失败: {}", e))
}

/// 获取用户参与的所有聊天
///
/// # 参数
/// * `state` - 应用状态
/// * `user_id` - 用户ID
///
/// # 返回
/// * `Result<Vec<Chat>, String>` - 成功返回用户的聊天列表，失败返回错误信息
#[command]
pub fn get_user_chats(state: State<AppState>, user_id: String) -> Result<Vec<Chat>, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::get_user_chats(&pool, &user_id)
        .map_err(|e| format!("获取用户聊天失败: {}", e))
}

/// 获取用户参与的所有聊天及其详细信息
///
/// # 参数
/// * `state` - 应用状态
/// * `user_id` - 用户ID
///
/// # 返回
/// * `Result<Vec<ChatWithDetails>, String>` - 成功返回带详细信息的聊天列表，失败返回错误信息
#[command]
pub fn get_chats_with_details_by_user_id(
    state: State<AppState>,
    user_id: String,
) -> Result<Vec<ChatWithDetails>, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::get_chats_with_details_by_user_id(&pool, &user_id)
        .map_err(|e| format!("获取用户聊天详情失败: {}", e))
}

/// 更新聊天信息
///
/// # 参数
/// * `state` - 应用状态
/// * `request` - 包含要更新的聊天ID、标题和类型的请求
///
/// # 返回
/// * `Result<Chat, String>` - 成功返回更新后的聊天，失败返回错误信息
#[command]
pub fn update_chat(state: State<AppState>, request: UpdateChatRequest) -> Result<Chat, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::update_chat(&pool, &request.id, &request.title, &request.chat_type)
        .map_err(|e| match e {
            RepositoryError::NotFound(_) => format!("聊天不存在: {}", request.id),
            _ => format!("更新聊天失败: {}", e),
        })
}

/// 删除指定聊天
///
/// # 参数
/// * `state` - 应用状态
/// * `id` - 要删除的聊天ID
///
/// # 返回
/// * `Result<bool, String>` - 成功返回true，失败返回错误信息
#[command]
pub fn delete_chat(state: State<AppState>, id: String) -> Result<bool, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::delete_chat(&pool, &id)
        .map(|_| true)
        .map_err(|e| match e {
            anyhow::Error::new(RepositoryError::NotFound(_)) => format!("聊天不存在: {}", id),
            _ => format!("删除聊天失败: {}", e),
        })
}

/// 向聊天中添加参与者
///
/// # 参数
/// * `state` - 应用状态
/// * `request` - 包含聊天ID和用户ID的请求
///
/// # 返回
/// * `Result<(), String>` - 成功返回空，失败返回错误信息
#[command]
pub fn add_chat_participant(
    state: State<AppState>,
    request: AddParticipantRequest,
) -> Result<(), String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::add_chat_participant(&pool, &request.chat_id, &request.user_id)
        .map_err(|e| match e {
            anyhow::Error::new(RepositoryError::NotFound(_)) => format!("聊天不存在"),
            anyhow::Error::new(RepositoryError::AlreadyExists(_)) => format!("用户已在聊天中"),
            _ => format!("添加参与者失败: {}", e),
        })
}

/// 获取聊天的所有参与者
///
/// # 参数
/// * `state` - 应用状态
/// * `chat_id` - 聊天ID
///
/// # 返回
/// * `Result<Vec<User>, String>` - 成功返回参与者列表，失败返回错误信息
#[command]
pub fn get_chat_participants(
    state: State<AppState>,
    chat_id: String,
) -> Result<Vec<User>, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::get_chat_participants(&pool, &chat_id)
        .map_err(|e| format!("获取参与者失败: {}", e))
}

/// 从聊天中移除参与者
///
/// # 参数
/// * `state` - 应用状态
/// * `chat_id` - 聊天ID
/// * `user_id` - 要移除的用户ID
///
/// # 返回
/// * `Result<bool, String>` - 成功返回true，失败返回错误信息
#[command]
pub fn remove_chat_participant(
    state: State<AppState>,
    chat_id: String,
    user_id: String,
) -> Result<bool, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::remove_chat_participant(&pool, &chat_id, &user_id)
        .map(|_| true)
        .map_err(|e| format!("移除参与者失败: {}", e))
}

/// 标记特定消息为已读
///
/// # 参数
/// * `state` - 应用状态
/// * `request` - 包含聊天ID、用户ID和消息ID的请求
///
/// # 返回
/// * `Result<ChatParticipant, String>` - 成功返回更新后的参与者信息，失败返回错误信息
#[command]
pub fn mark_message_as_read(
    state: State<AppState>,
    request: MarkAsReadRequest,
) -> Result<ChatParticipant, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::mark_as_read(&pool, &request.chat_id, &request.user_id, &request.message_id)
        .map_err(|e| format!("标记消息已读失败: {}", e))
}

/// 重置用户在特定聊天中的未读消息计数
///
/// # 参数
/// * `state` - 应用状态
/// * `request` - 包含聊天ID和用户ID的请求
///
/// # 返回
/// * `Result<ChatParticipant, String>` - 成功返回更新后的参与者信息，失败返回错误信息
#[command]
pub fn reset_unread_count(
    state: State<AppState>,
    request: ResetUnreadCountRequest,
) -> Result<ChatParticipant, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::reset_unread_count(&pool, &request.chat_id, &request.user_id)
        .map_err(|e| format!("重置未读计数失败: {}", e))
}

/// 创建个人聊天（双人聊天）
///
/// # 参数
/// * `state` - 应用状态
/// * `request` - 包含发起者ID和接收者ID的请求
///
/// # 返回
/// * `Result<Chat, String>` - 成功返回创建的聊天，失败返回错误信息
#[command]
pub fn create_individual_chat(
    state: State<AppState>,
    request: CreateIndividualChatRequest,
) -> Result<Chat, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::create_individual_chat(&pool, &request.user_id, &request.other_user_id)
        .map_err(|e| format!("创建个人聊天失败: {}", e))
}

/// 发送消息
///
/// # 参数
/// * `state` - 应用状态
/// * `request` - 包含聊天ID、发送者ID、消息内容和类型的请求
///
/// # 返回
/// * `Result<Message, String>` - 成功返回创建的消息，失败返回错误信息
#[command]
pub fn send_message(
    state: State<AppState>,
    request: SendMessageRequest,
) -> Result<Message, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::send_message(&pool, &request.chat_id, &request.sender_id, &request.content, &request.content_type)
        .map_err(|e| format!("发送消息失败: {}", e))
}

/// 更新消息状态
///
/// # 参数
/// * `state` - 应用状态
/// * `request` - 包含消息ID、接收者ID和新状态的请求
///
/// # 返回
/// * `Result<MessageReceipt, String>` - 成功返回更新后的接收记录，失败返回错误信息
#[command]
pub fn update_message_status(
    state: State<AppState>,
    request: UpdateMessageStatusRequest,
) -> Result<MessageReceipt, String> {
    let pool = state.db_pool.lock().unwrap();

    ChatService::update_message_status(&pool, &request.message_id, &request.receiver_id, &request.status)
        .map_err(|e| format!("更新消息状态失败: {}", e))
}

/// 获取聊天消息列表
///
/// # 参数
/// * `state` - 应用状态
/// * `request` - 包含聊天ID和分页参数的请求
///
/// # 返回
/// * `Result<Vec<MessageWithDetails>, String>` - 成功返回消息列表，失败返回错误信息
#[command]
pub fn get_chat_messages(
    state: State<AppState>,
    request: GetChatMessagesRequest,
) -> Result<Vec<MessageWithDetails>, String> {
    let pool = state.db_pool.lock().unwrap();

    let page = request.page.unwrap_or(1);
    let page_size = request.page_size.unwrap_or(20);

    ChatService::get_chat_messages(&pool, &request.chat_id, page, page_size)
        .map_err(|e| format!("获取聊天消息失败: {}", e))
}

/// 获取用户的聊天列表（优化版）
///
/// # 参数
/// * `state` - 应用状态
/// * `request` - 包含用户ID和其他过滤参数的请求
///
/// # 返回
/// * `Result<Vec<ChatWithDetails>, String>` - 成功返回聊天列表，失败返回错误信息
#[command]
pub fn get_user_chats(
    state: State<AppState>,
    request: GetUserChatsRequest,
) -> Result<Vec<ChatWithDetails>, String> {
    let pool = state.db_pool.lock().unwrap();

    let include_empty = request.include_empty.unwrap_or(false);
    let sort_by = request.sort_by.unwrap_or("last_message_time".to_string());

    ChatService::get_user_chats(&pool, &request.user_id, include_empty, &sort_by)
        .map_err(|e| format!("获取用户聊天列表失败: {}", e))
}
