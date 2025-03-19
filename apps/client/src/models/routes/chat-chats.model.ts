import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { chatService } from '../../services';
import {
  CreateIndividualChatRequest,
  MarkAsReadRequest,
  ResetUnreadCountRequest,
} from '../../types';
import { useUserStore } from '../user.model';

// 定义类型
export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unread: number;
  type: string;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isSelf: boolean;
  isTyping?: boolean;
  contentType?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
}

// 参与者类型定义
export interface Participant {
  id: string; // 用户ID
  name: string; // 用户名称
  avatar: string; // 头像
  isAI: boolean; // 是否为AI
  role: string; // 角色（owner, member）
  unreadCount: number; // 未读消息数
}

// 会话类型定义
export interface Conversation {
  id: string; // 会话ID
  chatId: string; // 聊天ID
  title: string; // 会话标题
  type: string; // 会话类型（individual, group）
  participants: Participant[]; // 参与者列表
  messages: Message[]; // 消息列表
  lastMessage?: {
    // 最后一条消息
    content: string;
    time: string;
    senderId: string;
    senderName: string;
  };
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

interface ChatsState {
  chats: Chat[];
  messages: Record<string, Message[]>;
  activeChatId: string | null;
  messageInput: string;

  // 会话相关
  currentConversation: Conversation | null;
  isBot: boolean;

  // 加载状态
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  isLoadingConversation: boolean;
  loadError: string | null;

  // 操作
  setActiveChat: (chatId: string) => void;
  setMessageInput: (input: string) => void;
  sendMessage: (content: string, contentType?: string) => Promise<void>;
  loadChats: (userId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<Message[]>;

  // 会话相关操作
  loadConversation: (chatId: string) => Promise<void>;
  markAsRead: (chatId: string, userId: string, messageId: string) => Promise<void>;
  resetUnreadCount: (chatId: string, userId: string) => Promise<void>;
  getChatParticipants: (chatId: string) => Promise<Participant[]>;
  clearCurrentConversation: () => void;

  // 其他操作
  createIndividualChat: (
    receiverId: string,
    title: string,
    initialMessage?: string
  ) => Promise<string>;
  deleteChat: (chatId: string) => Promise<void>;
}

export const useChatsStore = create(
  immer<ChatsState>((set, get) => ({
    chats: [],
    messages: {},
    activeChatId: null,
    messageInput: '',

    // 会话相关
    currentConversation: null,
    isBot: false,

    // 加载状态
    isLoadingChats: false,
    isLoadingMessages: false,
    isSendingMessage: false,
    isLoadingConversation: false,
    loadError: null,

    setActiveChat: chatId => {
      set(state => {
        state.activeChatId = chatId;
        // 这里不再自动调用loadConversation，因为组件会处理这个
        return state;
      });

      // 激活聊天后，立即加载会话
      const currentUser = useUserStore.getState().currentUser;
      if (currentUser && chatId) {
        get().loadConversation(chatId);
      }
    },

    setMessageInput: input =>
      set(state => {
        state.messageInput = input;
        return state;
      }),

    loadChats: async userId => {
      try {
        set(state => {
          state.isLoadingChats = true;
          state.loadError = null;
          return state;
        });

        // 使用优化版的API获取聊天列表
        const chatsWithDetails = await chatService.getUserChats({
          user_id: userId,
          include_empty: false,
          sort_by: 'last_message_time',
        });

        // 转换为前端使用的格式
        const chats: Chat[] = chatsWithDetails.map(chat => ({
          id: chat.id,
          name: chat.title,
          avatar: chat.title.charAt(0).toUpperCase(), // 使用名称首字母作为头像
          lastMessage: chat.last_message_content || null,
          lastMessageTime: chat.last_message_time
            ? new Date(chat.last_message_time).toLocaleString()
            : null,
          unread: chat.unread_count,
          type: chat.type_,
        }));

        set(state => {
          state.chats = chats;
          state.isLoadingChats = false;

          // 如果有聊天，默认选中第一个
          if (state.chats.length > 0 && !state.activeChatId) {
            state.activeChatId = state.chats[0].id;
          }

          return state;
        });
      } catch (error) {
        set(state => {
          state.isLoadingChats = false;
          state.loadError = error instanceof Error ? error.message : '加载聊天列表失败';
          return state;
        });

        console.error('加载聊天列表失败:', error);
        throw error;
      }
    },

    loadMessages: async chatId => {
      try {
        set(state => {
          state.isLoadingMessages = true;
          state.loadError = null;
          return state;
        });

        // 使用新接口获取消息
        const messages = await chatService.getChatMessages({
          chat_id: chatId,
          page: 1,
          page_size: 20,
        });

        // 转换为前端使用的格式
        const currentUser = useUserStore.getState().currentUser;
        const formattedMessages: Message[] = messages.map(msg => ({
          id: msg.id,
          sender: msg.sender_id,
          content: msg.content,
          time: new Date(msg.created_at).toLocaleString(),
          isSelf: currentUser ? msg.sender_id === currentUser.id : false,
          contentType: msg.content_type,
          status:
            msg.status === 'sent'
              ? 'sent'
              : msg.status === 'delivered'
                ? 'delivered'
                : msg.status === 'read'
                  ? 'read'
                  : 'sent',
        }));

        set(state => {
          state.messages[chatId] = formattedMessages;
          state.isLoadingMessages = false;
          return state;
        });

        return formattedMessages;
      } catch (error) {
        set(state => {
          state.isLoadingMessages = false;
          state.loadError = error instanceof Error ? error.message : '加载消息失败';
          return state;
        });

        console.error('加载消息失败:', error);
        throw error;
      }
    },

    loadConversation: async (chatId: string) => {
      try {
        set(state => {
          state.isLoadingConversation = true;
          state.loadError = null;
          return state;
        });

        // 获取当前用户
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser) {
          throw new Error('未登录');
        }

        // 获取聊天信息
        const chat = await chatService.getChatById(chatId);

        // 获取聊天参与者
        const participants = await get().getChatParticipants(chatId);

        // 加载消息
        const messages = await get().loadMessages(chatId);

        // 检查是否有AI参与者
        const botParticipant = participants.find(p => p.isAI);
        const isBot = !!botParticipant;

        // 创建会话对象
        const conversation: Conversation = {
          id: chat.id, // 简化处理，使用chat.id作为conversation.id
          chatId: chat.id,
          title: chat.title,
          type: chat.type_,
          participants: participants,
          messages: messages,
          lastMessage: chat.last_message_content
            ? {
                content: chat.last_message_content,
                time: chat.last_message_time || new Date().toISOString(),
                senderId: chat.last_message_sender_id || '',
                senderName: chat.last_message_sender_name || '',
              }
            : undefined,
          createdAt: chat.created_at,
          updatedAt: chat.updated_at,
        };

        // 更新状态
        set(state => {
          state.currentConversation = conversation;
          state.isBot = isBot;
          state.isLoadingConversation = false;
          return state;
        });

        // 标记为已读
        await get().resetUnreadCount(chatId, currentUser.id);
      } catch (err) {
        console.error('加载会话失败:', err);
        set(state => {
          state.isLoadingConversation = false;
          state.loadError = err instanceof Error ? err.message : '加载会话失败';
          return state;
        });
        throw err;
      }
    },

    sendMessage: async (content, contentType = 'text') => {
      if (!content.trim()) return;

      const { activeChatId, currentConversation } = get();
      if (!activeChatId || !currentConversation) return;

      try {
        set(state => {
          state.isSendingMessage = true;
          state.loadError = null;
          return state;
        });

        // 获取当前用户
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser) {
          throw new Error('当前用户未登录');
        }

        // 准备临时消息
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          sender: currentUser.id,
          content,
          time: new Date().toLocaleTimeString(),
          isSelf: true,
          contentType,
          status: 'sending',
        };

        // 先添加临时消息
        set(state => {
          // 确保消息数组存在
          if (!state.messages[activeChatId]) {
            state.messages[activeChatId] = [];
          }

          // 添加临时消息到消息列表
          state.messages[activeChatId].push(tempMessage);

          // 同时更新当前会话的消息
          if (state.currentConversation) {
            state.currentConversation.messages.push(tempMessage);
          }

          return state;
        });

        // 发送消息到服务器
        const sentMessage = await chatService.sendMessage({
          chat_id: activeChatId,
          sender_id: currentUser.id,
          content,
          content_type: contentType,
        });

        // 更新消息状态
        set(state => {
          // 找到并更新临时消息
          const messageIndex = state.messages[activeChatId].findIndex(
            msg => msg.id === tempMessage.id
          );

          if (messageIndex !== -1) {
            // 用服务器返回的消息替换临时消息
            state.messages[activeChatId][messageIndex] = {
              id: sentMessage.id,
              sender: sentMessage.sender_id,
              content: sentMessage.content,
              time: new Date(sentMessage.created_at).toLocaleTimeString(),
              isSelf: true,
              contentType: sentMessage.content_type,
              status: 'sent',
            };
          }

          // 同样更新当前会话中的消息
          if (state.currentConversation) {
            const convMsgIndex = state.currentConversation.messages.findIndex(
              msg => msg.id === tempMessage.id
            );

            if (convMsgIndex !== -1) {
              state.currentConversation.messages[convMsgIndex] = {
                id: sentMessage.id,
                sender: sentMessage.sender_id,
                content: sentMessage.content,
                time: new Date(sentMessage.created_at).toLocaleTimeString(),
                isSelf: true,
                contentType: sentMessage.content_type,
                status: 'sent',
              };
            }
          }

          // 更新聊天的最后一条消息
          const chatIndex = state.chats.findIndex(c => c.id === activeChatId);
          if (chatIndex !== -1) {
            state.chats[chatIndex].lastMessage = content;
            state.chats[chatIndex].lastMessageTime = new Date().toLocaleString();
          }

          // 清空输入
          state.messageInput = '';
          state.isSendingMessage = false;

          return state;
        });
      } catch (error) {
        // 处理发送失败
        set(state => {
          // 找到并更新临时消息状态为错误
          if (state.messages[activeChatId]) {
            const messageIndex = state.messages[activeChatId].findIndex(
              msg => msg.id === `temp-${Date.now()}`
            );

            if (messageIndex !== -1) {
              state.messages[activeChatId][messageIndex].status = 'error';
            }
          }

          // 同样更新当前会话中的消息
          if (state.currentConversation) {
            const convMsgIndex = state.currentConversation.messages.findIndex(
              msg => msg.id === `temp-${Date.now()}`
            );

            if (convMsgIndex !== -1) {
              state.currentConversation.messages[convMsgIndex].status = 'error';
            }
          }

          state.isSendingMessage = false;
          state.loadError = error instanceof Error ? error.message : '发送消息失败';
          return state;
        });

        console.error('发送消息失败:', error);
        throw error;
      }
    },

    // 获取聊天参与者
    getChatParticipants: async (chatId: string): Promise<Participant[]> => {
      try {
        // 获取参与者
        const chatParticipants = await chatService.getChatParticipants(chatId);

        // 转换为前端使用的格式
        const participants: Participant[] = [];

        for (const participant of chatParticipants) {
          // 这里需要根据participant.user_id获取用户信息
          // 简化处理，使用模拟数据
          const user = {
            id: participant.user_id,
            name: '用户' + participant.user_id.substring(0, 4),
            isAI: false, // 默认为非AI
            avatar: '用',
          };

          participants.push({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            isAI: user.isAI,
            role: participant.role,
            unreadCount: participant.unread_count,
          });
        }

        return participants;
      } catch (err) {
        console.error('获取聊天参与者失败:', err);
        throw err;
      }
    },

    markAsRead: async (chatId, userId, messageId) => {
      try {
        const request: MarkAsReadRequest = {
          chat_id: chatId,
          user_id: userId,
          message_id: messageId,
        };

        await chatService.markMessageAsRead(request);

        // 更新状态
        set(state => {
          const chatIndex = state.chats.findIndex(c => c.id === chatId);
          if (chatIndex !== -1) {
            state.chats[chatIndex].unread = 0;
          }

          // 更新当前会话中的未读数
          if (state.currentConversation && state.currentConversation.chatId === chatId) {
            const participantIndex = state.currentConversation.participants.findIndex(
              p => p.id === userId
            );

            if (participantIndex !== -1) {
              state.currentConversation.participants[participantIndex].unreadCount = 0;
            }
          }

          return state;
        });
      } catch (error) {
        console.error('标记已读失败:', error);
        throw error;
      }
    },

    resetUnreadCount: async (chatId, userId) => {
      try {
        const request: ResetUnreadCountRequest = {
          chat_id: chatId,
          user_id: userId,
        };

        await chatService.resetUnreadCount(request);

        // 更新状态
        set(state => {
          const chatIndex = state.chats.findIndex(c => c.id === chatId);
          if (chatIndex !== -1) {
            state.chats[chatIndex].unread = 0;
          }

          // 更新当前会话中的未读数
          if (state.currentConversation && state.currentConversation.chatId === chatId) {
            const participantIndex = state.currentConversation.participants.findIndex(
              p => p.id === userId
            );

            if (participantIndex !== -1) {
              state.currentConversation.participants[participantIndex].unreadCount = 0;
            }
          }

          return state;
        });
      } catch (error) {
        console.error('重置未读计数失败:', error);
        throw error;
      }
    },

    // 清除当前会话
    clearCurrentConversation: () => {
      set(state => {
        state.currentConversation = null;
        state.isBot = false;
        return state;
      });
    },

    createIndividualChat: async (receiverId, title, initialMessage) => {
      try {
        // 获取当前用户
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser) {
          throw new Error('当前用户未登录');
        }

        const request: CreateIndividualChatRequest = {
          initiator_id: currentUser.id,
          receiver_id: receiverId,
          title,
          initial_message: initialMessage,
        };

        const newChat = await chatService.createIndividualChat(request);

        // 更新状态
        set(state => {
          const chat: Chat = {
            id: newChat.id,
            name: newChat.title,
            avatar: newChat.title.charAt(0).toUpperCase(),
            lastMessage: newChat.last_message_content || null,
            lastMessageTime: newChat.last_message_time
              ? new Date(newChat.last_message_time).toLocaleString()
              : null,
            unread: 0,
            type: newChat.type_,
          };

          state.chats.push(chat);
          state.messages[newChat.id] = [];

          return state;
        });

        return newChat.id;
      } catch (error) {
        console.error('创建单聊失败:', error);
        throw error;
      }
    },

    deleteChat: async chatId => {
      try {
        await chatService.deleteChat(chatId);

        // 更新状态
        set(state => {
          state.chats = state.chats.filter(c => c.id !== chatId);
          delete state.messages[chatId];

          // 如果删除的是当前活跃聊天，则切换到第一个聊天
          if (state.activeChatId === chatId) {
            state.activeChatId = state.chats.length > 0 ? state.chats[0].id : null;
            state.currentConversation = null; // 清除当前会话
          }

          return state;
        });
      } catch (error) {
        console.error('删除聊天失败:', error);
        throw error;
      }
    },
  }))
);

export default useChatsStore;
