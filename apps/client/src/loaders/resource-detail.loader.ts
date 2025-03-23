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
    return { resource: null, error: '资源ID不能为空' };
  }

  try {
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
  } catch (error) {
    console.error('获取资源详情失败:', error);
    return { resource: null, error: '获取资源详情失败' };
  }
}; 