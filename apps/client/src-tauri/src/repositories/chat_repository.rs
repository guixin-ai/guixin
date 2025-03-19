use chrono::Utc;
use diesel::prelude::*;
use diesel::result::Error;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{
    Chat, ChatWithDetails, Message, MessageReceipt, NewChat, NewChatParticipant, NewConversation,
    NewMessage, NewMessageReceipt, User,
};
use crate::schema::{chat_participants, chats, conversations, message_receipts, messages, users};

pub struct ChatRepository {
    pool: DbPool,
}

impl ChatRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    // 创建新聊天
    pub fn create(&self, new_chat: NewChat) -> RepositoryResult<Chat> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::insert_into(chats::table)
            .values(&new_chat)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        chats::table
            .filter(chats::id.eq(&new_chat.id))
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据ID查找聊天
    pub fn find_by_id(&self, id: &str) -> RepositoryResult<Chat> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        chats::table
            .filter(chats::id.eq(id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("聊天 ID: {}", id))
                }
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 查找所有聊天
    pub fn find_all(&self) -> RepositoryResult<Vec<Chat>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        chats::table
            .load::<Chat>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据类型查找聊天
    pub fn find_by_type(&self, chat_type: &str) -> RepositoryResult<Vec<Chat>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        chats::table
            .filter(chats::type_.eq(chat_type))
            .load::<Chat>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据用户ID查找聊天
    pub fn find_by_user_id(&self, user_id: &str) -> RepositoryResult<Vec<Chat>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        chats::table
            .inner_join(chat_participants::table)
            .filter(chat_participants::user_id.eq(user_id))
            .select(chats::all_columns)
            .load::<Chat>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据用户ID查找聊天，并附带最后一条消息和未读数量
    pub fn find_with_details_by_user_id(
        &self,
        user_id: &str,
    ) -> RepositoryResult<Vec<ChatWithDetails>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        // 获取用户参与的所有聊天，包括未读数量
        let chats_with_unread = chats::table
            .inner_join(chat_participants::table)
            .filter(chat_participants::user_id.eq(user_id))
            .select((chats::all_columns, chat_participants::unread_count))
            .load::<(Chat, i32)>(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        // 转换为ChatWithDetails
        let chats_with_details: Vec<ChatWithDetails> = chats_with_unread
            .into_iter()
            .map(|(chat, unread_count)| {
                let mut chat_details = ChatWithDetails::from(chat);
                chat_details.unread_count = unread_count;
                chat_details
            })
            .collect();

        Ok(chats_with_details)
    }

    // 更新聊天
    pub fn update(&self, id: &str, chat: Chat) -> RepositoryResult<Chat> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(chats::table.filter(chats::id.eq(id)))
            .set((
                chats::title.eq(&chat.title),
                chats::type_.eq(&chat.type_),
                chats::updated_at.eq(Utc::now().naive_utc()),
            ))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        self.find_by_id(id)
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
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        // 获取发送者名称
        let sender = users::table
            .filter(users::id.eq(sender_id))
            .select(users::name)
            .first::<String>(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        let now = Utc::now().naive_utc();

        diesel::update(chats::table.filter(chats::id.eq(chat_id)))
            .set((
                chats::last_message_id.eq(message_id),
                chats::last_message_content.eq(content),
                chats::last_message_time.eq(now),
                chats::last_message_sender_id.eq(sender_id),
                chats::last_message_sender_name.eq(sender),
                chats::last_message_type.eq(message_type),
                chats::updated_at.eq(now),
            ))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        self.find_by_id(chat_id)
    }

    // 删除聊天
    pub fn delete(&self, id: &str) -> RepositoryResult<usize> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::delete(chats::table.filter(chats::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 创建新聊天（自动生成ID和时间戳）
    pub fn create_with_defaults(&self, title: String, chat_type: String) -> RepositoryResult<Chat> {
        let now = Utc::now().naive_utc();
        let new_chat = NewChat {
            id: Uuid::new_v4().to_string(),
            title,
            type_: chat_type,
            last_message_id: None,
            last_message_content: None,
            last_message_time: None,
            last_message_sender_id: None,
            last_message_sender_name: None,
            last_message_type: None,
            created_at: now,
            updated_at: now,
        };

        self.create(new_chat)
    }

    /// 创建一个新的单聊（一对一聊天）
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
        initiator_id: &str,
        receiver_id: &str,
        title: String,
        initial_message: Option<String>,
    ) -> RepositoryResult<Chat> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        // 开始事务
        conn.transaction(|conn| {
            let now = Utc::now().naive_utc();

            // 1. 创建新的聊天记录
            let chat_id = Uuid::new_v4().to_string();
            let new_chat = NewChat {
                id: chat_id.clone(),
                title,
                type_: "individual".to_string(),
                last_message_id: None,
                last_message_content: None,
                last_message_time: None,
                last_message_sender_id: None,
                last_message_sender_name: None,
                last_message_type: None,
                created_at: now,
                updated_at: now,
            };

            diesel::insert_into(chats::table)
                .values(&new_chat)
                .execute(conn)?;

            // 2. 添加聊天参与者
            // 发起者
            let initiator_participant = NewChatParticipant {
                id: Uuid::new_v4().to_string(),
                chat_id: chat_id.clone(),
                user_id: initiator_id.to_string(),
                role: "owner".to_string(),
                unread_count: 0,
                last_read_message_id: None,
                joined_at: now,
            };

            diesel::insert_into(chat_participants::table)
                .values(&initiator_participant)
                .execute(conn)?;

            // 接收者
            let receiver_participant = NewChatParticipant {
                id: Uuid::new_v4().to_string(),
                chat_id: chat_id.clone(),
                user_id: receiver_id.to_string(),
                role: "member".to_string(),
                unread_count: 0,
                last_read_message_id: None,
                joined_at: now,
            };

            diesel::insert_into(chat_participants::table)
                .values(&receiver_participant)
                .execute(conn)?;

            // 3. 创建会话记录
            let conversation_id = Uuid::new_v4().to_string();
            let new_conversation = NewConversation {
                id: conversation_id.clone(),
                chat_id: chat_id.clone(),
                created_at: now,
                updated_at: now,
            };

            diesel::insert_into(conversations::table)
                .values(&new_conversation)
                .execute(conn)?;

            // 4. 如果有初始消息，创建消息和消息接收记录
            if let Some(content) = initial_message {
                // 创建消息
                let message_id = Uuid::new_v4().to_string();
                let new_message = NewMessage {
                    id: message_id.clone(),
                    content: content.clone(),
                    content_type: "text".to_string(),
                    status: "sent".to_string(),
                    conversation_id: conversation_id,
                    sender_id: initiator_id.to_string(),
                    created_at: now,
                    updated_at: now,
                };

                diesel::insert_into(messages::table)
                    .values(&new_message)
                    .execute(conn)?;

                // 创建消息接收记录
                let receipt = NewMessageReceipt {
                    id: Uuid::new_v4().to_string(),
                    message_id: message_id.clone(),
                    receiver_id: receiver_id.to_string(),
                    status: "delivered".to_string(),
                    created_at: now,
                    updated_at: now,
                };

                diesel::insert_into(message_receipts::table)
                    .values(&receipt)
                    .execute(conn)?;

                // 更新接收者的未读消息计数
                diesel::update(
                    chat_participants::table
                        .filter(chat_participants::chat_id.eq(&chat_id))
                        .filter(chat_participants::user_id.eq(receiver_id)),
                )
                .set(chat_participants::unread_count.eq(1))
                .execute(conn)?;

                // 获取发送者名称
                let sender_name = users::table
                    .filter(users::id.eq(initiator_id))
                    .select(users::name)
                    .first::<String>(conn)?;

                // 更新聊天的最后消息信息
                diesel::update(chats::table.filter(chats::id.eq(&chat_id)))
                    .set((
                        chats::last_message_id.eq(&message_id),
                        chats::last_message_content.eq(&content),
                        chats::last_message_time.eq(now),
                        chats::last_message_sender_id.eq(initiator_id),
                        chats::last_message_sender_name.eq(&sender_name),
                        chats::last_message_type.eq("text"),
                    ))
                    .execute(conn)?;
            }

            // 返回创建的聊天记录
            chats::table
                .filter(chats::id.eq(&chat_id))
                .first(conn)
                .map_err(Error::from)
        })
        .map_err(RepositoryError::DatabaseError)
    }

    /// 发送消息
    ///
    /// 在一个事务中完成以下操作：
    /// 1. 创建消息记录
    /// 2. 为每个接收者创建消息接收记录
    /// 3. 更新聊天的最后消息信息
    /// 4. 增加接收者的未读消息计数
    pub fn send_message(
        &self,
        chat_id: &str,
        sender_id: &str,
        content: String,
        content_type: String,
    ) -> RepositoryResult<Message> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        conn.transaction(|conn| {
            let now = Utc::now().naive_utc();

            // 1. 获取聊天的会话ID
            let conversation_id = conversations::table
                .filter(conversations::chat_id.eq(chat_id))
                .select(conversations::id)
                .first::<String>(conn)?;

            // 2. 创建消息
            let message_id = Uuid::new_v4().to_string();
            let new_message = NewMessage {
                id: message_id.clone(),
                content,
                content_type: content_type.clone(),
                status: "sent".to_string(),
                conversation_id: conversation_id.clone(),
                sender_id: sender_id.to_string(),
                created_at: now,
                updated_at: now,
            };

            diesel::insert_into(messages::table)
                .values(&new_message)
                .execute(conn)?;

            // 3. 获取所有接收者（除了发送者）
            let receivers: Vec<String> = chat_participants::table
                .filter(chat_participants::chat_id.eq(chat_id))
                .filter(chat_participants::user_id.ne(sender_id))
                .select(chat_participants::user_id)
                .load(conn)?;

            // 4. 为每个接收者创建消息接收记录
            let receipts: Vec<NewMessageReceipt> = receivers
                .iter()
                .map(|receiver_id| NewMessageReceipt {
                    id: Uuid::new_v4().to_string(),
                    message_id: message_id.clone(),
                    receiver_id: receiver_id.clone(),
                    status: "delivered".to_string(),
                    created_at: now,
                    updated_at: now,
                })
                .collect();

            diesel::insert_into(message_receipts::table)
                .values(&receipts)
                .execute(conn)?;

            // 5. 增加接收者的未读消息计数
            diesel::update(chat_participants::table)
                .filter(chat_participants::chat_id.eq(chat_id))
                .filter(chat_participants::user_id.ne(sender_id))
                .set(chat_participants::unread_count.eq(chat_participants::unread_count + 1))
                .execute(conn)?;

            // 6. 获取发送者名称
            let sender_name = users::table
                .filter(users::id.eq(sender_id))
                .select(users::name)
                .first::<String>(conn)?;

            // 7. 更新聊天的最后消息信息
            diesel::update(chats::table.filter(chats::id.eq(chat_id)))
                .set((
                    chats::last_message_id.eq(&message_id),
                    chats::last_message_content.eq(&new_message.content),
                    chats::last_message_time.eq(now),
                    chats::last_message_sender_id.eq(sender_id),
                    chats::last_message_sender_name.eq(&sender_name),
                    chats::last_message_type.eq(&content_type),
                    chats::updated_at.eq(now),
                ))
                .execute(conn)?;

            // 8. 返回创建的消息
            messages::table
                .filter(messages::id.eq(&message_id))
                .first(conn)
                .map_err(Error::from)
        })
        .map_err(RepositoryError::DatabaseError)
    }

    /// 更新消息接收状态
    ///
    /// 在一个事务中完成以下操作：
    /// 1. 更新消息接收记录的状态
    /// 2. 如果状态是已读，更新参与者的最后读取消息ID
    pub fn update_message_receipt_status(
        &self,
        message_id: &str,
        receiver_id: &str,
        status: String,
    ) -> RepositoryResult<MessageReceipt> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        conn.transaction(|conn| {
            let now = Utc::now().naive_utc();

            // 1. 更新消息接收记录
            diesel::update(
                message_receipts::table
                    .filter(message_receipts::message_id.eq(message_id))
                    .filter(message_receipts::receiver_id.eq(receiver_id)),
            )
            .set((
                message_receipts::status.eq(&status),
                message_receipts::updated_at.eq(now),
            ))
            .execute(conn)?;

            // 2. 如果状态是已读，更新参与者的最后读取消息ID
            if status == "read" {
                // 获取消息所属的聊天ID
                let chat_id = messages::table
                    .inner_join(conversations::table)
                    .filter(messages::id.eq(message_id))
                    .select(conversations::chat_id)
                    .first::<String>(conn)?;

                // 更新参与者记录
                diesel::update(
                    chat_participants::table
                        .filter(chat_participants::chat_id.eq(&chat_id))
                        .filter(chat_participants::user_id.eq(receiver_id)),
                )
                .set((
                    chat_participants::last_read_message_id.eq(message_id),
                    chat_participants::unread_count.eq(0),
                ))
                .execute(conn)?;
            }

            // 3. 返回更新后的接收记录
            message_receipts::table
                .filter(message_receipts::message_id.eq(message_id))
                .filter(message_receipts::receiver_id.eq(receiver_id))
                .select(message_receipts::all_columns)
                .first(conn)
                .map_err(Error::from)
        })
        .map_err(RepositoryError::DatabaseError)
    }

    /// 获取用户参与的所有聊天（优化版）
    ///
    /// 该方法直接利用Chat表中已缓存的最后消息信息，避免额外的消息表查询
    ///
    /// # 参数
    /// * `user_id` - 用户ID
    /// * `include_empty` - 是否包含无消息的聊天
    /// * `sort_by` - 排序字段
    ///
    /// # 返回
    /// * `RepositoryResult<Vec<ChatWithDetails>>` - 带有详细信息的聊天列表
    pub fn find_user_chats(
        &self,
        user_id: &str,
        include_empty: bool,
        sort_by: &str,
    ) -> RepositoryResult<Vec<ChatWithDetails>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        // 构建基本查询
        let mut query = chats::table
            .inner_join(chat_participants::table)
            .filter(chat_participants::user_id.eq(user_id))
            .into_boxed();

        // 如果不包含空聊天，添加过滤条件
        if !include_empty {
            query = query.filter(chats::last_message_id.is_not_null());
        }

        // 根据排序字段添加排序
        match sort_by {
            "created_at" => {
                query = query.order_by(chats::created_at.desc());
            }
            "title" => {
                query = query.order_by(chats::title.asc());
            }
            "updated_at" => {
                query = query.order_by(chats::updated_at.desc());
            }
            _ => {
                // 默认按最后消息时间排序，将NULL值放在最后
                query = query.order_by(chats::last_message_time.desc());
                // 注意：由于没有nulls_last方法，可以添加额外的ORDER BY子句来处理NULL值
                query = query.then_order_by(chats::last_message_time.is_null());
            }
        }

        // 执行查询
        let results = query
            .select((
                chats::all_columns,
                chat_participants::unread_count,
                chat_participants::last_read_message_id,
            ))
            .load::<(Chat, i32, Option<String>)>(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        // 转换为ChatWithDetails
        let chats_with_details: Vec<ChatWithDetails> = results
            .into_iter()
            .map(|(chat, unread_count, _last_read_message_id)| {
                // 从Chat创建ChatWithDetails，确保字段匹配
                ChatWithDetails {
                    id: chat.id,
                    title: chat.title,
                    type_: chat.type_,
                    last_message_id: chat.last_message_id,
                    last_message_content: chat.last_message_content,
                    last_message_time: chat.last_message_time,
                    last_message_sender_name: chat.last_message_sender_name,
                    last_message_type: chat.last_message_type,
                    unread_count,
                    created_at: chat.created_at,
                    updated_at: chat.updated_at,
                }
            })
            .collect();

        Ok(chats_with_details)
    }
}
