/**
 * 用户服务 - 提供与用户相关的操作方法
 */
import { User } from '../types';
import { UserInfoFetchException } from '@/errors/service.errors';
import { invoke } from '@tauri-apps/api/core';
import { UserInfo } from '@/types/user';

/**
 * AI用户创建响应接口
 */
interface CreateAiUserResponse {
  id: string;
  name: string;
  description?: string;
  is_ai: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 用户响应接口
 */
interface UserResponse {
  id: string;
  name: string;
  description?: string;
  is_ai: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 用户服务类
 */
class UserService {
  // 单例实例
  private static instance: UserService;
  
  // 当前用户缓存
  private currentUserCache: UserInfo | null = null;

  // 私有构造函数，防止外部实例化
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * 获取当前登录用户
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
      throw new Error('获取当前用户失败');
    }
  }
  
  /**
   * 根据ID获取用户
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

// 导出用户服务单例
export const userService = UserService.getInstance(); 