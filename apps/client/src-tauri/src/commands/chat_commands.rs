// 聊天相关命令
use crate::AppState;
use crate::models::ChatParticipant;
use crate::repositories::{chat_participant_repository::ChatParticipantRepository, chat_repository::ChatRepository};
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatListItemResponse {
    pub id: String,
    pub name: String,
    pub avatar: String,
    pub last_message: Option<String>,
    pub timestamp: Option<String>,
    pub created_at: Option<String>,  // 原始创建时间，ISO格式
    pub updated_at: Option<String>,  // 原始更新时间，ISO格式
    pub unread: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatListResponse {
    pub chats: Vec<ChatListItemResponse>,
    pub total: usize,
}

/// 获取当前用户的聊天列表
/// 
/// 返回当前用户参与的所有聊天，包括聊天基本信息和最后一条消息
#[tauri::command]
pub fn get_current_user_chat_list(
    state: State<'_, AppState>,
) -> Result<ChatListResponse, String> {
    // 获取数据库连接池和当前用户
    let pool = state.db_pool.lock().map_err(|_| "无法获取数据库连接池".to_string())?;
    let current_user = state.current_user.lock().map_err(|_| "无法获取当前用户状态".to_string())?;
    
    // 获取用户参与的所有聊天
    let participants = ChatParticipantRepository::get_by_user_id(&pool, &current_user.id)
        .map_err(|e| format!("获取用户参与的聊天失败: {}", e))?;
    
    // 用于保存结果的向量
    let mut chat_list = Vec::new();
    
    // 遍历所有参与的聊天
    for participant in participants {
        // 获取聊天基本信息
        let chat = ChatRepository::get(&pool, &participant.chat_id)
            .map_err(|e| format!("获取聊天信息失败: {}", e))?;
        
        // 获取聊天的所有参与者
        let chat_participants = ChatParticipantRepository::get_by_chat_id(&pool, &chat.id)
            .map_err(|e| format!("获取聊天参与者失败: {}", e))?;
        
        // 查找非当前用户的参与者作为聊天名称
        let other_participants: Vec<ChatParticipant> = chat_participants
            .into_iter()
            .filter(|p| p.user_id != current_user.id)
            .collect();
        
        // 处理聊天名称和头像
        let (name, avatar) = if !other_participants.is_empty() {
            // 使用第一个其他参与者的名字作为聊天名称
            let first_participant_id = &other_participants[0].user_id;
            
            // 这里可以从user表获取用户信息
            let user_repo = crate::repositories::user_repository::UserRepository::get(&pool, first_participant_id)
                .map_err(|e| format!("获取用户信息失败: {}", e))?;
            
            (user_repo.name.clone(), user_repo.name.chars().next().unwrap_or('?').to_string())
        } else {
            // 如果没有其他参与者，使用聊天ID作为名称
            (format!("聊天 {}", chat.id), "?".to_string())
        };
        
        // 直接使用聊天对象中存储的最后消息信息
        let formatted_time = chat.last_message_time.map(|t| t.to_string());
        
        // 添加到结果列表
        chat_list.push(ChatListItemResponse {
            id: chat.id,
            name,
            avatar,
            last_message: chat.last_message, // 直接使用存储的最后消息
            timestamp: formatted_time, // 使用存储的最后消息时间
            created_at: Some(chat.created_at.to_string()),
            updated_at: Some(chat.updated_at.to_string()),
            unread: Some(chat.unread_count), // 使用存储的未读消息数
        });
    }
    
    // 计算聊天列表长度
    let total = chat_list.len();
    
    // 返回结果
    Ok(ChatListResponse {
        chats: chat_list,
        total,
    })
}