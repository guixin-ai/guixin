import { data } from 'react-router-dom';
import { resourceCommands } from '../commands/resource.commands';
import { convertFileSrc } from '@tauri-apps/api/core';
import { appDataDir, join } from '@tauri-apps/api/path';
import { ResourceItem, ResourceType } from '@/types/resource';

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
    }, { status: 400 });
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

    // 使用data包裹成功响应
    return data({
      success: true,
      resource: resourceItem,
    }, { status: 200 });
  } catch (error) {
    // 捕获并处理错误
    console.error(`加载资源详情失败 (ID: ${resourceId}):`, error);
    
    // 返回错误响应
    return data({
      success: false,
      error: `加载资源详情失败: ${error instanceof Error ? error.message : String(error)}`,
      resource: null
    }, { status: 500 });
  }
}; 