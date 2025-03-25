/**
 * AI回复队列模型 - 定义AI消息回复队列的数据结构和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import EventEmitter from 'eventemitter3';

// 定义消息接口
export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: number;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: Record<string, any>;
}

// 定义AI回复项接口
export interface AIReplyItem {
  id: string;
  messageId: string;  // 关联的原始消息ID
  conversationId: string;
  content: string;
  priority: number;  // 优先级，数字越小优先级越高
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  progress?: number;  // 0-100的进度值
  modelName: string;  // 使用的AI模型名称
  parameters?: Record<string, any>;  // 模型参数
  abortController?: AbortController;  // 用于取消请求
}

// AI回复处理器接口
export interface AIReplyHandlers {
  onQueued?: (replyItem: AIReplyItem) => void;
  onStart?: (replyItem: AIReplyItem) => void;
  onProgress?: (replyItem: AIReplyItem, progress: number) => void;
  onContent?: (replyItem: AIReplyItem, partialContent: string) => void;
  onComplete?: (replyItem: AIReplyItem, finalContent: string) => void;
  onFailed?: (replyItem: AIReplyItem, error: Error) => void;
  onCancelled?: (replyItem: AIReplyItem) => void;
}

// AI回复队列事件
export enum AIReplyQueueEvents {
  ITEM_ADDED = 'item_added',
  ITEM_STARTED = 'item_started',
  ITEM_PROGRESS = 'item_progress',
  ITEM_COMPLETED = 'item_completed',
  ITEM_FAILED = 'item_failed',
  ITEM_CANCELLED = 'item_cancelled',
  QUEUE_CHANGED = 'queue_changed',
  PROCESSING_ITEM_CHANGED = 'processing_item_changed',
}

// 队列统计信息
export interface QueueStats {
  totalItems: number;
  queuedItems: number;
  processingItems: number;
  completedItems: number;
  failedItems: number;
  cancelledItems: number;
  averageProcessingTime?: number;  // 毫秒
}

// AI回复队列状态接口
export interface AIReplyQueueState {
  // 队列项，所有待处理的回复项
  queueItems: AIReplyItem[];
  
  // 各会话正在处理的回复项
  processingItems: Record<string, AIReplyItem | null>;
  
  // 已完成的回复项（最近N个）
  completedItems: AIReplyItem[];
  
  // 失败的回复项（最近N个）
  failedItems: AIReplyItem[];
  
  // 事件发射器
  eventEmitter: EventEmitter;
  
  // 处理器映射
  handlers: Record<string, AIReplyHandlers>;
  
  // 队列配置
  config: {
    maxCompletedItems: number;  // 保留最近多少个已完成项
    maxFailedItems: number;     // 保留最近多少个失败项
    maxConcurrentProcessing: number;  // 最大同时处理数
    defaultPriority: number;    // 默认优先级
  };
  
  // 添加回复项到队列
  addToQueue: (item: Omit<AIReplyItem, 'id' | 'status' | 'createdAt' | 'abortController' | 'progress'>) => string;
  
  // 开始处理队列中下一个项
  processNextItem: () => void;
  
  // 处理特定回复项
  processItem: (itemId: string) => void;
  
  // 更新回复项内容
  updateItemContent: (itemId: string, content: string) => void;
  
  // 更新回复项进度
  updateItemProgress: (itemId: string, progress: number) => void;
  
  // 完成回复项
  completeItem: (itemId: string, finalContent: string) => void;
  
  // 标记回复项处理失败
  failItem: (itemId: string, error: Error | string) => void;
  
  // 取消回复项
  cancelItem: (itemId: string) => void;
  
  // 取消会话的所有回复项
  cancelConversationItems: (conversationId: string) => void;
  
  // 取消所有回复项
  cancelAllItems: () => void;
  
  // 获取队列统计信息
  getQueueStats: () => QueueStats;
  
  // 获取会话的回复项
  getConversationItems: (conversationId: string) => {
    queued: AIReplyItem[];
    processing: AIReplyItem | null;
    completed: AIReplyItem[];
    failed: AIReplyItem[];
  };
  
  // 注册事件监听器
  on: (event: AIReplyQueueEvents, listener: (...args: any[]) => void) => () => void;
  
  // 注册回复处理器
  registerHandlers: (handlerId: string, handlers: AIReplyHandlers) => () => void;
  
  // 优化队列（重排序等）
  optimizeQueue: () => void;
  
  // 清理历史数据
  cleanupHistory: () => void;
}

// 创建事件发射器实例
const eventEmitter = new EventEmitter();

// 创建AI回复队列状态存储
export const useAIReplyQueueStore = create(
  devtools(
    immer<AIReplyQueueState>((set, get) => ({
      // 初始状态
      queueItems: [],
      processingItems: {},
      completedItems: [],
      failedItems: [],
      eventEmitter,
      handlers: {},
      
      // 配置
      config: {
        maxCompletedItems: 100,
        maxFailedItems: 50,
        maxConcurrentProcessing: 3,
        defaultPriority: 10,
      },
      
      // 添加回复项到队列
      addToQueue: (item) => {
        const id = `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        set(state => {
          const newItem: AIReplyItem = {
            ...item,
            id,
            status: 'queued',
            createdAt: Date.now(),
            priority: item.priority ?? state.config.defaultPriority,
            progress: 0,
            abortController: new AbortController(),
          };
          
          // 添加到队列并按优先级排序
          state.queueItems.push(newItem);
          state.queueItems.sort((a, b) => a.priority - b.priority);
          
          // 触发事件
          state.eventEmitter.emit(AIReplyQueueEvents.ITEM_ADDED, newItem);
          state.eventEmitter.emit(AIReplyQueueEvents.QUEUE_CHANGED, state.queueItems);
          
          // 触发回调
          Object.values(state.handlers).forEach(handler => {
            handler.onQueued?.(newItem);
          });
        });
        
        // 尝试处理下一个项
        setTimeout(() => {
          get().processNextItem();
        }, 0);
        
        return id;
      },
      
      // 处理下一个队列项
      processNextItem: () => {
        const state = get();
        
        // 检查是否达到最大并发处理数
        const currentProcessingCount = Object.values(state.processingItems).filter(Boolean).length;
        if (currentProcessingCount >= state.config.maxConcurrentProcessing) {
          return;
        }
        
        // 找出每个会话中优先级最高的待处理项
        const conversationQueues: Record<string, AIReplyItem[]> = {};
        state.queueItems.forEach(item => {
          if (!conversationQueues[item.conversationId]) {
            conversationQueues[item.conversationId] = [];
          }
          conversationQueues[item.conversationId].push(item);
        });
        
        // 每个会话只处理一个项
        Object.entries(conversationQueues).forEach(([conversationId, items]) => {
          // 如果该会话已有处理中的项，跳过
          if (state.processingItems[conversationId]) {
            return;
          }
          
          // 按优先级排序
          items.sort((a, b) => a.priority - b.priority);
          
          // 取第一个（优先级最高的）
          const nextItem = items[0];
          if (nextItem) {
            state.processItem(nextItem.id);
          }
        });
      },
      
      // 处理特定回复项
      processItem: (itemId) => {
        set(state => {
          // 找到队列项
          const itemIndex = state.queueItems.findIndex(item => item.id === itemId);
          if (itemIndex === -1) return;
          
          const item = state.queueItems[itemIndex];
          const { conversationId } = item;
          
          // 如果该会话已有处理中的项，先不处理
          if (state.processingItems[conversationId]) return;
          
          // 从队列中移除
          state.queueItems.splice(itemIndex, 1);
          
          // 更新状态为处理中
          const updatedItem: AIReplyItem = {
            ...item,
            status: 'processing',
            startedAt: Date.now(),
          };
          
          // 设置为当前处理项
          state.processingItems[conversationId] = updatedItem;
          
          // 触发事件
          state.eventEmitter.emit(AIReplyQueueEvents.ITEM_STARTED, updatedItem);
          state.eventEmitter.emit(AIReplyQueueEvents.PROCESSING_ITEM_CHANGED, conversationId, updatedItem);
          state.eventEmitter.emit(AIReplyQueueEvents.QUEUE_CHANGED, state.queueItems);
          
          // 触发回调
          Object.values(state.handlers).forEach(handler => {
            handler.onStart?.(updatedItem);
          });
        });
      },
      
      // 更新回复项内容
      updateItemContent: (itemId, content) => {
        set(state => {
          // 查找处理中的项
          const conversationId = Object.entries(state.processingItems)
            .find(([_, item]) => item?.id === itemId)?.[0];
          
          if (!conversationId) return;
          
          const item = state.processingItems[conversationId];
          if (!item) return;
          
          // 更新内容
          item.content = content;
          
          // 触发回调
          Object.values(state.handlers).forEach(handler => {
            handler.onContent?.(item, content);
          });
        });
      },
      
      // 更新回复项进度
      updateItemProgress: (itemId, progress) => {
        set(state => {
          // 查找处理中的项
          const conversationId = Object.entries(state.processingItems)
            .find(([_, item]) => item?.id === itemId)?.[0];
          
          if (!conversationId) return;
          
          const item = state.processingItems[conversationId];
          if (!item) return;
          
          // 更新进度
          item.progress = progress;
          
          // 触发事件
          state.eventEmitter.emit(AIReplyQueueEvents.ITEM_PROGRESS, item, progress);
          
          // 触发回调
          Object.values(state.handlers).forEach(handler => {
            handler.onProgress?.(item, progress);
          });
        });
      },
      
      // 完成回复项
      completeItem: (itemId, finalContent) => {
        set(state => {
          // 查找处理中的项
          const conversationId = Object.entries(state.processingItems)
            .find(([_, item]) => item?.id === itemId)?.[0];
          
          if (!conversationId) return;
          
          const item = state.processingItems[conversationId];
          if (!item) return;
          
          // 更新状态
          const completedItem: AIReplyItem = {
            ...item,
            status: 'completed',
            content: finalContent,
            completedAt: Date.now(),
            progress: 100,
          };
          
          // 添加到已完成列表
          state.completedItems.unshift(completedItem);
          
          // 保持已完成列表在最大限制内
          if (state.completedItems.length > state.config.maxCompletedItems) {
            state.completedItems = state.completedItems.slice(0, state.config.maxCompletedItems);
          }
          
          // 清除处理中状态
          state.processingItems[conversationId] = null;
          
          // 触发事件
          state.eventEmitter.emit(AIReplyQueueEvents.ITEM_COMPLETED, completedItem);
          state.eventEmitter.emit(AIReplyQueueEvents.PROCESSING_ITEM_CHANGED, conversationId, null);
          
          // 触发回调
          Object.values(state.handlers).forEach(handler => {
            handler.onComplete?.(completedItem, finalContent);
          });
          
          // 尝试处理下一个项
          setTimeout(() => {
            get().processNextItem();
          }, 0);
        });
      },
      
      // 标记回复项失败
      failItem: (itemId, error) => {
        set(state => {
          // 查找处理中的项
          const conversationId = Object.entries(state.processingItems)
            .find(([_, item]) => item?.id === itemId)?.[0];
          
          if (!conversationId) {
            // 也可能是队列中的项
            const queueIndex = state.queueItems.findIndex(item => item.id === itemId);
            if (queueIndex !== -1) {
              const item = state.queueItems[queueIndex];
              
              // 从队列中移除
              state.queueItems.splice(queueIndex, 1);
              
              // 更新状态
              const failedItem: AIReplyItem = {
                ...item,
                status: 'failed',
                error: typeof error === 'string' ? error : error.message,
                completedAt: Date.now(),
              };
              
              // 添加到失败列表
              state.failedItems.unshift(failedItem);
              
              // 保持失败列表在最大限制内
              if (state.failedItems.length > state.config.maxFailedItems) {
                state.failedItems = state.failedItems.slice(0, state.config.maxFailedItems);
              }
              
              // 触发事件
              state.eventEmitter.emit(AIReplyQueueEvents.ITEM_FAILED, failedItem);
              state.eventEmitter.emit(AIReplyQueueEvents.QUEUE_CHANGED, state.queueItems);
              
              // 触发回调
              Object.values(state.handlers).forEach(handler => {
                handler.onFailed?.(failedItem, typeof error === 'string' ? new Error(error) : error);
              });
            }
            return;
          }
          
          const item = state.processingItems[conversationId];
          if (!item) return;
          
          // 更新状态
          const failedItem: AIReplyItem = {
            ...item,
            status: 'failed',
            error: typeof error === 'string' ? error : error.message,
            completedAt: Date.now(),
          };
          
          // 添加到失败列表
          state.failedItems.unshift(failedItem);
          
          // 保持失败列表在最大限制内
          if (state.failedItems.length > state.config.maxFailedItems) {
            state.failedItems = state.failedItems.slice(0, state.config.maxFailedItems);
          }
          
          // 清除处理中状态
          state.processingItems[conversationId] = null;
          
          // 触发事件
          state.eventEmitter.emit(AIReplyQueueEvents.ITEM_FAILED, failedItem);
          state.eventEmitter.emit(AIReplyQueueEvents.PROCESSING_ITEM_CHANGED, conversationId, null);
          
          // 触发回调
          Object.values(state.handlers).forEach(handler => {
            handler.onFailed?.(failedItem, typeof error === 'string' ? new Error(error) : error);
          });
          
          // 尝试处理下一个项
          setTimeout(() => {
            get().processNextItem();
          }, 0);
        });
      },
      
      // 取消回复项
      cancelItem: (itemId) => {
        set(state => {
          // 先查找队列中的项
          const queueIndex = state.queueItems.findIndex(item => item.id === itemId);
          if (queueIndex !== -1) {
            const item = state.queueItems[queueIndex];
            
            // 中止请求
            item.abortController?.abort();
            
            // 从队列中移除
            state.queueItems.splice(queueIndex, 1);
            
            // 更新状态
            const cancelledItem: AIReplyItem = {
              ...item,
              status: 'cancelled',
              completedAt: Date.now(),
            };
            
            // 触发事件
            state.eventEmitter.emit(AIReplyQueueEvents.ITEM_CANCELLED, cancelledItem);
            state.eventEmitter.emit(AIReplyQueueEvents.QUEUE_CHANGED, state.queueItems);
            
            // 触发回调
            Object.values(state.handlers).forEach(handler => {
              handler.onCancelled?.(cancelledItem);
            });
            
            return;
          }
          
          // 再查找处理中的项
          const conversationId = Object.entries(state.processingItems)
            .find(([_, item]) => item?.id === itemId)?.[0];
          
          if (!conversationId) return;
          
          const item = state.processingItems[conversationId];
          if (!item) return;
          
          // 中止请求
          item.abortController?.abort();
          
          // 更新状态
          const cancelledItem: AIReplyItem = {
            ...item,
            status: 'cancelled',
            completedAt: Date.now(),
          };
          
          // 清除处理中状态
          state.processingItems[conversationId] = null;
          
          // 触发事件
          state.eventEmitter.emit(AIReplyQueueEvents.ITEM_CANCELLED, cancelledItem);
          state.eventEmitter.emit(AIReplyQueueEvents.PROCESSING_ITEM_CHANGED, conversationId, null);
          
          // 触发回调
          Object.values(state.handlers).forEach(handler => {
            handler.onCancelled?.(cancelledItem);
          });
          
          // 尝试处理下一个项
          setTimeout(() => {
            get().processNextItem();
          }, 0);
        });
      },
      
      // 取消会话的所有回复项
      cancelConversationItems: (conversationId) => {
        set(state => {
          // 取消处理中的项
          const processingItem = state.processingItems[conversationId];
          if (processingItem) {
            processingItem.abortController?.abort();
            
            // 更新状态
            const cancelledItem: AIReplyItem = {
              ...processingItem,
              status: 'cancelled',
              completedAt: Date.now(),
            };
            
            // 清除处理中状态
            state.processingItems[conversationId] = null;
            
            // 触发事件
            state.eventEmitter.emit(AIReplyQueueEvents.ITEM_CANCELLED, cancelledItem);
            state.eventEmitter.emit(AIReplyQueueEvents.PROCESSING_ITEM_CHANGED, conversationId, null);
            
            // 触发回调
            Object.values(state.handlers).forEach(handler => {
              handler.onCancelled?.(cancelledItem);
            });
          }
          
          // 取消队列中的项
          const conversationItems = state.queueItems.filter(item => item.conversationId === conversationId);
          conversationItems.forEach(item => {
            item.abortController?.abort();
            
            // 触发事件
            state.eventEmitter.emit(AIReplyQueueEvents.ITEM_CANCELLED, {
              ...item,
              status: 'cancelled',
              completedAt: Date.now(),
            });
            
            // 触发回调
            Object.values(state.handlers).forEach(handler => {
              handler.onCancelled?.({
                ...item,
                status: 'cancelled',
                completedAt: Date.now(),
              });
            });
          });
          
          // 从队列中移除
          state.queueItems = state.queueItems.filter(item => item.conversationId !== conversationId);
          
          // 触发队列变化事件
          state.eventEmitter.emit(AIReplyQueueEvents.QUEUE_CHANGED, state.queueItems);
          
          // 尝试处理下一个项
          setTimeout(() => {
            get().processNextItem();
          }, 0);
        });
      },
      
      // 取消所有回复项
      cancelAllItems: () => {
        set(state => {
          // 取消所有处理中的项
          Object.entries(state.processingItems).forEach(([conversationId, item]) => {
            if (item) {
              item.abortController?.abort();
              
              // 触发事件
              state.eventEmitter.emit(AIReplyQueueEvents.ITEM_CANCELLED, {
                ...item,
                status: 'cancelled',
                completedAt: Date.now(),
              });
              
              // 触发回调
              Object.values(state.handlers).forEach(handler => {
                handler.onCancelled?.({
                  ...item,
                  status: 'cancelled',
                  completedAt: Date.now(),
                });
              });
              
              // 清除处理中状态
              state.processingItems[conversationId] = null;
              
              // 触发处理项变化事件
              state.eventEmitter.emit(AIReplyQueueEvents.PROCESSING_ITEM_CHANGED, conversationId, null);
            }
          });
          
          // 取消所有队列中的项
          state.queueItems.forEach(item => {
            item.abortController?.abort();
            
            // 触发事件
            state.eventEmitter.emit(AIReplyQueueEvents.ITEM_CANCELLED, {
              ...item,
              status: 'cancelled',
              completedAt: Date.now(),
            });
            
            // 触发回调
            Object.values(state.handlers).forEach(handler => {
              handler.onCancelled?.({
                ...item,
                status: 'cancelled',
                completedAt: Date.now(),
              });
            });
          });
          
          // 清空队列
          state.queueItems = [];
          
          // 触发队列变化事件
          state.eventEmitter.emit(AIReplyQueueEvents.QUEUE_CHANGED, state.queueItems);
        });
      },
      
      // 获取队列统计信息
      getQueueStats: () => {
        const state = get();
        
        const processingItems = Object.values(state.processingItems).filter(Boolean);
        const completedWithTime = state.completedItems.filter(item => item.startedAt && item.completedAt);
        
        // 计算平均处理时间
        let averageProcessingTime;
        if (completedWithTime.length > 0) {
          const totalTime = completedWithTime.reduce((sum, item) => {
            return sum + ((item.completedAt || 0) - (item.startedAt || 0));
          }, 0);
          averageProcessingTime = totalTime / completedWithTime.length;
        }
        
        return {
          totalItems: state.queueItems.length + processingItems.length,
          queuedItems: state.queueItems.length,
          processingItems: processingItems.length,
          completedItems: state.completedItems.length,
          failedItems: state.failedItems.length,
          cancelledItems: 0, // 没有单独存储已取消项，所以这里为0
          averageProcessingTime,
        };
      },
      
      // 获取会话的回复项
      getConversationItems: (conversationId) => {
        const state = get();
        
        return {
          queued: state.queueItems.filter(item => item.conversationId === conversationId),
          processing: state.processingItems[conversationId] || null,
          completed: state.completedItems.filter(item => item.conversationId === conversationId),
          failed: state.failedItems.filter(item => item.conversationId === conversationId),
        };
      },
      
      // 注册事件监听器
      on: (event, listener) => {
        const { eventEmitter } = get();
        eventEmitter.on(event, listener);
        
        // 返回取消订阅函数
        return () => {
          eventEmitter.off(event, listener);
        };
      },
      
      // 注册回复处理器
      registerHandlers: (handlerId, handlers) => {
        set(state => {
          state.handlers[handlerId] = handlers;
        });
        
        // 返回取消注册函数
        return () => {
          set(state => {
            delete state.handlers[handlerId];
          });
        };
      },
      
      // 优化队列
      optimizeQueue: () => {
        set(state => {
          // 按优先级排序
          state.queueItems.sort((a, b) => a.priority - b.priority);
          
          // 触发队列变化事件
          state.eventEmitter.emit(AIReplyQueueEvents.QUEUE_CHANGED, state.queueItems);
        });
      },
      
      // 清理历史数据
      cleanupHistory: () => {
        set(state => {
          // 保持已完成列表在最大限制内
          if (state.completedItems.length > state.config.maxCompletedItems) {
            state.completedItems = state.completedItems.slice(0, state.config.maxCompletedItems);
          }
          
          // 保持失败列表在最大限制内
          if (state.failedItems.length > state.config.maxFailedItems) {
            state.failedItems = state.failedItems.slice(0, state.config.maxFailedItems);
          }
        });
      },
    }))
  )
);

// 导出默认状态
export default useAIReplyQueueStore; 