/**
 * 聊天模型 - 定义聊天相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// 聊天项类型
export interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
}

// 聊天状态接口
export interface ChatState {
  // 聊天列表
  chats: ChatItem[];
  // 当前选中的聊天ID
  currentChatId: string | null;

  // 操作方法
  fetchAllChats: () => void;
  fetchChatById: (id: string) => ChatItem | undefined;
  setCurrentChat: (chatId: string) => void;
  clearCurrentChat: () => void;
  searchChats: (query: string) => ChatItem[];
  addChat: (chat: ChatItem) => void;
}

// 示例数据
const initialChats: ChatItem[] = [
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
    name: '于雯雯医生',
    avatar: '于',
    lastMessage: '好的，请按时服药',
    timestamp: '昨天',
  },
  {
    id: '5',
    name: '柒公子 顺丰快递 收件',
    avatar: '柒',
    lastMessage: '您的快递已经送达前台',
    timestamp: '昨天',
  },
  {
    id: '6',
    name: '订阅号',
    avatar: '订',
    lastMessage: '南京本地宝: 好消息！江苏新增5家国家级旅游度假区',
    timestamp: '昨天',
    unread: 3,
  },
  {
    id: '7',
    name: '大疆',
    avatar: 'D',
    lastMessage: '新品发布会邀请',
    timestamp: '昨天',
  },
  {
    id: '8',
    name: '扣子Coze',
    avatar: '扣',
    lastMessage: '有什么可以帮到您？',
    timestamp: '星期二',
  },
  {
    id: '9',
    name: '携程旅行网',
    avatar: '携',
    lastMessage: '最后一天，超爆全返场！限时优惠！',
    timestamp: '星期二',
  },
];

// 创建聊天状态存储
export const useChatStore = create(
  immer<ChatState>((set, get) => ({
    // 初始状态
    chats: initialChats,
    currentChatId: null,

    // 获取所有聊天
    fetchAllChats: () => {
      // 这里可以添加从API获取聊天列表的逻辑
      // 目前直接使用本地数据
      set(state => {
        state.chats = initialChats;
      });
    },

    // 根据ID获取聊天
    fetchChatById: (id: string) => {
      const chat = get().chats.find(chat => chat.id === id);
      return chat;
    },

    // 设置当前聊天
    setCurrentChat: (chatId: string) => {
      set(state => {
        state.currentChatId = chatId;
      });
    },

    // 清除当前聊天
    clearCurrentChat: () => {
      set(state => {
        state.currentChatId = null;
      });
    },

    // 搜索聊天
    searchChats: (query: string) => {
      const { chats } = get();
      return chats.filter(chat => 
        chat.name.toLowerCase().includes(query.toLowerCase())
      );
    },

    // 添加新聊天
    addChat: (chat: ChatItem) => {
      set(state => {
        // 将新聊天添加到列表最前面
        state.chats.unshift(chat);
        // 设置为当前聊天
        state.currentChatId = chat.id;
      });
    },
  }))
);

// 获取当前选中的聊天（计算属性）
export const useCurrentChat = () => {
  const { currentChatId, chats } = useChatStore();
  return chats.find(chat => chat.id === currentChatId) || null;
};

// 导出聊天状态钩子
export const useChat = () => useChatStore(); 