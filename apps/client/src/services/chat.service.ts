/**
 * 聊天服务 - 提供聊天相关的API接口
 */
import { ChatItem, ChatMessage, ChatsResponse } from '@/types/chat';
import { 
  ChatFetchException, 
  ChatDetailFetchException, 
  ChatMessagesFetchException 
} from '@/errors/service.errors';

/**
 * 聊天服务类
 */
class ChatService {
  // 单例实例
  private static instance: ChatService;
  
  // 模拟聊天数据
  private mockChats: ChatItem[] = [
    {
      id: '1',
      name: '文件传输助手',
      avatar: '文',
      lastMessage: '[图片]',
      timestamp: '星期二',
    },
    {
      id: '2',
      name: '老婆',
      avatar: '老',
      lastMessage: '晚安宝宝',
      timestamp: '昨天',
      unread: 1,
    },
    {
      id: '3',
      name: '张薇张薇',
      avatar: '张',
      lastMessage: '周末一起打球？',
      timestamp: '昨天',
    },
    {
      id: '4',
      name: 'AI助手',
      avatar: 'A',
      lastMessage: '有什么我可以帮您的？',
      timestamp: '今天',
    }
  ];
  
  // 模拟聊天消息数据
  private mockChatMessages: Record<string, ChatMessage[]> = {
    '1': [
      {
        id: '1_1',
        content: '你好，这是文件传输助手',
        isSelf: false,
        timestamp: '10:00',
      },
      {
        id: '1_2',
        content: '我可以帮你传输文件',
        isSelf: false,
        timestamp: '10:01',
      },
      {
        id: '1_3',
        content: '好的，我知道了',
        isSelf: true,
        timestamp: '10:05',
      }
    ],
    '2': [
      {
        id: '2_1',
        content: '亲爱的',
        isSelf: false,
        timestamp: '20:00',
      },
      {
        id: '2_2',
        content: '今天加班吗？',
        isSelf: false,
        timestamp: '20:01',
      },
      {
        id: '2_3',
        content: '是的，可能要晚点回家',
        isSelf: true,
        timestamp: '20:10',
      },
      {
        id: '2_4',
        content: '好的，注意休息',
        isSelf: false,
        timestamp: '20:11',
      },
      {
        id: '2_5',
        content: '晚安宝宝',
        isSelf: false,
        timestamp: '22:30',
      }
    ],
    '3': [
      {
        id: '3_1',
        content: '嘿，最近怎么样？',
        isSelf: false,
        timestamp: '15:00',
      },
      {
        id: '3_2',
        content: '还不错，你呢？',
        isSelf: true,
        timestamp: '15:05',
      },
      {
        id: '3_3',
        content: '周末一起打球？',
        isSelf: false,
        timestamp: '15:10',
      }
    ],
    '4': [
      {
        id: '4_1',
        content: '你好，我是AI助手',
        isSelf: false,
        timestamp: '09:00',
      },
      {
        id: '4_2',
        content: '有什么我可以帮您的？',
        isSelf: false,
        timestamp: '09:01',
      }
    ]
  };
  
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
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        chats: this.mockChats,
        total: this.mockChats.length
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
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const chat = this.mockChats.find(chat => chat.id === id);
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
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // 获取聊天消息
      const messages = this.mockChatMessages[chatId] || [];
      
      // 按时间排序（这里假设timestamp是时间字符串，实际可能需要转换为Date进行排序）
      return [...messages].sort((a, b) => {
        // 简单模拟时间排序，实际应用中应该将timestamp转为Date对象后比较
        return a.timestamp.localeCompare(b.timestamp);
      });
    } catch (error) {
      console.error(`获取聊天 ${chatId} 消息失败:`, error);
      throw new ChatMessagesFetchException(chatId);
    }
  }
}

// 导出聊天服务单例
export const chatService = ChatService.getInstance(); 