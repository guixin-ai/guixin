/**
 * 聊天相关类型定义
 */

// 聊天列表项类型
export interface ChatItem {
  id: string;
  name: string;
  avatar: string[];
  lastMessage: string;
  timestamp: string;
  unread?: number;
}

// 聊天详情类型
export interface ChatDetail {
  id: string;
  name: string;
  avatar: string[];
  isAI?: boolean;
  members?: ChatMember[];
}

// 聊天成员类型
export interface ChatMember {
  id: string;
  name: string;
  avatar: string;
  isAI?: boolean;
  username?: string;
  description?: string; // 系统提示词/描述字段
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