/**
 * 聊天指令 - 定义与后端对应的聊天相关指令
 */
import { invoke } from '@tauri-apps/api/core';

/**
 * 聊天列表项响应接口
 */
export interface ChatListItemResponse {
  id: string;
  name: string;
  avatar: string;
  last_message?: string | null;
  timestamp?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  unread?: number | null;
}

/**
 * 聊天列表响应接口
 */
export interface ChatListResponse {
  chats: ChatListItemResponse[];
  total: number;
}

/**
 * 聊天指令类
 * 封装与后端通信的所有聊天相关命令
 */
class ChatCommands {
  // 单例实例
  private static instance: ChatCommands;
  
  // 私有构造函数，防止外部实例化
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  public static getInstance(): ChatCommands {
    if (!ChatCommands.instance) {
      ChatCommands.instance = new ChatCommands();
    }
    return ChatCommands.instance;
  }
  
  /**
   * 获取当前用户的聊天列表
   * 调用后端 get_current_user_chat_list 命令
   */
  public async getCurrentUserChatList(): Promise<ChatListResponse> {
    try {
      return await invoke('get_current_user_chat_list') as ChatListResponse;
    } catch (error) {
      console.error('获取当前用户聊天列表失败:', error);
      throw new Error(`获取聊天列表失败: ${error}`);
    }
  }
}

// 导出聊天指令单例
export const chatCommands = ChatCommands.getInstance(); 