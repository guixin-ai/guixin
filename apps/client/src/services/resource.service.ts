import { ResourceItem, ResourceType } from '@/models/resource.model';
import { resourceCommands, ResourceResponse } from '@/commands/resource.commands';
import { convertFileSrc } from '@tauri-apps/api/core';
import { appDataDir, join } from '@tauri-apps/api/path';

export interface GetResourcesResponse {
  resources: ResourceItem[];
  total: number;
}

// 将后端资源响应转换为前端模型
const convertResourceResponseToItem = async (resource: ResourceResponse): Promise<ResourceItem> => {
  let url = resource.url;

  // 获取应用数据目录
  const appData = await appDataDir();
  console.log('appData', appData);
  // 构建完整路径（appData目录 + 相对路径）
  const fullPath = await join(appData, url);
  console.log('fullPath', fullPath);
  // 转换为asset协议URL
  url = convertFileSrc(fullPath);

  return {
    id: resource.id,
    name: resource.name,
    type: resource.type_ as ResourceType,
    url: url,
    fileName: resource.file_name,
    createdAt: resource.created_at,
    description: resource.description || undefined,
  };
};

export const resourceService = {
  /**
   * 获取资源列表
   * @returns 包含资源列表的响应
   */
  async getResources(): Promise<GetResourcesResponse> {
    try {
      // 获取当前用户的所有资源
      const resources = await resourceCommands.getCurrentUserResources();

      // 转换为前端模型
      const resourceItems = await Promise.all(resources.map(convertResourceResponseToItem));

      return {
        resources: resourceItems,
        total: resourceItems.length,
      };
    } catch (error) {
      console.error('获取资源列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取图片资源列表
   * @returns 包含图片资源列表的响应
   */
  async getImageResources(): Promise<GetResourcesResponse> {
    try {
      // 获取当前用户的图片资源
      const resources = await resourceCommands.getCurrentUserImageResources();

      // 转换为前端模型
      const resourceItems = await Promise.all(resources.map(convertResourceResponseToItem));

      return {
        resources: resourceItems,
        total: resourceItems.length,
      };
    } catch (error) {
      console.error('获取图片资源列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取文本资源列表
   * @returns 包含文本资源列表的响应
   */
  async getTextResources(): Promise<GetResourcesResponse> {
    try {
      // 获取当前用户的文本资源
      const resources = await resourceCommands.getCurrentUserTextResources();

      // 转换为前端模型
      const resourceItems = await Promise.all(resources.map(convertResourceResponseToItem));

      return {
        resources: resourceItems,
        total: resourceItems.length,
      };
    } catch (error) {
      console.error('获取文本资源列表失败:', error);
      throw error;
    }
  },

  /**
   * 上传图片资源
   * @param file 图片文件
   * @param name 资源名称
   * @param description 资源描述
   * @returns 新资源项
   */
  async uploadImageResource(file: File, name: string, description?: string): Promise<ResourceItem> {
    try {
      // 读取文件为ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // 调用资源命令上传图片
      const resource = await resourceCommands.uploadCurrentUserImage({
        imageData: Array.from(uint8Array),
        name: name || file.name,
        file_name: file.name,
        description,
      });

      // 转换为前端模型
      return await convertResourceResponseToItem(resource);
    } catch (error) {
      console.error('上传图片资源失败:', error);
      throw error;
    }
  },

  /**
   * 上传文本资源
   * @param text 文本内容
   * @param name 资源名称
   * @param description 资源描述
   * @returns 新资源项
   */
  async uploadTextResource(
    text: string,
    name: string,
    description?: string
  ): Promise<ResourceItem> {
    try {
      // 调用资源命令上传文本
      const resource = await resourceCommands.uploadCurrentUserText({
        content: text,
        name,
        description,
      });

      // 转换为前端模型
      return await convertResourceResponseToItem(resource);
    } catch (error) {
      console.error('上传文本资源失败:', error);
      throw error;
    }
  },

  /**
   * 获取资源详情
   * @param id 资源ID
   * @returns 资源详情
   */
  async getResourceDetails(id: string): Promise<ResourceItem> {
    try {
      // 调用资源命令获取资源详情
      const resource = await resourceCommands.getResource({ id });

      // 转换为前端模型
      return await convertResourceResponseToItem(resource);
    } catch (error) {
      console.error('获取资源详情失败:', error);
      throw error;
    }
  },

  /**
   * 读取文本资源内容
   * @param id 资源ID
   * @returns 文本内容
   */
  async readTextContent(id: string): Promise<string> {
    try {
      // 调用资源命令读取文本内容
      return await resourceCommands.readTextResource({ id });
    } catch (error) {
      console.error('读取文本内容失败:', error);
      throw error;
    }
  },

  /**
   * 删除资源
   * @param id 资源ID
   */
  async deleteResource(id: string): Promise<void> {
    try {
      // 调用资源命令删除资源
      await resourceCommands.deleteResource({ id });
    } catch (error) {
      console.error('删除资源失败:', error);
      throw error;
    }
  },
};
