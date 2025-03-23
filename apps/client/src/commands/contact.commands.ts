/**
 * 联系人指令 - 定义与后端对应的联系人相关指令
 */
import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod';

/**
 * 联系人响应接口
 */
export interface ContactResponse {
  id: string;
  name: string;
  description?: string | null;
  is_ai: boolean;
}

/**
 * 联系人响应Zod验证Schema
 */
export const contactResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  is_ai: z.boolean()
});

/**
 * 创建AI联系人参数Zod验证Schema
 */
export const createAiContactParamsSchema = z.object({
  name: z.string().min(1, "联系人名称不能为空"),
  description: z.string().optional()
});

/**
 * 移除联系人参数Zod验证Schema
 */
export const removeContactParamsSchema = z.object({
  contactId: z.string().min(1, "联系人ID不能为空")
});

// 根据Zod Schema派生类型
export type ContactResponseValidated = z.infer<typeof contactResponseSchema>;
export type CreateAiContactParams = z.infer<typeof createAiContactParamsSchema>;
export type RemoveContactParams = z.infer<typeof removeContactParamsSchema>;

/**
 * 联系人指令类
 * 封装与后端通信的所有联系人相关命令
 */
class ContactCommands {
  // 单例实例
  private static instance: ContactCommands;
  
  // 私有构造函数，防止外部实例化
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  public static getInstance(): ContactCommands {
    if (!ContactCommands.instance) {
      ContactCommands.instance = new ContactCommands();
    }
    return ContactCommands.instance;
  }
  
  /**
   * 获取当前用户的联系人列表
   * 调用后端 get_current_user_contacts 命令
   */
  public async getCurrentUserContacts(): Promise<ContactResponse[]> {
    try {
      const response = await invoke<any[]>('get_current_user_contacts');
      
      // 使用Zod验证返回数据
      const validatedContacts = z.array(contactResponseSchema).parse(response);
      
      return validatedContacts;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('返回数据验证失败:', error.errors);
        throw new Error(`数据格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('获取当前用户联系人列表失败:', error);
      throw new Error(`获取联系人列表失败: ${error}`);
    }
  }
  
  /**
   * 为当前用户添加联系人
   * 调用后端 add_current_user_contact 命令
   */
  public async addCurrentUserContact(contactId: string): Promise<void> {
    try {
      // 验证参数
      removeContactParamsSchema.parse({ contactId });
      
      await invoke('add_current_user_contact', { contact_id: contactId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('参数验证失败:', error.errors);
        throw new Error(`参数格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('添加联系人失败:', error);
      throw new Error(`添加联系人失败: ${error}`);
    }
  }
  
  /**
   * 从当前用户的联系人列表中移除联系人
   * 调用后端 remove_current_user_contact 命令
   */
  public async removeCurrentUserContact(contactId: string): Promise<void> {
    try {
      // 验证参数
      removeContactParamsSchema.parse({ contactId });
      
      await invoke('remove_current_user_contact', { contact_id: contactId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('参数验证失败:', error.errors);
        throw new Error(`参数格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('删除联系人失败:', error);
      throw new Error(`删除联系人失败: ${error}`);
    }
  }
  
  /**
   * 创建AI用户并添加为当前用户的联系人
   * 调用后端 create_current_user_ai_contact 命令
   */
  public async createCurrentUserAiContact(
    name: string, 
    description?: string
  ): Promise<ContactResponse> {
    try {
      // 验证参数
      createAiContactParamsSchema.parse({ name, description });
      
      const response = await invoke<any>('create_current_user_ai_contact', { 
        name, 
        description 
      });
      
      // 验证返回数据
      const validatedResponse = contactResponseSchema.parse(response);
      
      return validatedResponse;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('参数或返回数据验证失败:', error.errors);
        throw new Error(`数据格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('创建AI联系人失败:', error);
      throw new Error(`创建AI联系人失败: ${error}`);
    }
  }
}

// 导出联系人指令单例
export const contactCommands = ContactCommands.getInstance(); 