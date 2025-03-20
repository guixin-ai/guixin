/**
 * 聊天模型 - 定义聊天相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { chatService } from '@/services/chat.service';
import { ChatItem, ChatMessage } from '@/types/chat';
import {
  ChatNotFoundException,
  ChatListInitFailedException,
  ChatMessagesInitFailedException,
} from '@/errors/chat.errors';

// 聊天状态接口
export interface ChatState {
  // 聊天列表
  chats: ChatItem[];
  // 聊天消息，以聊天ID为键
  chatMessages: Record<string, ChatMessage[]>;
  // 已初始化的聊天消息ID集合
  initializedChatIds: Record<string, boolean>;
  // 是否已初始化
  initialized: boolean;

  // 操作方法
  fetchAllChats: () => Promise<void>;
  fetchChatById: (id: string) => Promise<ChatItem | null>;
  searchChats: (query: string) => ChatItem[];
  addChat: (chat: ChatItem) => void;

  // 聊天消息相关方法
  getChatMessages: (chatId: string) => Promise<ChatMessage[]>;
  addChatMessage: (chatId: string, message: ChatMessage) => void;
  updateChatMessage: (chatId: string, messageId: string, content: string) => void;

  // 初始化方法
  initialize: () => Promise<ChatItem[]>;
  // 初始化指定聊天的消息
  initializeChatMessages: (chatId: string) => Promise<ChatMessage[]>;
}

// 示例数据
const initialChats: ChatItem[] = [];

// 创建聊天状态存储
export const useChatStore = create(
  devtools(
    immer<ChatState>((set, get) => ({
      // 初始状态
      chats: initialChats,
      chatMessages: {},
      initializedChatIds: {},
      initialized: false,

      // 获取所有聊天
      fetchAllChats: async () => {
        try {
          // 调用服务获取聊天列表
          const response = await chatService.getChats();

          set(state => {
            state.chats = response.chats;
          });
        } catch (error) {
          console.error('获取聊天列表失败:', error);
        }
      },

      // 根据ID获取聊天
      fetchChatById: async (id: string) => {
        try {
          // 先从本地状态查找
          const localChat = get().chats.find(chat => chat.id === id);
          if (localChat) return localChat;

          // 如果本地没有，则调用服务获取
          const chat = await chatService.getChatById(id);
          if (!chat) {
            throw new ChatNotFoundException(id);
          }
          return chat;
        } catch (error) {
          console.error('获取聊天详情失败:', error);
          // 重新抛出异常，让调用方处理
          if (error instanceof ChatNotFoundException) {
            throw error;
          }
          // 其他错误可以包装一下再抛出
          throw new ChatNotFoundException(id);
        }
      },

      // 搜索聊天
      searchChats: (query: string) => {
        const { chats } = get();
        return chats.filter(chat => chat.name.toLowerCase().includes(query.toLowerCase()));
      },

      // 添加新聊天
      addChat: (chat: ChatItem) => {
        set(state => {
          // 将新聊天添加到列表最前面
          state.chats.unshift(chat);
        });
      },

      // 获取聊天消息
      getChatMessages: async (chatId: string) => {
        // 如果该聊天已初始化，直接返回缓存数据
        const state = get();
        if (state.initializedChatIds[chatId]) {
          return state.chatMessages[chatId] || [];
        }

        // 如果未初始化，则调用初始化方法
        return await get().initializeChatMessages(chatId);
      },

      // 添加新消息
      addChatMessage: (chatId: string, message: ChatMessage) => {
        set(state => {
          console.log('添加新消息:', message);
          // 如果缓存中没有该聊天的消息，先创建空数组
          if (!state.chatMessages[chatId]) {
            state.chatMessages[chatId] = [];
          }

          // 添加消息到缓存
          state.chatMessages[chatId].push(message);

          // 更新聊天列表中的最后一条消息
          const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
          if (chatIndex !== -1) {
            state.chats[chatIndex].lastMessage = message.content;
            state.chats[chatIndex].timestamp = '刚刚';

            // 将此聊天移到列表最前面
            const chat = state.chats[chatIndex];
            state.chats.splice(chatIndex, 1);
            state.chats.unshift(chat);
          }
        });
      },

      // 更新现有消息
      updateChatMessage: (chatId: string, messageId: string, content: string) => {
        set(state => {
          // 如果缓存中没有该聊天的消息，直接返回
          if (!state.chatMessages[chatId]) {
            return;
          }

          // 查找消息并更新
          const messageIndex = state.chatMessages[chatId].findIndex(msg => msg.id === messageId);
          if (messageIndex !== -1) {
            // 更新消息内容
            state.chatMessages[chatId][messageIndex].content = content;

            // 如果更新的是最新消息，同时更新聊天列表中的最后一条消息
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
            if (chatIndex !== -1 && messageIndex === state.chatMessages[chatId].length - 1) {
              state.chats[chatIndex].lastMessage = content;
              state.chats[chatIndex].timestamp = '刚刚';
            }
          }
        });
      },

      // 初始化聊天列表
      initialize: async () => {
        const state = get();

        // 如果已经初始化，则直接返回聊天列表
        if (state.initialized) {
          return state.chats;
        }

        try {
          // 调用fetchAllChats获取聊天列表
          await get().fetchAllChats();

          // 标记为已初始化
          set(state => {
            state.initialized = true;
          });

          // 返回初始化后的聊天列表
          return get().chats;
        } catch (error) {
          console.error('聊天模型初始化失败:', error);
          // 抛出自定义异常
          throw new ChatListInitFailedException(error);
        }
      },

      // 初始化指定聊天的消息
      initializeChatMessages: async (chatId: string) => {
        // 检查是否已经初始化
        const state = get();
        if (state.initializedChatIds[chatId]) {
          return state.chatMessages[chatId] || [];
        }

        try {
          // 从服务获取消息
          const messages = await chatService.getChatMessages(chatId);

          // 将获取的消息存入缓存并标记为已初始化
          set(state => {
            state.chatMessages[chatId] = messages;
            state.initializedChatIds[chatId] = true;
          });

          return messages;
        } catch (error) {
          console.error(`初始化聊天 ${chatId} 的消息失败:`, error);
          // 抛出自定义异常
          throw new ChatMessagesInitFailedException(chatId, error);
        }
      },
    })),
    {
      name: 'chat',
    }
  )
);

// 导出聊天状态钩子
export const useChat = () => useChatStore();
