/**
 * 聊天模型 - 定义聊天相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { chatService } from '@/services/chat.service';
import { ChatItem, ChatMessage, ChatDetail, ChatMember } from '@/types/chat';
import {
  ChatNotFoundException,
  ChatListInitFailedException,
  ChatMessagesInitFailedException,
  ChatDetailInitFailedException,
  GroupChatCreationFailedException
} from '@/errors/chat.errors';
import { Contact } from '@/types/contact';
import { useContactStore } from '@/models/contact.model';
import { useAppStore } from '@/models/app.model';

// 聊天状态接口
export interface ChatState {
  // 聊天列表
  chats: ChatItem[];
  // 聊天详情，以聊天ID为键
  chatDetails: Record<string, ChatDetail>;
  // 聊天消息，以聊天ID为键
  chatMessages: Record<string, ChatMessage[]>;
  // 已初始化的聊天消息ID集合
  initializedChatIds: Record<string, boolean>;
  // 已初始化的聊天详情ID集合
  initializedChatDetailIds: Record<string, boolean>;
  // 是否已初始化聊天列表
  initializedChatList: boolean;

  // 聊天列表相关方法
  searchChats: (query: string) => ChatItem[];
  addChat: (chat: ChatItem) => void;
  getChatList: () => Promise<ChatItem[]>;
  createGroupChat: (contactIds: string[]) => Promise<string>;
  
  // 聊天消息相关方法
  getChatMessages: (chatId: string) => Promise<ChatMessage[]>;
  addChatMessage: (chatId: string, message: ChatMessage) => void;
  updateChatMessage: (chatId: string, messageId: string, content: string) => void;

  // 聊天详情相关方法
  getChatDetail: (chatId: string) => Promise<ChatDetail | null>;
  updateChatMembers: (chatId: string, members: ChatMember[]) => void;
  addChatMember: (chatId: string, member: ChatMember) => void;
  
  // 初始化方法
  initializeChatList: (chats: ChatItem[]) => void;
  initializeChatMessages: (chatId: string, messages: ChatMessage[]) => void;
  initializeChatDetail: (chatId: string, chatDetail: ChatDetail) => void;
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
      chatDetails: {},
      initializedChatIds: {},
      initializedChatDetailIds: {},
      initializedChatList: false,

      // 获取聊天列表（检查初始化状态并返回数据）
      getChatList: async () => {
        const state = get();
        
        // 如果已经初始化，则直接返回聊天列表
        if (state.initializedChatList) {
          return state.chats;
        }
        
        // 如果未初始化，则返回空列表
        return [];
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

      // 获取聊天消息（检查初始化状态并返回数据）
      getChatMessages: async (chatId: string) => {
        const state = get();
        
        // 如果已经初始化，则直接返回缓存数据
        if (state.initializedChatIds[chatId]) {
          return state.chatMessages[chatId] || [];
        }
        
        // 如果未初始化，则返回空数组
        return [];
      },

      // 获取聊天详情（检查初始化状态并返回数据）
      getChatDetail: async (chatId: string) => {
        const state = get();
        
        // 如果已经初始化，则直接返回缓存数据
        if (state.initializedChatDetailIds[chatId]) {
          return state.chatDetails[chatId] || null;
        }
        
        // 如果未初始化，则返回null
        return null;
      },

      // 更新聊天成员列表
      updateChatMembers: (chatId: string, members: ChatMember[]) => {
        set(state => {
          // 如果缓存中没有该聊天的详情，直接返回
          if (!state.chatDetails[chatId]) {
            return;
          }

          // 更新聊天成员列表
          state.chatDetails[chatId].members = members;
        });
      },

      // 添加聊天成员
      addChatMember: (chatId: string, member: ChatMember) => {
        set(state => {
          // 如果缓存中没有该聊天的详情，直接返回
          if (!state.chatDetails[chatId]) {
            return;
          }

          // 确保members数组存在
          if (!state.chatDetails[chatId].members) {
            state.chatDetails[chatId].members = [];
          }

          // 检查成员是否已存在
          const memberExists = state.chatDetails[chatId].members!.some(
            m => m.id === member.id
          );
          
          // 如果成员不存在，则添加
          if (!memberExists) {
            state.chatDetails[chatId].members!.push(member);
          }
        });
      },

      // 添加新消息
      addChatMessage: (chatId: string, message: ChatMessage) => {
        // 先检查是否初始化
        const state = get();
        if (!state.initializedChatIds[chatId]) {
          throw new ChatMessagesInitFailedException(chatId, '添加消息前必须初始化聊天消息');
        }

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
        // 先检查是否初始化
        const state = get();
        if (!state.initializedChatIds[chatId]) {
          throw new ChatMessagesInitFailedException(chatId, '更新消息前必须初始化聊天消息');
        }

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

      // 初始化聊天列表 - 同步方法，接收聊天数据参数
      initializeChatList: (chats: ChatItem[]) => {
        set(state => {
          state.chats = chats;
          state.initializedChatList = true;
        });
      },

      // 初始化指定聊天的消息 - 改为同步方法，接收消息数据参数
      initializeChatMessages: (chatId: string, messages: ChatMessage[]) => {
        set(state => {
          state.chatMessages[chatId] = messages;
          state.initializedChatIds[chatId] = true;
        });
      },

      // 初始化指定聊天的详情 - 改为同步方法，接收聊天详情参数
      initializeChatDetail: (chatId: string, chatDetail: ChatDetail) => {
        set(state => {
          state.chatDetails[chatId] = chatDetail;
          state.initializedChatDetailIds[chatId] = true;
        });
      },

      // 创建群聊
      createGroupChat: async (contactIds: string[]): Promise<string> => {
        if (!contactIds || contactIds.length === 0) {
          throw new GroupChatCreationFailedException('创建群聊至少需要一个联系人');
        }
        
        // 从应用模型中获取当前用户信息
        const appStore = useAppStore;
        const currentUser = appStore.getState().currentUser;
        
        if (!currentUser) {
          // 如果未找到当前用户，尝试获取
          try {
            await appStore.getState().fetchCurrentUser();
          } catch (error) {
            throw new GroupChatCreationFailedException('获取当前用户信息失败，无法创建群聊', error);
          }
        }
        
        // 再次检查当前用户
        const user = appStore.getState().currentUser;
        if (!user) {
          throw new GroupChatCreationFailedException('获取当前用户信息失败，无法创建群聊');
        }
        
        // 从useContactStore中导入必要的函数
        const contactStore = useContactStore;
        
        // 生成唯一ID
        const now = new Date();
        const chatId = `chat-${now.getTime()}`;
        
        // 获取成员信息
        const members: ChatMember[] = [
          // 添加当前用户作为第一个成员
          {
            id: user.id,
            name: user.name || '我',
            avatar: '我', // 用户可能没有avatar字段，直接使用默认值
            username: `@${user.name}` // 用户可能没有username字段，使用name代替
          }
        ];
        
        // 从联系人详情中获取联系人信息（异步操作）
        try {
          // 不需要确保联系人列表已初始化，直接获取详情
          // 获取每个联系人的详细信息
          for (const contactId of contactIds) {
            try {
              // 直接获取联系人详情，getContactDetail内部会处理初始化
              const contactDetail = await contactStore.getState().getContactDetail(contactId);
              
              if (!contactDetail) {
                throw new Error(`联系人 ${contactId} 的详情不存在`);
              }
              
              // 添加到成员列表
              members.push({
                id: contactId,
                name: contactDetail.name,
                avatar: contactDetail.avatar,
                username: `@${contactDetail.name}`
              });
            } catch (error) {
              console.error(`获取联系人 ${contactId} 详情失败:`, error);
              throw new GroupChatCreationFailedException(`无法获取联系人 ${contactId} 的详情`, error);
            }
          }
        } catch (error) {
          console.error('获取联系人详情失败:', error);
          throw new GroupChatCreationFailedException('获取联系人详情失败', error);
        }
        
        // 收集所有成员的头像，用于聊天列表显示
        const avatars = members.map(member => member.avatar).filter(Boolean);
        // 如果没有头像，使用默认值
        if (avatars.length === 0) {
          avatars.push('聊');
        }
        
        // 创建新的聊天列表项
        const newChat: ChatItem = {
          id: chatId,
          name: contactIds.length > 1 ? `群聊 (${members.length})` : members[1]?.name || "新的聊天",
          avatar: avatars,
          lastMessage: "还没有消息",
          timestamp: "刚刚",
          unread: 0
        };
        
        // 添加到聊天列表
        get().addChat(newChat);
        
        // 初始化聊天详情
        const chatDetail: ChatDetail = {
          id: chatId,
          name: newChat.name,
          avatar: avatars,
          members: members
        };
        
        // 调用同步的初始化方法设置聊天详情和消息
        get().initializeChatDetail(chatId, chatDetail);
        get().initializeChatMessages(chatId, []);
        
        return chatId;
      },
    })),
    {
      name: 'chat',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
