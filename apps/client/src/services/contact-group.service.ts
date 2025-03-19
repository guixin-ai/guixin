/**
 * 联系人分组服务 - 提供与联系人分组相关的操作方法
 * 使用 Tauri 的 invoke 调用后端 API
 */

import { invoke } from '@tauri-apps/api/core';
import { ContactGroup, CreateContactGroupRequest } from '../types';

class ContactGroupService {
  /**
   * 获取所有联系人分组
   * @returns 联系人分组列表
   */
  async getAllContactGroups(): Promise<ContactGroup[]> {
    return await invoke<ContactGroup[]>('get_all_contact_groups');
  }

  /**
   * 创建联系人分组
   * @param request 创建分组请求
   * @returns 创建的分组信息
   */
  async createContactGroup(request: CreateContactGroupRequest): Promise<ContactGroup> {
    return await invoke<ContactGroup>('create_contact_group', { request });
  }
}

// 导出单例实例
export const contactGroupService = new ContactGroupService();
