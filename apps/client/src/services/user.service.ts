/**
 * 用户服务 - 提供与用户相关的操作方法
 */
import { UserInfoFetchException } from '@/errors/service.errors';
import { userCommands, contactCommands } from '@/commands';
import type { UserInfo, ContactResponse } from '@/commands';

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
   * 获取当前登录用户
   */
  public async getCurrentUser(): Promise<UserInfo> {
    try {
      return await userCommands.getCurrentUser();
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
      return await userCommands.getUser({ id });
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
      return await userCommands.createAiUser({ name, description });
    } catch (error) {
      console.error('创建AI用户失败:', error);
      throw new Error(`创建AI用户失败: ${error}`);
    }
  }

  /**
   * 创建AI用户并添加为联系人
   */
  public async createAiContact(name: string, description?: string): Promise<ContactResponse> {
    try {
      return await contactCommands.createCurrentUserAiContact(name, description);
    } catch (error) {
      console.error('创建AI联系人失败:', error);
      throw new Error(`创建AI联系人失败: ${error}`);
    }
  }
}

// 导出用户服务单例
export const userService = UserService.getInstance(); 