/**
 * AI处理器服务 - 无状态AI回复消费服务
 * 提供与Ollama服务交互的方法，不维护队列状态
 */

import { OllamaMessage, OllamaChatResponse, ollamaService } from './ollama.service';
import { AIMember } from '@/models/ai-queue.model';
import {
  OllamaBaseError,
  OllamaConnectionError,
  OllamaStreamAbortedError,
  OllamaServiceUnavailableError,
  OllamaModelNotFoundError,
  OllamaModelLoadError,
} from '@/errors/ollama.errors';

// AI处理选项
export interface AIProcessOptions {
  temperature?: number;
  top_p?: number;
  [key: string]: any;
}

// 处理回调
export interface AIProcessCallbacks {
  onStart?: (chatId: string, messageId: string) => void;
  onContent?: (chatId: string, messageId: string, content: string) => void;
  onComplete?: (chatId: string, messageId: string, content: string) => void;
  onError?: (chatId: string, messageId: string, error: Error) => void;
}

/**
 * AI处理器服务
 * 提供无状态的AI回复处理功能
 */
class AIProcessorService {
  private DEFAULT_MODEL = 'gemma3:1b';
  
  constructor() {}
  
  /**
   * 处理单个AI消息请求
   * @param chatId 聊天ID
   * @param messageId 消息ID
   * @param aiMember AI成员信息
   * @param modelName 模型名称
   * @param messages 消息历史
   * @param options 选项
   * @param callbacks 回调函数
   * @param abortController 中止控制器
   * @returns 处理结果，成功返回内容字符串，失败返回空字符串
   */
  async process({
    chatId,
    messageId,
    aiMember,
    modelName,
    messages,
    options,
    callbacks,
    abortController
  }: {
    chatId: string;
    messageId: string;
    aiMember: AIMember;
    modelName: string;
    messages: OllamaMessage[];
    options?: AIProcessOptions;
    callbacks?: AIProcessCallbacks;
    abortController?: AbortController;
  }): Promise<string> {
    try {
      // 通知开始处理
      callbacks?.onStart?.(chatId, messageId);
      
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
      
      // 收集AI回复内容
      let fullContent = '';
      
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
            // 更新完整内容
            fullContent += chunk.message.content;
            
            // 通知内容更新
            callbacks?.onContent?.(chatId, messageId, fullContent);
          }
        },
        (fullResponse: OllamaMessage) => {
          // 完成时处理
          const finalContent = fullResponse.content as string;
          
          // 通知完成
          callbacks?.onComplete?.(chatId, messageId, finalContent);
        },
        (error: Error) => {
          // 使用 ollama 服务的错误回调
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
          callbacks?.onError?.(chatId, messageId, new Error(errorMessage));
        }
      );
      
      return fullContent;
    } catch (error: any) {
      // 处理其他未捕获的错误
      console.error('处理AI消息时发生未捕获的错误:', error);
      const errorMessage = '抱歉，处理您的请求时发生了未预期的错误。';
      
      // 通知错误
      callbacks?.onError?.(chatId, messageId, new Error(errorMessage));
      
      // 返回空字符串表示处理失败
      return '';
    }
  }
}

// 导出单例实例
export const aiProcessor = new AIProcessorService(); 