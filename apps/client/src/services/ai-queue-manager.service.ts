/**
 * AI队列管理服务 - 管理多个聊天的AI回复队列
 * 确保每个聊天都有自己独立的队列，互不干扰
 */

import { AIQueueService, AIMember, AIResponseHandlers, AIQueueEvents } from './ai-queue.service';
import { OllamaMessage } from './ollama.service';
import EventEmitter from 'eventemitter3';

// 队列管理器事件类型
export enum AIQueueManagerEvents {
  QUEUE_CREATED = 'queue_created',
  QUEUE_REMOVED = 'queue_removed',
  ALL_QUEUES_CLEARED = 'all_queues_cleared',
}

/**
 * AI队列管理服务
 * 负责为每个聊天创建和管理独立的AI回复队列
 */
class AIQueueManagerService extends EventEmitter {
  // 存储每个聊天ID对应的队列实例
  private queues: Map<string, AIQueueService> = new Map();
  
  constructor() {
    super();
  }
  
  /**
   * 获取指定聊天的队列实例，如果不存在则创建
   * @param chatId 聊天ID
   */
  private getOrCreateQueue(chatId: string): AIQueueService {
    // 检查是否已有该聊天的队列
    if (!this.queues.has(chatId)) {
      // 创建新的队列实例
      const queue = new AIQueueService();
      this.queues.set(chatId, queue);
      
      // 转发该队列的事件
      this.setupQueueEventForwarding(chatId, queue);
      
      // 触发队列创建事件
      this.emit(AIQueueManagerEvents.QUEUE_CREATED, { chatId });
    }
    
    return this.queues.get(chatId)!;
  }
  
  /**
   * 设置队列事件转发
   * @param chatId 聊天ID
   * @param queue 队列实例
   */
  private setupQueueEventForwarding(chatId: string, queue: AIQueueService): void {
    // 转发队列状态变化事件
    queue.on(AIQueueEvents.QUEUE_CHANGED, (status) => {
      this.emit(`${chatId}:${AIQueueEvents.QUEUE_CHANGED}`, status);
    });
    
    // 转发处理开始事件
    queue.on(AIQueueEvents.PROCESSING_STARTED, (info) => {
      this.emit(`${chatId}:${AIQueueEvents.PROCESSING_STARTED}`, info);
    });
    
    // 转发处理完成事件
    queue.on(AIQueueEvents.PROCESSING_COMPLETED, (info) => {
      this.emit(`${chatId}:${AIQueueEvents.PROCESSING_COMPLETED}`, info);
    });
    
    // 转发处理错误事件
    queue.on(AIQueueEvents.PROCESSING_ERROR, (info) => {
      this.emit(`${chatId}:${AIQueueEvents.PROCESSING_ERROR}`, info);
    });
    
    // 转发队列清空事件
    queue.on(AIQueueEvents.QUEUE_CLEARED, () => {
      this.emit(`${chatId}:${AIQueueEvents.QUEUE_CLEARED}`);
    });
  }
  
  /**
   * 注册特定聊天的响应处理器
   * @param chatId 聊天ID
   * @param handlers 响应处理器
   */
  registerHandlers(chatId: string, handlers: AIResponseHandlers): () => void {
    const queue = this.getOrCreateQueue(chatId);
    return queue.registerHandlers(chatId, handlers);
  }
  
  /**
   * 更新特定聊天的历史记录
   * @param chatId 聊天ID
   * @param messages 消息历史
   */
  updateChatHistory(chatId: string, messages: OllamaMessage[]): void {
    const queue = this.getOrCreateQueue(chatId);
    queue.updateChatHistory(chatId, messages);
  }
  
  /**
   * 添加单条消息到历史记录
   * @param chatId 聊天ID
   * @param message 单条消息
   */
  addMessageToHistory(chatId: string, message: OllamaMessage): void {
    const queue = this.getOrCreateQueue(chatId);
    queue.addMessageToHistory(chatId, message);
  }
  
  /**
   * 获取特定聊天的历史记录
   * @param chatId 聊天ID
   */
  getChatHistory(chatId: string): OllamaMessage[] {
    const queue = this.getOrCreateQueue(chatId);
    return queue.getChatHistory(chatId);
  }
  
  /**
   * 添加AI项到队列
   * @param chatId 聊天ID
   * @param messageId 消息ID
   * @param aiMember AI成员信息
   * @param modelName 模型名称
   * @param options 选项
   */
  addToQueue({
    chatId,
    messageId,
    aiMember,
    modelName,
    options
  }: {
    chatId: string;
    messageId: string;
    aiMember: AIMember;
    modelName: string;
    options?: {
      temperature?: number;
      top_p?: number;
      [key: string]: any;
    };
  }): string {
    const queue = this.getOrCreateQueue(chatId);
    return queue.addToQueue({
      chatId,
      messageId,
      aiMember,
      modelName,
      options
    });
  }
  
  /**
   * 启动特定聊天的队列处理
   * @param chatId 聊天ID
   */
  startProcessing(chatId: string): void {
    const queue = this.getOrCreateQueue(chatId);
    queue.startProcessing();
  }
  
  /**
   * 取消特定聊天中的所有AI响应
   * @param chatId 聊天ID
   */
  cancelChat(chatId: string): void {
    const queue = this.queues.get(chatId);
    if (queue) {
      queue.cancelChat(chatId);
    }
  }
  
  /**
   * 移除特定聊天的队列实例
   * @param chatId 聊天ID
   */
  removeQueue(chatId: string): void {
    const queue = this.queues.get(chatId);
    if (queue) {
      queue.cancelAll();
      this.queues.delete(chatId);
      this.emit(AIQueueManagerEvents.QUEUE_REMOVED, { chatId });
    }
  }
  
  /**
   * 取消所有聊天的所有AI响应，并清空所有队列
   */
  clearAllQueues(): void {
    // 取消所有队列中的所有任务
    for (const queue of this.queues.values()) {
      queue.cancelAll();
    }
    
    // 清空队列映射
    this.queues.clear();
    
    // 触发所有队列清空事件
    this.emit(AIQueueManagerEvents.ALL_QUEUES_CLEARED);
  }
  
  /**
   * 获取队列状态信息
   */
  getQueuesStatus(): any {
    const status: any = {};
    
    for (const [chatId, queue] of this.queues.entries()) {
      status[chatId] = queue.getQueueStatus();
    }
    
    return status;
  }
}

// 导出单例实例
export const aiQueueManager = new AIQueueManagerService(); 