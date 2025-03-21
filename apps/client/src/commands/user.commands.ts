/**
 * 用户指令 - 定义与后端对应的用户相关指令
 */
import { invoke } from '@tauri-apps/api/core';
import { ContactResponse } from './contact.commands';

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string;
  name: string;
  description?: string | null;
  is_ai: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 用户指令类
 * 封装与后端通信的所有用户相关命令
 */
class UserCommands {
  // 单例实例
  private static instance: UserCommands;
  
  // 当前用户缓存
  private currentUserCache: UserInfo | null = null;
  
  // 私有构造函数，防止外部实例化
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  public static getInstance(): UserCommands {
    if (!UserCommands.instance) {
      UserCommands.instance = new UserCommands();
    }
    return UserCommands.instance;
  }
  
  /**
   * 获取当前登录用户
   * 调用后端 get_current_user 命令
   */
  public async getCurrentUser(): Promise<UserInfo> {
    if (this.currentUserCache) {
      return this.currentUserCache;
    }
    
    try {
      const user = await invoke('get_current_user') as UserInfo;
      this.currentUserCache = user;
      return user;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      throw new Error(`获取当前用户失败: ${error}`);
    }
  }
  
  /**
   * 根据ID获取用户
   * 调用后端 get_user 命令
   */
  public async getUser(id: string): Promise<UserInfo> {
    try {
      return await invoke('get_user', { id }) as UserInfo;
    } catch (error) {
      console.error(`获取用户 ${id} 失败:`, error);
      throw new Error(`获取用户失败: ${error}`);
    }
  }
  
  /**
   * 创建AI用户
   * 调用后端 create_ai_user 命令
   */
  public async createAiUser(name: string, description?: string): Promise<UserInfo> {
    try {
      return await invoke('create_ai_user', { name, description }) as UserInfo;
    } catch (error) {
      console.error('创建AI用户失败:', error);
      throw new Error(`创建AI用户失败: ${error}`);
    }
  }
}

// 导出用户指令单例
export const userCommands = UserCommands.getInstance(); 