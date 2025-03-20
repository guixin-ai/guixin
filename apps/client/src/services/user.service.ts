/**
 * 用户服务 - 提供与用户相关的操作方法
 */
import { User } from '../types';

/**
 * 用户服务类
 */
class UserService {
  // 单例实例
  private static instance: UserService;
  
  // 模拟用户数据
  private mockUser: User = {
    id: '1',
    name: '张三',
  };
  
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
   * 获取当前用户
   * @returns 当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.mockUser;
  }
}

// 导出用户服务单例
export const userService = UserService.getInstance(); 