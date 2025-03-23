/**
 * 聊天服务 - 提供聊天相关的API接口
 */
import { ChatItem, ChatMessage, ChatsResponse } from '@/types/chat';
import { 
  ChatFetchException, 
  ChatDetailFetchException, 
  ChatMessagesFetchException 
} from '@/errors/service.errors';
import { invoke } from '@tauri-apps/api/core';
import { formatDate } from '@/utils/date-utils';

/**
 * 后端返回的聊天列表项接口
 */
interface BackendChatListItem {
  id: string;
  name: string;
  avatar: string;
  last_message: string | null;
  timestamp: string | null;
  created_at: string | null;   // ISO格式的创建时间
  updated_at: string | null;   // ISO格式的更新时间
  unread: number | null;
}

/**
 * 后端返回的聊天列表接口
 */
interface BackendChatListResponse {
  chats: BackendChatListItem[];
  total: number;
}

/**
 * 聊天服务类
 */
class ChatService {
  // 单例实例
  private static instance: ChatService;
  
  // 私有构造函数，防止外部实例化
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }
  
  /**
   * 获取聊天列表
   */
  public async getChats(): Promise<ChatsResponse> {
    try {
      // 调用后端API获取聊天列表
      const response = await invoke<BackendChatListResponse>('get_user_chat_list');
      
      // 将后端数据转换为前端所需格式
      const chats: ChatItem[] = response.chats.map(item => {
        // 格式化时间戳，优先使用created_at，如果没有则使用updated_at
        const timestamp = formatDate(item.created_at || item.updated_at);
        
        return {
          id: item.id,
          name: item.name,
          avatar: [item.avatar],
          lastMessage: item.last_message || '',
          timestamp,
          unread: item.unread || undefined
        };
      });
      
      return {
        chats,
        total: response.total
      };
    } catch (error) {
      console.error('获取聊天列表失败:', error);
      throw new ChatFetchException();
    }
  }
  
  /**
   * 根据ID获取聊天详情
   */
  public async getChatById(id: string): Promise<ChatItem | null> {
    try {
      // 获取所有聊天
      const { chats } = await this.getChats();
      
      // 查找匹配ID的聊天
      const chat = chats.find(chat => chat.id === id);
      return chat || null;
    } catch (error) {
      console.error(`获取聊天 ${id} 详情失败:`, error);
      throw new ChatDetailFetchException(id);
    }
  }

  /**
   * 根据聊天ID获取聊天消息
   * @param chatId 聊天ID
   * @returns 按时间排序的聊天消息数组
   */
  public async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      // TODO: 将来实现后端API获取聊天消息
      // 目前返回空数组，等待后端实现
      return [];
    } catch (error) {
      console.error(`获取聊天 ${chatId} 消息失败:`, error);
      throw new ChatMessagesFetchException(chatId);
    }
  }
}

// 导出聊天服务单例
export const chatService = ChatService.getInstance(); 