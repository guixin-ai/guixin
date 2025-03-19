/**
 * 聊天服务 - 提供与聊天相关的操作方法
 * 使用 Tauri 的 invoke 调用后端 API
 */

import { invoke } from '@tauri-apps/api/core';
import {
  Chat,
  ChatWithDetails,
  ChatParticipant,
  CreateChatRequest,
  UpdateChatRequest,
  AddParticipantRequest,
  CreateIndividualChatRequest,
  MarkAsReadRequest,
  ResetUnreadCountRequest,
  Message,
  MessageReceipt,
  MessageWithDetails,
  GetChatMessagesRequest,
  GetUserChatsRequest,
  SendMessageRequest,
  UpdateMessageStatusRequest,
  Attachment,
} from '../types';

class ChatService {
  /**
   * 创建聊天
   * @param request 创建聊天请求
   * @returns 创建的聊天信息
   */
  async createChat(request: CreateChatRequest): Promise<Chat> {
    return await invoke<Chat>('create_chat', { request });
  }

  /**
   * 获取所有聊天
   * @returns 聊天列表
   */
  async getAllChats(): Promise<Chat[]> {
    return await invoke<Chat[]>('get_all_chats');
  }

  /**
   * 根据ID获取聊天
   * @param id 聊天ID
   * @returns 聊天信息
   */
  async getChatById(id: string): Promise<Chat> {
    return await invoke<Chat>('get_chat_by_id', { id });
  }

  /**
   * 根据类型获取聊天
   * @param chatType 聊天类型
   * @returns 聊天列表
   */
  async getChatsByType(chatType: string): Promise<Chat[]> {
    return await invoke<Chat[]>('get_chats_by_type', { chatType });
  }

  /**
   * 根据用户ID获取聊天
   * @param userId 用户ID
   * @returns 聊天列表
   */
  async getChatsByUserId(userId: string): Promise<Chat[]> {
    return await invoke<Chat[]>('get_chats_by_user_id', { userId });
  }

  /**
   * 根据用户ID获取带有详细信息的聊天列表
   * @param userId 用户ID
   * @returns 带有详细信息的聊天列表
   */
  async getChatsWithDetailsByUserId(userId: string): Promise<ChatWithDetails[]> {
    return await invoke<ChatWithDetails[]>('get_chats_with_details_by_user_id', { userId });
  }

  /**
   * 更新聊天
   * @param request 更新聊天请求
   * @returns 更新后的聊天信息
   */
  async updateChat(request: UpdateChatRequest): Promise<Chat> {
    return await invoke<Chat>('update_chat', { request });
  }

  /**
   * 删除聊天
   * @param id 聊天ID
   * @returns 操作结果
   */
  async deleteChat(id: string): Promise<boolean> {
    return await invoke<boolean>('delete_chat', { id });
  }

  /**
   * 添加聊天参与者
   * @param request 添加参与者请求
   * @returns 添加的参与者信息
   */
  async addChatParticipant(request: AddParticipantRequest): Promise<ChatParticipant> {
    return await invoke<ChatParticipant>('add_chat_participant', { request });
  }

  /**
   * 获取聊天参与者
   * @param chatId 聊天ID
   * @returns 参与者列表
   */
  async getChatParticipants(chatId: string): Promise<ChatParticipant[]> {
    return await invoke<ChatParticipant[]>('get_chat_participants', { chatId });
  }

  /**
   * 移除聊天参与者
   * @param chatId 聊天ID
   * @param userId 用户ID
   * @returns 操作结果
   */
  async removeChatParticipant(chatId: string, userId: string): Promise<boolean> {
    return await invoke<boolean>('remove_chat_participant', { chatId, userId });
  }

  /**
   * 标记消息为已读
   * @param request 标记已读请求
   * @returns 更新后的参与者信息
   */
  async markMessageAsRead(request: MarkAsReadRequest): Promise<ChatParticipant> {
    return await invoke<ChatParticipant>('mark_message_as_read', { request });
  }

  /**
   * 重置未读消息计数
   * @param request 重置未读计数请求
   * @returns 更新后的参与者信息
   */
  async resetUnreadCount(request: ResetUnreadCountRequest): Promise<ChatParticipant> {
    return await invoke<ChatParticipant>('reset_unread_count', { request });
  }

  /**
   * 创建单聊（一对一聊天）
   * @param request 创建单聊请求
   * @returns 创建的聊天信息
   */
  async createIndividualChat(request: CreateIndividualChatRequest): Promise<Chat> {
    return await invoke<Chat>('create_individual_chat', { request });
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
   * 更新消息状态
   * @param request 更新消息状态请求
   * @returns 更新后的消息接收记录
   */
  async updateMessageStatus(request: UpdateMessageStatusRequest): Promise<MessageReceipt> {
    return await invoke<MessageReceipt>('update_message_status', { request });
  }

  /**
   * 获取聊天消息列表
   * @param request 获取聊天消息请求
   * @returns 消息列表及详情
   */
  async getChatMessages(request: GetChatMessagesRequest): Promise<MessageWithDetails[]> {
    return await invoke<MessageWithDetails[]>('get_chat_messages', { request });
  }

  /**
   * 获取用户的聊天列表（优化版）
   * @param request 获取用户聊天列表请求
   * @returns 带有详细信息的聊天列表
   */
  async getUserChats(request: GetUserChatsRequest): Promise<ChatWithDetails[]> {
    return await invoke<ChatWithDetails[]>('get_user_chats', { request });
  }
}

// 导出单例实例
export const chatService = new ChatService();
