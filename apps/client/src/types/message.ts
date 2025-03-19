// 会话和消息相关类型定义

// 会话接口
export interface Conversation {
  id: string;
  chat_id: string;
  created_at: string;
  updated_at: string;
}

// 创建会话请求接口
export interface CreateConversationRequest {
  chat_id: string;
}

// 消息发送请求接口 (message.service.ts中的定义)
export interface SendMessageRequestV2 {
  content: string;
  content_type: string;
  conversation_id: string;
  sender_id: string;
  receiver_ids: string[];
}

// 更新消息状态请求接口 (message.service.ts中的定义)
export interface UpdateMessageStatusRequestV2 {
  id: string;
  status: string;
}

// 适配器方法，将chat服务中的SendMessageRequest转换为message服务中的SendMessageRequestV2
export const adaptSendMessageRequest = (
  request: import('./chat').SendMessageRequest,
  conversationId: string,
  receiverIds: string[]
): SendMessageRequestV2 => {
  return {
    content: request.content,
    content_type: request.content_type,
    conversation_id: conversationId,
    sender_id: request.sender_id,
    receiver_ids: receiverIds,
  };
};

// 适配器方法，将chat服务中的UpdateMessageStatusRequest转换为message服务中的UpdateMessageStatusRequestV2
export const adaptUpdateMessageStatusRequest = (
  request: import('./chat').UpdateMessageStatusRequest
): UpdateMessageStatusRequestV2 => {
  return {
    id: request.message_id,
    status: request.status,
  };
};
