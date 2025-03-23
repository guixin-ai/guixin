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
    throw new Error('资源ID不能为空');
  }

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

  return {
    resource: resourceItem,
  };
}; 