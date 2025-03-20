/**
 * 用户服务 - 提供与用户相关的操作方法
 */
import { User } from '../types';
import { UserInfoFetchException } from '@/errors/service.errors';
import { invoke } from '@tauri-apps/api/core';

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
   * 创建AI用户
   * @param name AI用户名称
   * @param description AI用户描述
   * @returns 创建的AI用户信息
   */
  async createAiUser(name: string, description?: string): Promise<User> {
    try {
      const response = await invoke<CreateAiUserResponse>('create_ai_user', { 
        name, 
        description 
      });
      
      return {
        id: response.id,
        name: response.name,
        description: response.description,
        isAi: response.is_ai
      };
    } catch (error) {
      console.error('创建AI用户失败:', error);
      throw new Error(`创建AI用户失败: ${error}`);
    }
  }

  /**
   * 获取当前用户
   * @returns 当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    try {
      // 调用后端API获取当前用户
      const response = await invoke<UserResponse>('get_current_user');
      
      return {
        id: response.id,
        name: response.name,
        description: response.description,
        isAi: response.is_ai
      };
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
      throw new UserInfoFetchException();
    }
  }
}

// 导出用户服务单例
export const userService = UserService.getInstance(); 