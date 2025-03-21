// 聊天相关服务
use diesel::prelude::*;
use crate::db::DbPool;
use crate::repositories::error::RepositoryError;
use crate::schema::chats;

pub struct ChatService;

impl ChatService {
    // 更新聊天的未读消息数
    pub fn update_unread_count(
        pool: &DbPool, 
        chat_id: &str, 
        increment: bool
    ) -> Result<(), RepositoryError> {
        let mut conn = pool.get().map_err(RepositoryError::ConnectionError)?;
        
        // 开始事务
        conn.transaction(|conn| {
            // 首先获取当前未读消息数
            let current_unread: i32 = chats::table
                .filter(chats::id.eq(chat_id))
                .select(chats::unread_count)
                .first(conn)?;
            
            // 根据increment参数决定是增加还是重置未读消息数
            let new_unread = if increment {
                current_unread + 1
            } else {
                0 // 重置为0
            };
            
            // 更新未读消息数
            diesel::update(chats::table)
                .filter(chats::id.eq(chat_id))
                .set(chats::unread_count.eq(new_unread))
                .execute(conn)?;
            
            Ok(())
        })
    }
    
    // 标记聊天为已读
    pub fn mark_as_read(pool: &DbPool, chat_id: &str) -> Result<(), RepositoryError> {
        Self::update_unread_count(pool, chat_id, false)
    }
    
    // 增加聊天的未读消息数
    pub fn increment_unread(pool: &DbPool, chat_id: &str) -> Result<(), RepositoryError> {
        Self::update_unread_count(pool, chat_id, true)
    }
}
