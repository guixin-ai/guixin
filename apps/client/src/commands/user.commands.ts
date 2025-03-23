/**
 * 用户指令 - 定义与后端对应的用户相关指令
 */
import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod';
import { ContactResponse } from './contact.commands';

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string;
  name: string;
  description: string | null;
  is_ai: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 用户信息Zod验证Schema
 */
export const userInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  is_ai: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

/**
 * 获取用户参数Zod验证Schema
 */
export const getUserParamsSchema = z.object({
  id: z.string().min(1, "用户ID不能为空")
});

/**
 * 创建AI用户参数Zod验证Schema
 */
export const createAiUserParamsSchema = z.object({
  name: z.string().min(1, "用户名不能为空"),
  description: z.string().optional()
});

// 根据Zod Schema派生类型
export type UserInfoValidated = z.infer<typeof userInfoSchema>;
export type GetUserParams = z.infer<typeof getUserParamsSchema>;
export type CreateAiUserParams = z.infer<typeof createAiUserParamsSchema>;

/**
 * 用户指令类
 * 封装与后端通信的所有用户相关命令
 */
class UserCommands {
  // 单例实例
  private static instance: UserCommands;
  
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
    try {
      const response = await invoke('get_current_user');
      
      // 使用Zod验证返回数据
      const validatedUser = userInfoSchema.parse(response);
      
      return validatedUser;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('用户数据验证失败:', error.errors);
        throw new Error(`用户数据格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('获取当前用户失败:', error);
      throw new Error(`获取当前用户失败: ${error}`);
    }
  }
  
  /**
   * 根据ID获取用户
   * 注意：后端目前缺少get_user命令，暂时使用get_current_user替代
   * @param params 获取用户的参数
   */
  public async getUser(params: GetUserParams): Promise<UserInfo> {
    try {
      // 使用Zod验证输入参数
      const validatedParams = getUserParamsSchema.parse(params);
      
      // 注意：后端暂时缺少 get_user 命令
      // 临时解决方案：使用 get_current_user 代替
      // TODO: 后端添加 get_user 命令后更新此处
      const response = await invoke('get_current_user');
      
      // 使用Zod验证返回数据
      const validatedUser = userInfoSchema.parse(response);
      
      // 检查ID是否匹配（简单验证）
      if (validatedUser.id !== validatedParams.id) {
        console.warn(`用户ID不匹配: 请求ID=${validatedParams.id}, 返回ID=${validatedUser.id}`);
      }
      
      return validatedUser;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('参数或返回数据验证失败:', error.errors);
        throw new Error(`数据格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error(`获取用户失败:`, error);
      throw new Error(`获取用户失败: ${error}`);
    }
  }
  
  /**
   * 创建AI用户
   * 调用后端 create_ai_user 命令
   * @param params 创建AI用户的参数
   */
  public async createAiUser(params: CreateAiUserParams): Promise<UserInfo> {
    try {
      // 使用Zod验证输入参数
      const validatedParams = createAiUserParamsSchema.parse(params);
      
      const response = await invoke('create_ai_user', { 
        name: validatedParams.name, 
        description: validatedParams.description 
      });
      
      // 使用Zod验证返回数据
      const validatedUser = userInfoSchema.parse(response);
      
      return validatedUser;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('参数或返回数据验证失败:', error.errors);
        throw new Error(`数据格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('创建AI用户失败:', error);
      throw new Error(`创建AI用户失败: ${error}`);
    }
  }
}

// 导出用户指令单例
export const userCommands = UserCommands.getInstance(); 