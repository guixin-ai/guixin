/**
 * 聊天服务 - 提供聊天相关的API接口
 */
import { ChatItem, ChatMessage, ChatsResponse } from '@/types/chat';
import { 
  ChatFetchException, 
  ChatDetailFetchException, 
  ChatMessagesFetchException,
  GroupChatCreationFailedException 
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
 * 创建群聊的响应接口
 */
interface CreateGroupChatResponse {
  chatId: string;
  status: string;
}

/**
 * 发送消息的响应接口
 */
interface SendMessageResponse {
  messageId: string;
  timestamp: string;
  status: string;
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

  /**
   * 创建群聊
   * @param contactIds 联系人ID数组
   * @returns 包含新创建群聊ID的响应
   */
  public async createGroupChat(contactIds: string[]): Promise<CreateGroupChatResponse> {
    try {
      // TODO: 调用后端API创建群聊
      // 目前返回模拟数据，等待后端实现
      console.log('创建群聊，联系人IDs:', contactIds);
      
      // 模拟延迟和返回
      const chatId = `chat-${Date.now()}`;
      
      return {
        chatId,
        status: 'success'
      };
    } catch (error) {
      console.error('创建群聊失败:', error);
      throw new GroupChatCreationFailedException();
    }
  }

  /**
   * 发送聊天消息
   * @param chatId 聊天ID
   * @param content 消息内容
   * @param tempId 临时消息ID，用于前端标识
   * @returns 包含消息ID和时间戳的响应
   */
  public async sendMessage(chatId: string, content: string, tempId?: string): Promise<SendMessageResponse> {
    try {
      // TODO: 调用后端API发送消息
      // 目前返回模拟数据，等待后端实现
      console.log('发送消息:', { chatId, content, tempId });
      
      // 模拟消息发送
      const messageId = `msg-${Date.now()}`;
      const timestamp = new Date().toISOString();
      
      return {
        messageId,
        timestamp,
        status: 'success'
      };
    } catch (error) {
      console.error(`发送消息到聊天 ${chatId} 失败:`, error);
      throw new Error(`发送消息失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// 导出聊天服务单例
export const chatService = ChatService.getInstance(); 