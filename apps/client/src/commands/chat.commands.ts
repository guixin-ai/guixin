/**
 * 聊天指令 - 定义与后端对应的聊天相关指令
 */
import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod';

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
 * 创建群聊响应接口
 */
export interface CreateGroupChatResponse {
  chatId: string;
  name: string;
  avatar: string;
}

/**
 * 发送消息响应接口
 */
export interface SendMessageResponse {
  messageId: string;
  timestamp: string;
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

  /**
   * 创建群聊
   * 调用后端 create_group_chat 命令
   */
  public async createGroupChat(contactIds: string[]): Promise<CreateGroupChatResponse> {
    try {
      // 验证参数
      if (!contactIds || contactIds.length === 0) {
        throw new Error('联系人ID列表不能为空');
      }

      const response = await invoke<CreateGroupChatResponse>('create_group_chat', {
        contactIds
      });

      return response;
    } catch (error) {
      console.error('创建群聊失败:', error);
      throw new Error(`创建群聊失败: ${error}`);
    }
  }

  /**
   * 发送聊天消息
   * 调用后端 send_chat_message 命令
   */
  public async sendMessage(
    chatId: string, 
    content: string, 
    tempId?: string
  ): Promise<SendMessageResponse> {
    try {
      // 验证参数
      if (!chatId) {
        throw new Error('聊天ID不能为空');
      }
      
      if (!content || content.trim() === '') {
        throw new Error('消息内容不能为空');
      }

      const response = await invoke<SendMessageResponse>('send_chat_message', {
        chatId,
        content,
        tempId
      });

      return response;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw new Error(`发送消息失败: ${error}`);
    }
  }
}

// 导出聊天指令单例
export const chatCommands = ChatCommands.getInstance(); 