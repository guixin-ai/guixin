use serde::{Deserialize, Serialize};
use tauri::{State, command};

use crate::AppState;
use crate::models::{Message, Conversation, MessageWithDetails};
use crate::services::MessageService;
use crate::repositories::error::RepositoryError;

#[derive(Debug, Deserialize)]
pub struct CreateConversationRequest {
    chat_id: String,
}

#[derive(Debug, Deserialize)]
pub struct SendMessageRequest {
    chat_id: String,
    sender_id: String,
    content: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMessageStatusRequest {
    id: String,
    status: String,
}

#[derive(Debug, Deserialize)]
pub struct GetMessagesRequest {
    chat_id: String,
    page: Option<i64>,
    page_size: Option<i64>,
}

// 创建会话
#[command]
pub fn create_conversation(
    state: State<AppState>,
    request: CreateConversationRequest,
) -> Result<Conversation, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = MessageService::new(pool.clone());
    
    service.create_conversation(request.chat_id)
        .map_err(|e| format!("创建会话失败: {}", e))
}

// 获取聊天的所有会话
#[command]
pub fn get_conversations_by_chat_id(
    state: State<AppState>,
    chat_id: String,
) -> Result<Vec<Conversation>, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = MessageService::new(pool.clone());
    
    service.get_conversations_by_chat_id(&chat_id)
        .map_err(|e| format!("获取会话失败: {}", e))
}

// 获取会话详情
#[command]
pub fn get_conversation_by_id(
    state: State<AppState>,
    id: String,
) -> Result<Conversation, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = MessageService::new(pool.clone());
    
    service.get_conversation_by_id(&id)
        .map_err(|e| match e {
            RepositoryError::NotFound(_) => format!("会话不存在: {}", id),
            _ => format!("获取会话失败: {}", e),
        })
}

// 删除会话
#[command]
pub fn delete_conversation(
    state: State<AppState>,
    id: String,
) -> Result<bool, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = MessageService::new(pool.clone());
    
    service.delete_conversation(&id)
        .map(|_| true)
        .map_err(|e| match e {
            RepositoryError::NotFound(_) => format!("会话不存在: {}", id),
            _ => format!("删除会话失败: {}", e),
        })
}

// 发送消息
#[command]
pub fn send_message(
    state: State<AppState>,
    request: SendMessageRequest,
) -> Result<Message, String> {
    let pool = state.db_pool.lock().unwrap();

    MessageService::send_message(&pool, &request.chat_id, &request.sender_id, &request.content)
        .map_err(|e| format!("发送消息失败: {}", e))
}

// 获取聊天的消息列表
#[command]
pub fn get_chat_messages(
    state: State<AppState>,
    request: GetMessagesRequest,
) -> Result<Vec<MessageWithDetails>, String> {
    let pool = state.db_pool.lock().unwrap();

    let page = request.page.unwrap_or(1);
    let page_size = request.page_size.unwrap_or(20);

    MessageService::get_chat_messages(&pool, &request.chat_id, page, page_size)
        .map_err(|e| format!("获取聊天消息失败: {}", e))
}

// 根据ID获取消息
#[command]
pub fn get_message_by_id(state: State<AppState>, id: String) -> Result<Message, String> {
    let pool = state.db_pool.lock().unwrap();

    MessageService::get_message_by_id(&pool, &id)
        .map_err(|e| format!("获取消息失败: {}", e))
}

// 更新消息状态
#[command]
pub fn update_conversation_message_status(
    state: State<AppState>,
    request: UpdateMessageStatusRequest,
) -> Result<Message, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = MessageService::new(pool.clone());
    
    service.update_message_status(&request.id, &request.status)
        .map_err(|e| match e {
            RepositoryError::NotFound(_) => format!("消息不存在: {}", request.id),
            _ => format!("更新消息状态失败: {}", e),
        })
}

// 删除消息
#[command]
pub fn delete_message(state: State<AppState>, id: String) -> Result<bool, String> {
    let pool = state.db_pool.lock().unwrap();

    MessageService::delete_message(&pool, &id)
        .map(|_| true)
        .map_err(|e| format!("删除消息失败: {}", e))
} 