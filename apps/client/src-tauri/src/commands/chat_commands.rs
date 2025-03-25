// 聊天相关命令
use crate::AppState;
use crate::models::ChatParticipant;
use crate::repositories::{chat_participant_repository::ChatParticipantRepository, chat_repository::ChatRepository};
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;
use chrono::{Utc, NaiveDateTime};
use diesel::prelude::*;
use diesel::ExpressionMethods;

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

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateGroupChatResponse {
    pub chat_id: String,
    pub name: String,
    pub avatar: String,
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

/// 创建群聊
/// 
/// 根据提供的联系人ID列表创建一个新的群聊
#[tauri::command]
pub fn create_group_chat(
    state: State<'_, AppState>,
    contact_ids: Vec<String>,
) -> Result<CreateGroupChatResponse, String> {
    // 验证参数
    if contact_ids.is_empty() {
        return Err("联系人ID列表不能为空".to_string());
    }
    
    // 获取数据库连接池和当前用户
    let pool = state.db_pool.lock().map_err(|_| "无法获取数据库连接池".to_string())?;
    let current_user = state.current_user.lock().map_err(|_| "无法获取当前用户状态".to_string())?;
    
    // 创建新的聊天 - 使用模型定义的方式
    let chat_id = Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc();
    
    // 生成默认群聊名称
    let group_name = if contact_ids.len() == 1 {
        // 获取第一个联系人信息
        let first_contact_id = &contact_ids[0];
        let first_contact = crate::repositories::user_repository::UserRepository::get(&pool, first_contact_id)
            .map_err(|e| format!("获取联系人信息失败: {}", e))?;
        
        format!("与{}的聊天", first_contact.name)
    } else {
        format!("群聊({}人)", contact_ids.len() + 1)
    };
    
    // 默认头像
    let avatar_urls = "default".to_string();
    
    // 手动插入新聊天记录
    let mut conn = pool.get().map_err(|_| "无法获取数据库连接".to_string())?;
    diesel::insert_into(crate::schema::chats::table)
        .values((
            crate::schema::chats::id.eq(&chat_id),
            crate::schema::chats::name.eq(&group_name),
            crate::schema::chats::avatar_urls.eq(&avatar_urls),
            crate::schema::chats::unread_count.eq(0),
            crate::schema::chats::created_at.eq(now),
            crate::schema::chats::updated_at.eq(now)
        ))
        .execute(&mut conn)
        .map_err(|e| format!("创建聊天失败: {}", e))?;
    
    // 添加当前用户作为参与者
    crate::repositories::chat_participant_repository::ChatParticipantRepository::create(&pool, &chat_id, &current_user.id)
        .map_err(|e| format!("添加当前用户到聊天失败: {}", e))?;
    
    // 添加所有联系人作为参与者
    for contact_id in &contact_ids {
        crate::repositories::chat_participant_repository::ChatParticipantRepository::create(&pool, &chat_id, contact_id)
            .map_err(|e| format!("添加联系人到聊天失败: {}", e))?;
    }
    
    // 生成头像
    let group_avatar = if contact_ids.len() == 1 {
        let first_contact_id = &contact_ids[0];
        let first_contact = crate::repositories::user_repository::UserRepository::get(&pool, first_contact_id)
            .map_err(|e| format!("获取联系人信息失败: {}", e))?;
            
        first_contact.name.chars().next().unwrap_or('G').to_string()
    } else {
        "G".to_string() // 群聊默认头像
    };
    
    // 返回结果
    Ok(CreateGroupChatResponse {
        chat_id,
        name: group_name,
        avatar: group_avatar,
    })
}