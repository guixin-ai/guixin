// 聊天相关类型定义

// 消息接口
export interface Message {
  id: string;
  content: string;
  content_type: string;
  status: string;
  conversation_id: string;
  sender_id: string;
  created_at: string;
  updated_at: string;
}

// 聊天接口
export interface Chat {
  id: string;
  title: string;
  type_: string;
  last_message_id?: string;
  last_message_content?: string;
  last_message_time?: string;
  last_message_sender_id?: string;
  last_message_sender_name?: string;
  last_message_type?: string;
  created_at: string;
  updated_at: string;
}

// 带有详细信息的聊天接口
export interface ChatWithDetails {
  id: string;
  title: string;
  type_: string;
  last_message_id?: string;
  last_message_content?: string;
  last_message_time?: string;
  last_message_sender_name?: string;
  last_message_type?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

// 聊天参与者接口
export interface ChatParticipant {
  id: string;
  chat_id: string;
  user_id: string;
  role: string;
  unread_count: number;
  last_read_message_id?: string;
  joined_at: string;
}

// 创建聊天请求接口
export interface CreateChatRequest {
  title: string;
  chat_type: string;
}

// 更新聊天请求接口
export interface UpdateChatRequest {
  id: string;
  title: string;
  chat_type: string;
}

// 添加参与者请求接口
export interface AddParticipantRequest {
  chat_id: string;
  user_id: string;
  role: string;
}

// 创建单聊请求接口
export interface CreateIndividualChatRequest {
  initiator_id: string;
  receiver_id: string;
  title: string;
  initial_message?: string;
}

// 标记消息已读请求接口
export interface MarkAsReadRequest {
  chat_id: string;
  user_id: string;
  message_id: string;
}

// 重置未读计数请求接口
export interface ResetUnreadCountRequest {
  chat_id: string;
  user_id: string;
}

// 消息接收记录接口
export interface MessageReceipt {
  id: string;
  message_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// 聊天消息详情接口
export interface MessageWithDetails {
  id: string;
  content: string;
  content_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string;
  receipts: MessageReceipt[];
  attachments: Attachment[];
}

// 附件接口
export interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  thumbnail_path?: string;
  created_at: string;
  updated_at: string;
  message_id: string;
}

// 获取聊天消息请求接口
export interface GetChatMessagesRequest {
  chat_id: string;
  page?: number;
  page_size?: number;
}

// 获取用户聊天列表请求接口（优化版）
export interface GetUserChatsRequest {
  user_id: string;
  include_empty?: boolean;
  sort_by?: string;
}

// 发送消息请求接口
export interface SendMessageRequest {
  chat_id: string;
  sender_id: string;
  content: string;
  content_type: string;
}

// 更新消息状态请求接口
export interface UpdateMessageStatusRequest {
  message_id: string;
  receiver_id: string;
  status: string;
}
