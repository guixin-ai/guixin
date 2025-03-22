/**
 * AI队列模型 - 定义AI回复队列相关的数据结构和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import EventEmitter from 'eventemitter3';
import { OllamaMessage } from '@/services/ollama.service';

// AI成员接口
export interface AIMember {
  id: string;
  name: string;
  avatar: string;
  description?: string;
  isAI: boolean;
}

// AI队列项接口
export interface AIQueueItem {
  chatId: string;
  messageId: string;
  aiMember: AIMember;
  modelName: string;
  options?: {
    temperature?: number;
    top_p?: number;
    [key: string]: any;
  };
  abortController?: AbortController;
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: number;
  updatedAt: number;
  errorMessage?: string;
}

// AI响应处理器接口
export interface AIResponseHandlers {
  onStart?: (messageId: string, aiMember: AIMember) => void;
  onContent?: (messageId: string, content: string, aiMember: AIMember) => void;
  onComplete?: (messageId: string, fullContent: string, aiMember: AIMember) => void;
  onError?: (messageId: string, error: Error, aiMember: AIMember) => void;
}

// AI队列事件类型
export enum AIQueueEvents {
  QUEUE_CHANGED = 'queue_changed',
  PROCESSING_STARTED = 'processing_started',
  PROCESSING_COMPLETED = 'processing_completed',
  PROCESSING_ERROR = 'processing_error',
  QUEUE_CLEARED = 'queue_cleared',
}

// AI队列状态接口
export interface AIQueueState {
  // 队列项，按聊天ID分组
  queueItems: Record<string, AIQueueItem[]>;
  
  /**
   * 当前处理中的队列项，按聊天ID索引
   * 
   * 这是一个核心数据结构，用于追踪和管理每个聊天当前正在处理的AI回复任务：
   * - 键是聊天ID，值是正在处理的AIQueueItem或null（表示没有处理中的项）
   * - 每个聊天同一时间只能有一个正在处理的项目，确保消息的顺序处理
   * - 当开始处理时，队列项从queueItems[chatId]中移除并设置为processingItems[chatId]
   * - 处理完成或出错后，将设置为null以允许处理下一个队列项
   * - 用于回调控制，确保只有正在处理的消息才能触发内容更新
   * - 存储abortController，支持用户随时中断AI生成
   * 
   * 例如：{ "chat1": {AIQueueItem}, "chat2": null }
   */
  processingItems: Record<string, AIQueueItem | null>;
  
  // 消息历史缓存，按聊天ID存储
  chatHistoryCache: Record<string, OllamaMessage[]>;
  
  // 响应处理器，按聊天ID存储
  responseHandlers: Record<string, AIResponseHandlers>;
  
  // 添加AI项到队列
  addToQueue: (item: Omit<AIQueueItem, 'abortController' | 'status' | 'createdAt' | 'updatedAt'>) => string;
  
  // 取消特定聊天中的所有AI响应
  cancelChat: (chatId: string) => void;
  
  // 取消所有AI响应
  cancelAll: () => void;
  
  // 获取队列状态
  getQueueStatus: (chatId: string) => {
    queueLength: number;
    isProcessing: boolean;
    currentItem: {
      chatId: string;
      messageId: string;
      aiMember: {
        id: string;
        name: string;
      };
    } | null;
  };
  
  // 更新特定聊天的历史记录
  updateChatHistory: (chatId: string, messages: OllamaMessage[]) => void;
  
  // 添加单条消息到历史记录
  addMessageToHistory: (chatId: string, message: OllamaMessage) => void;
  
  // 获取特定聊天的历史记录
  getChatHistory: (chatId: string) => OllamaMessage[];
  
  // 注册响应处理器
  registerHandlers: (chatId: string, handlers: AIResponseHandlers) => () => void;
  
  // 取消处理
  cancelProcessing: (chatId: string, messageId: string) => void;
  
  /**
   * 开始处理队列项
   * 
   * 此方法负责将一个队列项从等待队列移动到活跃处理状态：
   * 1. 在queueItems[chatId]中找到指定messageId的队列项
   * 2. 将其状态更新为'processing'并从queueItems中移除
   * 3. 将该项设置为processingItems[chatId]，标记为当前正在处理的项
   * 4. 触发已注册的onStart回调，通知UI层开始处理
   * 
   * 这确保了每个聊天同一时间只有一个项目被处理，实现了顺序处理的机制
   * 
   * @param chatId 聊天ID
   * @param messageId 消息ID
   */
  startProcessing: (chatId: string, messageId: string) => void;
  
  /**
   * 处理内容更新
   * 
   * 该方法处理AI回复的流式内容更新：
   * 1. 检查processingItems[chatId]是否存在并且messageId匹配
   * 2. 如果匹配，则调用该聊天注册的onContent回调
   * 
   * 使用processingItems进行验证确保只有当前正在处理的消息才能触发内容更新，
   * 避免了已完成或已取消的处理继续影响UI
   * 
   * @param chatId 聊天ID
   * @param messageId 消息ID
   * @param content 更新的内容
   */
  handleContent: (chatId: string, messageId: string, content: string) => void;
  
  /**
   * 完成处理队列项
   * 
   * 该方法处理AI回复完成的流程：
   * 1. 验证processingItems[chatId]存在且messageId匹配
   * 2. 将队列项状态更新为'completed'
   * 3. 触发已注册的onComplete回调，通知UI层更新最终内容
   * 4. 将回复添加到chatHistoryCache以供后续AI生成使用
   * 5. 将processingItems[chatId]设置为null，表示该聊天可以开始处理下一个队列项
   * 
   * 处理完成后清空processingItems对应项是关键步骤，它允许队列系统继续处理下一个项目
   * 
   * @param chatId 聊天ID
   * @param messageId 消息ID 
   * @param content 完整的回复内容
   */
  completeProcessing: (chatId: string, messageId: string, content: string) => void;
  
  // 处理队列项出错
  errorProcessing: (chatId: string, messageId: string, error: Error) => void;
}

// 创建AI队列状态存储
export const useAIQueueStore = create(
  devtools(
    immer<AIQueueState>((set, get) => ({
      // 初始状态
      queueItems: {},
      processingItems: {},
      chatHistoryCache: {},
      responseHandlers: {},

      // 添加AI项到队列
      addToQueue: (item) => {
        const queueItem: AIQueueItem = {
          ...item,
          abortController: new AbortController(),
          status: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set(state => {
          // 初始化聊天队列（如果不存在）
          if (!state.queueItems[item.chatId]) {
            state.queueItems[item.chatId] = [];
          }
          
          // 添加队列项
          state.queueItems[item.chatId].push(queueItem);
        });
        
        return item.messageId;
      },

      // 取消特定聊天中的所有AI响应
      cancelChat: (chatId) => {
        set(state => {
          // 取消当前处理中的项目（如果属于该聊天）
          const processingItem = state.processingItems[chatId];
          if (processingItem) {
            processingItem.abortController?.abort();
            state.processingItems[chatId] = null;
          }
          
          // 中止队列中该聊天的所有项目
          const chatQueue = state.queueItems[chatId] || [];
          chatQueue.forEach(item => {
            item.abortController?.abort();
          });
          
          // 从队列中移除该聊天的所有项目
          state.queueItems[chatId] = [];
        });
      },

      // 取消所有AI响应
      cancelAll: () => {
        set(state => {
          // 取消所有处理中的项目
          Object.values(state.processingItems).forEach(item => {
            if (item) {
              item.abortController?.abort();
            }
          });
          
          // 重置状态
          state.processingItems = {};
          state.queueItems = {};
        });
      },

      // 获取队列状态
      getQueueStatus: (chatId) => {
        const state = get();
        const chatQueue = state.queueItems[chatId] || [];
        const processingItem = state.processingItems[chatId];
        
        return {
          queueLength: chatQueue.length,
          isProcessing: !!processingItem,
          currentItem: processingItem ? {
            chatId: processingItem.chatId,
            messageId: processingItem.messageId,
            aiMember: {
              id: processingItem.aiMember.id,
              name: processingItem.aiMember.name,
            }
          } : null
        };
      },

      // 更新特定聊天的历史记录
      updateChatHistory: (chatId, messages) => {
        set(state => {
          state.chatHistoryCache[chatId] = [...messages];
        });
      },
      
      // 添加单条消息到历史记录
      addMessageToHistory: (chatId, message) => {
        set(state => {
          const currentHistory = state.chatHistoryCache[chatId] || [];
          state.chatHistoryCache[chatId] = [...currentHistory, message];
        });
      },
      
      // 获取特定聊天的历史记录
      getChatHistory: (chatId) => {
        const state = get();
        return state.chatHistoryCache[chatId] || [];
      },
      
      // 注册响应处理器
      registerHandlers: (chatId, handlers) => {
        set(state => {
          state.responseHandlers[chatId] = handlers;
        });
        
        return () => {
          set(state => {
            delete state.responseHandlers[chatId];
          });
        };
      },
      
      // 取消处理
      cancelProcessing: (chatId, messageId) => {
        set(state => {
          const processingItem = state.processingItems[chatId];
          
          // 如果当前正在处理该消息，则取消处理
          if (processingItem && processingItem.messageId === messageId) {
            processingItem.abortController?.abort();
            processingItem.status = 'error';
            processingItem.errorMessage = '已取消';
            processingItem.updatedAt = Date.now();
            state.processingItems[chatId] = null;
          }
          
          // 如果队列中存在该消息，则更新状态
          const chatQueue = state.queueItems[chatId] || [];
          const itemIndex = chatQueue.findIndex(item => item.messageId === messageId);
          
          if (itemIndex >= 0) {
            chatQueue[itemIndex].status = 'error';
            chatQueue[itemIndex].errorMessage = '已取消';
            chatQueue[itemIndex].updatedAt = Date.now();
          }
        });
      },
      
      /**
       * 开始处理队列项
       * 
       * 此方法负责将一个队列项从等待队列移动到活跃处理状态：
       * 1. 在queueItems[chatId]中找到指定messageId的队列项
       * 2. 将其状态更新为'processing'并从queueItems中移除
       * 3. 将该项设置为processingItems[chatId]，标记为当前正在处理的项
       * 4. 触发已注册的onStart回调，通知UI层开始处理
       * 
       * 这确保了每个聊天同一时间只有一个项目被处理，实现了顺序处理的机制
       * 
       * @param chatId 聊天ID
       * @param messageId 消息ID
       */
      startProcessing: (chatId, messageId) => {
        set(state => {
          const chatQueue = state.queueItems[chatId] || [];
          const itemIndex = chatQueue.findIndex(item => item.messageId === messageId);
          
          if (itemIndex >= 0) {
            const item = chatQueue[itemIndex];
            
            // 更新状态为处理中
            item.status = 'processing';
            item.updatedAt = Date.now();
            
            // 从队列中移除
            chatQueue.splice(itemIndex, 1);
            
            // 设置为当前处理项
            state.processingItems[chatId] = item;
            
            // 调用处理器的开始回调
            const handlers = state.responseHandlers[chatId];
            if (handlers?.onStart) {
              handlers.onStart(messageId, item.aiMember);
            }
          }
        });
      },
      
      /**
       * 处理内容更新
       * 
       * 该方法处理AI回复的流式内容更新：
       * 1. 检查processingItems[chatId]是否存在并且messageId匹配
       * 2. 如果匹配，则调用该聊天注册的onContent回调
       * 
       * 使用processingItems进行验证确保只有当前正在处理的消息才能触发内容更新，
       * 避免了已完成或已取消的处理继续影响UI
       * 
       * @param chatId 聊天ID
       * @param messageId 消息ID
       * @param content 更新的内容
       */
      handleContent: (chatId, messageId, content) => {
        set(state => {
          const processingItem = state.processingItems[chatId];
          
          // 只有当当前正在处理该消息时才触发回调
          if (processingItem && processingItem.messageId === messageId) {
            // 调用处理器的内容更新回调
            const handlers = state.responseHandlers[chatId];
            if (handlers?.onContent) {
              handlers.onContent(messageId, content, processingItem.aiMember);
            }
          }
        });
      },
      
      /**
       * 完成处理队列项
       * 
       * 该方法处理AI回复完成的流程：
       * 1. 验证processingItems[chatId]存在且messageId匹配
       * 2. 将队列项状态更新为'completed'
       * 3. 触发已注册的onComplete回调，通知UI层更新最终内容
       * 4. 将回复添加到chatHistoryCache以供后续AI生成使用
       * 5. 将processingItems[chatId]设置为null，表示该聊天可以开始处理下一个队列项
       * 
       * 处理完成后清空processingItems对应项是关键步骤，它允许队列系统继续处理下一个项目
       * 
       * @param chatId 聊天ID
       * @param messageId 消息ID 
       * @param content 完整的回复内容
       */
      completeProcessing: (chatId, messageId, content) => {
        set(state => {
          const processingItem = state.processingItems[chatId];
          
          if (processingItem && processingItem.messageId === messageId) {
            // 更新状态为完成
            processingItem.status = 'completed';
            processingItem.updatedAt = Date.now();
            
            // 调用处理器的完成回调
            const handlers = state.responseHandlers[chatId];
            if (handlers?.onComplete) {
              handlers.onComplete(messageId, content, processingItem.aiMember);
            }
            
            // 将回复添加到历史记录
            const currentHistory = state.chatHistoryCache[chatId] || [];
            state.chatHistoryCache[chatId] = [...currentHistory, {
              role: 'assistant',
              content: content
            }];
            
            // 清除当前处理项
            state.processingItems[chatId] = null;
          }
        });
      },
      
      // 处理队列项出错
      errorProcessing: (chatId, messageId, error) => {
        set(state => {
          const processingItem = state.processingItems[chatId];
          
          if (processingItem && processingItem.messageId === messageId) {
            // 更新状态为错误
            processingItem.status = 'error';
            processingItem.errorMessage = error.message;
            processingItem.updatedAt = Date.now();
            
            // 调用处理器的错误回调
            const handlers = state.responseHandlers[chatId];
            if (handlers?.onError) {
              handlers.onError(messageId, error, processingItem.aiMember);
            }
            
            // 清除当前处理项
            state.processingItems[chatId] = null;
          }
        });
      }
    }))
  )
); 