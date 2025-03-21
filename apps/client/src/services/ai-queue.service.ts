/**
 * AI队列服务 - 提供全局AI回复消息队列管理
 * 用于在页面切换时保持AI消息队列的执行
 */

import EventEmitter from 'eventemitter3';
import { ollamaService, OllamaChatResponse, OllamaMessage, ChatStreamOptions } from './ollama.service';
import {
  OllamaBaseError,
  OllamaConnectionError,
  OllamaStreamAbortedError,
  OllamaServiceUnavailableError,
  OllamaModelNotFoundError,
  OllamaModelLoadError,
} from '@/errors/ollama.errors';

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
}

// AI响应处理器接口
export interface AIResponseHandlers {
  onStart?: (messageId: string, aiMember: AIMember) => void;
  onContent?: (messageId: string, content: string, aiMember: AIMember) => void;
  onComplete?: (messageId: string, fullContent: string, aiMember: AIMember) => void;
  onError?: (messageId: string, error: Error, aiMember: AIMember) => void;
}

// AI队列服务事件类型
export enum AIQueueEvents {
  QUEUE_CHANGED = 'queue_changed',
  PROCESSING_STARTED = 'processing_started',
  PROCESSING_COMPLETED = 'processing_completed',
  PROCESSING_ERROR = 'processing_error',
  QUEUE_CLEARED = 'queue_cleared',
}

export class AIQueueService extends EventEmitter {
  private queue: AIQueueItem[] = [];
  private isProcessing: boolean = false;
  private currentItem: AIQueueItem | null = null;
  private responseHandlers: Map<string, AIResponseHandlers> = new Map();
  private DEFAULT_MODEL = 'gemma3:1b';
  
  // 消息历史缓存，按聊天ID存储
  private chatHistoryCache: Map<string, OllamaMessage[]> = new Map();

  constructor() {
    super();
  }

  /**
   * 注册响应处理器
   * @param chatId 聊天ID
   * @param handlers 响应处理器
   */
  registerHandlers(chatId: string, handlers: AIResponseHandlers) {
    this.responseHandlers.set(chatId, handlers);
    return () => this.responseHandlers.delete(chatId);
  }

  /**
   * 获取响应处理器
   * @param chatId 聊天ID
   */
  private getHandlers(chatId: string): AIResponseHandlers {
    return this.responseHandlers.get(chatId) || {};
  }

  /**
   * 添加AI项到队列，不包含历史消息，也不立即处理
   * @param item AI队列项
   */
  addToQueue(item: Omit<AIQueueItem, 'abortController'>): string {
    const queueItem: AIQueueItem = {
      ...item,
      abortController: new AbortController(),
    };
    
    this.queue.push(queueItem);
    this.emit(AIQueueEvents.QUEUE_CHANGED, this.getQueueStatus());
    
    return item.messageId;
  }

  /**
   * 更新特定聊天的历史记录
   * @param chatId 聊天ID
   * @param messages 消息历史
   */
  updateChatHistory(chatId: string, messages: OllamaMessage[]): void {
    this.chatHistoryCache.set(chatId, [...messages]);
  }
  
  /**
   * 添加单条消息到历史记录
   * @param chatId 聊天ID
   * @param message 单条消息
   */
  addMessageToHistory(chatId: string, message: OllamaMessage): void {
    const currentHistory = this.chatHistoryCache.get(chatId) || [];
    this.chatHistoryCache.set(chatId, [...currentHistory, message]);
  }
  
  /**
   * 获取特定聊天的历史记录
   * @param chatId 聊天ID
   */
  getChatHistory(chatId: string): OllamaMessage[] {
    return this.chatHistoryCache.get(chatId) || [];
  }
  
  /**
   * 启动队列处理
   * 需要在设置好初始历史消息后调用
   */
  startProcessing(): void {
    if (!this.isProcessing && this.queue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * 取消特定聊天中的所有AI响应
   * @param chatId 聊天ID
   */
  cancelChat(chatId: string): void {
    // 取消当前处理中的项目（如果属于该聊天）
    if (this.currentItem && this.currentItem.chatId === chatId) {
      this.currentItem.abortController?.abort();
    }
    
    // 从队列中移除该聊天的所有项目
    this.queue = this.queue.filter(item => item.chatId !== chatId);
    this.emit(AIQueueEvents.QUEUE_CHANGED, this.getQueueStatus());
  }

  /**
   * 取消所有AI响应
   */
  cancelAll(): void {
    // 取消当前处理中的项目
    if (this.currentItem && this.currentItem.abortController) {
      this.currentItem.abortController.abort();
    }
    
    // 清空队列
    this.queue = [];
    this.isProcessing = false;
    this.currentItem = null;
    this.emit(AIQueueEvents.QUEUE_CLEARED);
  }

  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      currentItem: this.currentItem ? {
        chatId: this.currentItem.chatId,
        messageId: this.currentItem.messageId,
        aiMember: {
          id: this.currentItem.aiMember.id,
          name: this.currentItem.aiMember.name,
        }
      } : null
    };
  }

  /**
   * 处理队列
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    this.currentItem = this.queue.shift()!;
    this.emit(AIQueueEvents.QUEUE_CHANGED, this.getQueueStatus());
    this.emit(AIQueueEvents.PROCESSING_STARTED, {
      chatId: this.currentItem.chatId,
      messageId: this.currentItem.messageId,
      aiMember: this.currentItem.aiMember,
    });
    
    const { chatId, messageId, aiMember, modelName, options, abortController } = this.currentItem;
    const handlers = this.getHandlers(chatId);
    
    // 获取最新的历史消息
    const messages = this.getChatHistory(chatId);
    
    try {
      // 通知开始生成
      handlers.onStart?.(messageId, aiMember);
      
      // 收集AI回复内容
      let fullContent = '';
      
      // 准备系统提示词（如果有）
      const systemMessages: OllamaMessage[] = [];
      if (aiMember.description) {
        systemMessages.push({
          role: 'system',
          content: aiMember.description
        });
      }
      
      // 合并系统消息和聊天历史
      const allMessages = [...systemMessages, ...messages];
      
      // 使用 Ollama 服务生成回复
      await ollamaService.chatStream(
        {
          model: modelName || this.DEFAULT_MODEL,
          messages: allMessages,
          stream: true,
          options: options || {
            temperature: 0.7,
            top_p: 0.9,
          },
        },
        { signal: abortController?.signal },
        (chunk: OllamaChatResponse) => {
          // 处理每个响应块
          if (chunk.message?.content && typeof chunk.message.content === 'string') {
            // 更新内容
            const contentChunk = chunk.message.content;
            fullContent += contentChunk;
            
            // 通知内容更新，传递完整内容而不是仅传递增量块
            handlers.onContent?.(messageId, fullContent, aiMember);
          }
        },
        (fullResponse: OllamaMessage) => {
          // 完成时处理
          const finalContent = fullResponse.content as string;
          
          // 通知完成
          handlers.onComplete?.(messageId, finalContent, aiMember);
          
          // 将回复添加到历史记录
          this.addMessageToHistory(chatId, {
            role: 'assistant',
            content: finalContent
          });
          
          // 处理完成，继续下一个
          this.completeCurrentItem();
        }
      );
    } catch (error: any) {
      let errorMessage = '抱歉，我暂时无法回答您的问题。';
      
      if (error instanceof OllamaStreamAbortedError) {
        errorMessage = '(已中断)';
      } else if (error instanceof OllamaModelNotFoundError) {
        errorMessage = `抱歉，所需的模型 ${error.modelName} 不存在。请确保该模型已安装。`;
      } else if (error instanceof OllamaModelLoadError) {
        errorMessage = `抱歉，模型 ${error.modelName} 加载失败。请检查模型是否损坏或重新安装。`;
      } else if (error instanceof OllamaServiceUnavailableError) {
        errorMessage = '抱歉，Ollama服务不可用。请确保Ollama服务已启动并正常运行。';
      } else if (error instanceof OllamaConnectionError) {
        errorMessage = '抱歉，连接到Ollama服务失败。请检查网络连接和服务状态。';
      } else if (error instanceof OllamaBaseError) {
        errorMessage = `抱歉，Ollama服务出现错误: ${error.message}`;
      } else {
        console.error('调用Ollama服务失败:', error);
        errorMessage = '抱歉，处理您的请求时发生了错误。';
      }
      
      // 通知错误
      handlers.onError?.(messageId, new Error(errorMessage), aiMember);
      
      // 处理错误，继续下一个
      this.emit(AIQueueEvents.PROCESSING_ERROR, {
        chatId: this.currentItem.chatId,
        messageId: this.currentItem.messageId,
        error: error,
      });
      
      this.completeCurrentItem();
    }
  }

  /**
   * 完成当前项目并处理下一个
   */
  private completeCurrentItem() {
    // 完成当前项目
    this.emit(AIQueueEvents.PROCESSING_COMPLETED, {
      chatId: this.currentItem?.chatId,
      messageId: this.currentItem?.messageId,
    });
    
    // 重置当前状态
    this.isProcessing = false;
    this.currentItem = null;
    this.emit(AIQueueEvents.QUEUE_CHANGED, this.getQueueStatus());
    
    // 处理下一个队列项
    if (this.queue.length > 0) {
      setTimeout(() => {
        this.processQueue();
      }, 500); // 短暂延迟，给UI更新时间
    }
  }
} 