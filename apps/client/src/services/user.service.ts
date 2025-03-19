/**
 * 用户服务 - 提供与用户相关的操作方法
 * 使用 Tauri 的 invoke 调用后端 API
 */

import { invoke } from '@tauri-apps/api/core';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';

class UserService {
  /**
   * 获取当前用户（默认用户）
   * @returns 当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    return await invoke<User>('get_current_user');
  }

  /**
   * 创建用户
   * @param request 创建用户请求
   * @returns 创建的用户信息
   */
  async createUser(request: CreateUserRequest): Promise<User> {
    return await invoke<User>('create_user', { request });
  }

  /**
   * 获取所有用户
   * @returns 用户列表
   */
  async getAllUsers(): Promise<User[]> {
    return await invoke<User[]>('get_all_users');
  }

  /**
   * 根据ID获取用户
   * @param id 用户ID
   * @returns 用户信息
   */
  async getUserById(id: string): Promise<User> {
    return await invoke<User>('get_user_by_id', { id });
  }

  /**
   * 更新用户
   * @param request 更新用户请求
   * @returns 更新后的用户信息
   */
  async updateUser(request: UpdateUserRequest): Promise<User> {
    return await invoke<User>('update_user', { request });
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 操作结果
   */
  async deleteUser(id: string): Promise<boolean> {
    return await invoke<boolean>('delete_user', { id });
  }
}

// 导出单例实例
export const userService = new UserService();
