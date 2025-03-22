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
  
  // 当前处理中的队列项，按聊天ID索引
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
  
  // 开始处理队列项
  startProcessing: (chatId: string, messageId: string) => void;
  
  // 完成处理队列项
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
      
      // 开始处理队列项
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
      
      // 完成处理队列项
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