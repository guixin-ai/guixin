import { data } from 'react-router-dom';
import { resourceCommands } from '../commands/resource.commands';
import { convertFileSrc } from '@tauri-apps/api/core';
import { appDataDir, join } from '@tauri-apps/api/path';
import { ResourceItem, ResourceType } from '@/types/resource';

// 定义成功返回的数据结构
export interface ResourceDetailSuccess {
  success: true;
  resource: ResourceItem;
  textContent?: string;
}

// 定义文本内容加载失败的数据结构
export interface ResourceDetailTextError {
  success: true;
  resource: ResourceItem;
  textError: string;
}

// 定义资源加载失败的数据结构
export interface ResourceDetailError {
  success: false;
  error: string;
  resource: null;
}

// 加载器返回值类型
export type ResourceDetailLoaderData = 
  | ResourceDetailSuccess 
  | ResourceDetailTextError 
  | ResourceDetailError;

/**
 * 资源详情页面的数据加载器
 * 根据资源ID获取详细信息
 */
export const resourceDetailLoader = async ({ params }: { params: { resourceId?: string } }) => {
  const { resourceId } = params;

  if (!resourceId) {
    // 使用data返回参数错误
    return data({
      success: false,
      error: '资源ID不能为空',
      resource: null
    } satisfies ResourceDetailError, { status: 400 });
  }

  try {
    // 直接使用指令层获取资源详情
    const resource = await resourceCommands.getResource({ id: resourceId });

    // 处理URL拼接
    const appData = await appDataDir();
    const fullPath = await join(appData, resource.url);
    const assetUrl = convertFileSrc(fullPath);

    // 转换为前端模型
    const resourceItem: ResourceItem = {
      id: resource.id,
      name: resource.name,
      type: resource.type_ as ResourceType,
      url: assetUrl,
      fileName: resource.file_name,
      createdAt: resource.created_at,
      description: resource.description || undefined,
    };

    // 如果是文本资源，同时获取文本内容
    if (resourceItem.type === 'text') {
      try {
        const textContent = await resourceCommands.readTextResource({ id: resourceId });
        // 成功获取文本内容
        return data({
          success: true,
          resource: resourceItem,
          textContent
        } satisfies ResourceDetailSuccess, { status: 200 });
      } catch (error) {
        console.error('读取文本内容失败:', error);
        // 文本内容获取失败但资源信息获取成功
        return data({
          success: true,
          resource: resourceItem,
          textError: `读取文本内容失败: ${error instanceof Error ? error.message : String(error)}`
        } satisfies ResourceDetailTextError, { status: 200 });
      }
    }

    // 非文本资源成功响应
    return data({
      success: true,
      resource: resourceItem,
    } satisfies ResourceDetailSuccess, { status: 200 });
  } catch (error) {
    // 捕获并处理错误
    console.error(`加载资源详情失败 (ID: ${resourceId}):`, error);
    
    // 返回错误响应
    return data({
      success: false,
      error: `加载资源详情失败: ${error instanceof Error ? error.message : String(error)}`,
      resource: null
    } satisfies ResourceDetailError, { status: 500 });
  }
}; 