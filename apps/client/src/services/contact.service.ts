/**
 * 联系人服务 - 提供与联系人相关的操作方法
 * 使用 Tauri 的 invoke 调用后端 API
 */

import { invoke } from '@tauri-apps/api/core';
import {
  Contact,
  ContactGroup,
  ContactWithGroup,
  CreateContactRequest,
  CreateAIContactRequest,
  UpdateContactRequest,
} from '../types';

class ContactService {
  /**
   * 获取所有联系人
   * @returns 联系人列表
   */
  async getAllContacts(): Promise<Contact[]> {
    return await invoke<Contact[]>('get_all_contacts');
  }

  /**
   * 根据ID获取联系人
   * @param id 联系人ID
   * @returns 联系人信息
   */
  async getContactById(id: string): Promise<Contact> {
    return await invoke<Contact>('get_contact_by_id', { id });
  }

  /**
   * 根据拥有者ID获取联系人
   * @param ownerId 拥有者ID
   * @returns 联系人列表
   */
  async getContactsByOwnerId(ownerId: string): Promise<Contact[]> {
    return await invoke<Contact[]>('get_contacts_by_user_id', { userId: ownerId });
  }

  /**
   * 根据分组ID获取联系人
   * @param groupId 分组ID
   * @returns 联系人列表
   */
  async getContactsByGroupId(groupId: string): Promise<Contact[]> {
    return await invoke<Contact[]>('get_contacts_by_group_id', { groupId });
  }

  /**
   * 根据用户链接ID获取联系人
   * @param userLinkId 用户链接ID
   * @returns 联系人列表
   */
  async getContactsByUserLinkId(userLinkId: string): Promise<Contact[]> {
    return await invoke<Contact[]>('get_contacts_by_contact_user_id', {
      contactUserId: userLinkId,
    });
  }

  /**
   * 创建联系人
   * @param request 创建联系人请求
   * @returns 创建的联系人信息
   */
  async createContact(request: CreateContactRequest): Promise<Contact> {
    return await invoke<Contact>('create_contact', { request });
  }

  /**
   * 创建AI联系人（原子操作）
   *
   * 这个方法执行以下步骤：
   * 1. 创建Agent
   * 2. 创建AI用户
   * 3. 更新Agent关联到AI用户
   * 4. 创建联系人用户链接
   * 5. 创建联系人
   *
   * @param request 创建AI联系人请求
   * @returns 创建的联系人信息
   */
  async createAIContact(request: CreateAIContactRequest): Promise<Contact> {
    return await invoke<Contact>('create_ai_contact', { request });
  }

  /**
   * 更新联系人
   * @param request 更新联系人请求
   * @returns 更新后的联系人信息
   */
  async updateContact(request: UpdateContactRequest): Promise<Contact> {
    return await invoke<Contact>('update_contact', { request });
  }

  /**
   * 删除联系人及其相关数据
   * @param id 联系人ID
   * @param userId 当前用户ID
   * @returns 操作结果
   */
  async deleteContact(id: string, userId: string): Promise<boolean> {
    return await invoke<boolean>('delete_contact', { id, userId });
  }

  /**
   * 获取所有联系人及其分组信息
   * @returns 联系人及分组信息列表
   */
  async getAllContactsWithGroup(): Promise<ContactWithGroup[]> {
    return await invoke<ContactWithGroup[]>('get_all_contacts_with_group');
  }

  /**
   * 根据ID获取联系人及其分组信息
   * @param id 联系人ID
   * @returns 联系人及分组信息
   */
  async getContactByIdWithGroup(id: string): Promise<ContactWithGroup> {
    return await invoke<ContactWithGroup>('get_contact_by_id_with_group', { id });
  }

  /**
   * 根据拥有者ID获取联系人及其分组信息
   * @param ownerId 拥有者ID
   * @returns 联系人及分组信息列表
   */
  async getContactsByOwnerIdWithGroup(ownerId: string): Promise<ContactWithGroup[]> {
    return await invoke<ContactWithGroup[]>('get_contacts_by_user_id_with_group', {
      userId: ownerId,
    });
  }

  /**
   * 根据分组ID获取联系人及其分组信息
   * @param groupId 分组ID
   * @returns 联系人及分组信息列表
   */
  async getContactsByGroupIdWithGroup(groupId: string): Promise<ContactWithGroup[]> {
    return await invoke<ContactWithGroup[]>('get_contacts_by_group_id_with_group', { groupId });
  }
}

// 导出单例实例
export const contactService = new ContactService();
