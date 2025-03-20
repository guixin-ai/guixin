/**
 * 聊天相关类型定义
 */

// 聊天项类型
export interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
}

// 聊天消息类型
export interface ChatMessage {
  id: string;
  content: string;
  isSelf: boolean;
  timestamp: string;
}

// 聊天列表响应类型
export interface ChatsResponse {
  chats: ChatItem[];
  total: number;
} 