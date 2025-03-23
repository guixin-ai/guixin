/**
 * 资源指令 - 定义与后端对应的资源相关指令
 */
import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod';
import { ResourceType } from '@/types/resource';

/**
 * 资源响应接口
 */
export interface ResourceResponse {
  id: string;
  name: string;
  type_: string;
  url: string;
  file_name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * 上传图片响应接口
 */
export interface UploadImageResponse {
  resource: ResourceResponse;
}

/**
 * 上传文本响应接口
 */
export interface UploadTextResponse {
  resource: ResourceResponse;
}

/**
 * 资源响应Zod验证Schema
 */
export const resourceResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type_: z.string(),
  url: z.string(),
  file_name: z.string(),
  description: z.string().nullable(),
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string()
});

/**
 * 上传图片响应Zod验证Schema
 */
export const uploadImageResponseSchema = z.object({
  resource: resourceResponseSchema
});

/**
 * 上传文本响应Zod验证Schema
 */
export const uploadTextResponseSchema = z.object({
  resource: resourceResponseSchema
});

/**
 * 上传图片参数Zod验证Schema
 */
export const uploadImageParamsSchema = z.object({
  imageData: z.array(z.number()),
  name: z.string().min(1, "资源名称不能为空"),
  file_name: z.string().optional(),
  description: z.string().optional()
});

/**
 * 上传文本参数Zod验证Schema
 */
export const uploadTextParamsSchema = z.object({
  content: z.string().min(1, "文本内容不能为空"),
  name: z.string().min(1, "资源名称不能为空"),
  description: z.string().optional()
});

/**
 * 获取资源参数Zod验证Schema
 */
export const getResourceParamsSchema = z.object({
  id: z.string().min(1, "资源ID不能为空")
});

/**
 * 读取文本资源参数Zod验证Schema
 */
export const readTextResourceParamsSchema = z.object({
  id: z.string().min(1, "资源ID不能为空")
});

/**
 * 删除资源参数Zod验证Schema
 */
export const deleteResourceParamsSchema = z.object({
  id: z.string().min(1, "资源ID不能为空")
});

// 根据Zod Schema派生类型
export type ResourceResponseValidated = z.infer<typeof resourceResponseSchema>;
export type UploadImageParams = z.infer<typeof uploadImageParamsSchema>;
export type UploadTextParams = z.infer<typeof uploadTextParamsSchema>;
export type GetResourceParams = z.infer<typeof getResourceParamsSchema>;
export type ReadTextResourceParams = z.infer<typeof readTextResourceParamsSchema>;
export type DeleteResourceParams = z.infer<typeof deleteResourceParamsSchema>;

/**
 * 资源指令类
 * 封装与后端通信的所有资源相关命令
 */
class ResourceCommands {
  // 单例实例
  private static instance: ResourceCommands;
  
  // 私有构造函数，防止外部实例化
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  public static getInstance(): ResourceCommands {
    if (!ResourceCommands.instance) {
      ResourceCommands.instance = new ResourceCommands();
    }
    return ResourceCommands.instance;
  }
  
  /**
   * 上传当前用户的图片
   * 调用后端 upload_current_user_image 命令
   * @param params 上传图片的参数
   */
  public async uploadCurrentUserImage(params: UploadImageParams): Promise<ResourceResponse> {
    try {
      // 使用Zod验证输入参数
      const validatedParams = uploadImageParamsSchema.parse(params);
      
      const response = await invoke<UploadImageResponse>('upload_current_user_image', {
        imageData: validatedParams.imageData,
        name: validatedParams.name,
        fileName: validatedParams.file_name,
        description: validatedParams.description
      });
      
      // 使用Zod验证返回数据
      const validatedResponse = uploadImageResponseSchema.parse(response);
      
      return validatedResponse.resource;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('参数或返回数据验证失败:', error.errors);
        throw new Error(`数据格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('上传图片失败:', error);
      throw new Error(`上传图片失败: ${error}`);
    }
  }
  
  /**
   * 上传当前用户的文本资源
   * 调用后端 upload_current_user_text 命令
   * @param params 上传文本的参数
   */
  public async uploadCurrentUserText(params: UploadTextParams): Promise<ResourceResponse> {
    try {
      // 使用Zod验证输入参数
      const validatedParams = uploadTextParamsSchema.parse(params);
      
      const response = await invoke<UploadTextResponse>('upload_current_user_text', {
        content: validatedParams.content,
        name: validatedParams.name,
        description: validatedParams.description
      });
      
      // 使用Zod验证返回数据
      const validatedResponse = uploadTextResponseSchema.parse(response);
      
      return validatedResponse.resource;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('参数或返回数据验证失败:', error.errors);
        throw new Error(`数据格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('上传文本资源失败:', error);
      throw new Error(`上传文本资源失败: ${error}`);
    }
  }
  
  /**
   * 获取当前用户的所有资源
   * 调用后端 get_current_user_resources 命令
   */
  public async getCurrentUserResources(): Promise<ResourceResponse[]> {
    try {
      const response = await invoke<ResourceResponse[]>('get_current_user_resources');
      
      // 验证每个资源的格式
      const validatedResources = z.array(resourceResponseSchema).parse(response);
      
      return validatedResources;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('返回数据验证失败:', error.errors);
        throw new Error(`数据格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('获取资源列表失败:', error);
      throw new Error(`获取资源列表失败: ${error}`);
    }
  }
  
  /**
   * 获取当前用户的图片资源
   * 调用后端 get_current_user_image_resources 命令
   */
  public async getCurrentUserImageResources(): Promise<ResourceResponse[]> {
    try {
      const response = await invoke<ResourceResponse[]>('get_current_user_image_resources');
      
      // 验证每个资源的格式
      const validatedResources = z.array(resourceResponseSchema).parse(response);
      
      return validatedResources;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('返回数据验证失败:', error.errors);
        throw new Error(`数据格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('获取图片资源列表失败:', error);
      throw new Error(`获取图片资源列表失败: ${error}`);
    }
  }
  
  /**
   * 获取当前用户的文本资源
   * 调用后端 get_current_user_text_resources 命令
   */
  public async getCurrentUserTextResources(): Promise<ResourceResponse[]> {
    try {
      const response = await invoke<ResourceResponse[]>('get_current_user_text_resources');
      
      // 验证每个资源的格式
      const validatedResources = z.array(resourceResponseSchema).parse(response);
      
      return validatedResources;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('返回数据验证失败:', error.errors);
        throw new Error(`数据格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('获取文本资源列表失败:', error);
      throw new Error(`获取文本资源列表失败: ${error}`);
    }
  }
  
  /**
   * 获取资源详情
   * 调用后端 get_resource 命令
   * @param params 获取资源的参数
   */
  public async getResource(params: GetResourceParams): Promise<ResourceResponse> {
    try {
      // 使用Zod验证输入参数
      const validatedParams = getResourceParamsSchema.parse(params);
      
      const response = await invoke<ResourceResponse>('get_resource', { 
        id: validatedParams.id 
      });
      
      // 使用Zod验证返回数据
      const validatedResource = resourceResponseSchema.parse(response);
      
      return validatedResource;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('参数或返回数据验证失败:', error.errors);
        throw new Error(`数据格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('获取资源详情失败:', error);
      throw new Error(`获取资源详情失败: ${error}`);
    }
  }
  
  /**
   * 读取文本资源内容
   * 调用后端 read_text_resource 命令
   * @param params 读取文本资源的参数
   */
  public async readTextResource(params: ReadTextResourceParams): Promise<string> {
    try {
      // 使用Zod验证输入参数
      const validatedParams = readTextResourceParamsSchema.parse(params);
      
      const content = await invoke<string>('read_text_resource', {
        id: validatedParams.id
      });
      
      return content;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('参数验证失败:', error.errors);
        throw new Error(`数据格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('读取文本资源内容失败:', error);
      throw new Error(`读取文本资源内容失败: ${error}`);
    }
  }
  
  /**
   * 删除资源
   * 调用后端 delete_resource 命令
   * @param params 删除资源的参数
   */
  public async deleteResource(params: DeleteResourceParams): Promise<void> {
    try {
      // 使用Zod验证输入参数
      const validatedParams = deleteResourceParamsSchema.parse(params);
      
      await invoke<void>('delete_resource', {
        id: validatedParams.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('参数验证失败:', error.errors);
        throw new Error(`数据格式无效: ${JSON.stringify(error.errors)}`);
      }
      console.error('删除资源失败:', error);
      throw new Error(`删除资源失败: ${error}`);
    }
  }
}

// 导出资源指令单例
export const resourceCommands = ResourceCommands.getInstance(); 