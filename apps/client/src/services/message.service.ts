/**
 * 消息服务 - 提供与消息和会话相关的操作方法
 * 使用 Tauri 的 invoke 调用后端 API
 */

import { invoke } from '@tauri-apps/api/core';
import {
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequestV2 as SendMessageRequest,
  UpdateMessageStatusRequestV2 as UpdateMessageStatusRequest,
} from '../types';

class MessageService {
  /**
   * 创建会话
   * @param request 创建会话请求
   * @returns 创建的会话信息
   */
  async createConversation(request: CreateConversationRequest): Promise<Conversation> {
    return await invoke<Conversation>('create_conversation', { request });
  }

  /**
   * 获取聊天的所有会话
   * @param chatId 聊天ID
   * @returns 会话列表
   */
  async getConversationsByChatId(chatId: string): Promise<Conversation[]> {
    return await invoke<Conversation[]>('get_conversations_by_chat_id', { chatId });
  }

  /**
   * 获取会话详情
   * @param id 会话ID
   * @returns 会话信息
   */
  async getConversationById(id: string): Promise<Conversation> {
    return await invoke<Conversation>('get_conversation_by_id', { id });
  }

  /**
   * 删除会话
   * @param id 会话ID
   * @returns 操作结果
   */
  async deleteConversation(id: string): Promise<boolean> {
    return await invoke<boolean>('delete_conversation', { id });
  }

  /**
   * 发送消息
   * @param request 发送消息请求
   * @returns 发送的消息信息
   */
  async sendMessage(request: SendMessageRequest): Promise<Message> {
    return await invoke<Message>('send_message', { request });
  }

  /**
   * 获取会话的所有消息
   * @param conversationId 会话ID
   * @returns 消息列表
   */
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return await invoke<Message[]>('get_messages_by_conversation_id', { conversationId });
  }

  /**
   * 获取消息详情
   * @param id 消息ID
   * @returns 消息信息
   */
  async getMessageById(id: string): Promise<Message> {
    return await invoke<Message>('get_message_by_id', { id });
  }

  /**
   * 更新消息状态
   * @param request 更新消息状态请求
   * @returns 更新后的消息信息
   */
  async updateMessageStatus(request: UpdateMessageStatusRequest): Promise<Message> {
    return await invoke<Message>('update_message_status', { request });
  }

  /**
   * 删除消息
   * @param id 消息ID
   * @returns 操作结果
   */
  async deleteMessage(id: string): Promise<boolean> {
    return await invoke<boolean>('delete_message', { id });
  }
}

// 导出单例实例
export const messageService = new MessageService();
