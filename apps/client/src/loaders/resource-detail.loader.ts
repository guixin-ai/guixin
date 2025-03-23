import { resourceService } from '../services/resource.service';
import { convertFileSrc } from '@tauri-apps/api/core';
import { appDataDir, join } from '@tauri-apps/api/path';

/**
 * 资源详情页面的数据加载器
 * 根据资源ID获取详细信息
 */
export const resourceDetailLoader = async ({ params }: { params: { resourceId?: string } }) => {
  const { resourceId } = params;

  if (!resourceId) {
    throw new Error('资源ID不能为空');
  }

  const resource = await resourceService.getResourceDetails(resourceId);

  // 处理URL拼接
  const appData = await appDataDir();
  const fullPath = await join(appData, resource.url);
  const assetUrl = convertFileSrc(fullPath);

  return {
    resource: {
      ...resource,
      url: assetUrl,
    },
  };
}; 