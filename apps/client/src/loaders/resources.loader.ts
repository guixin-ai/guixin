import { resourceService } from '../services/resource.service';
import { convertFileSrc } from '@tauri-apps/api/core';
import { appDataDir, join } from '@tauri-apps/api/path';

/**
 * 资源列表页面的数据加载器
 * 获取所有资源并处理资源URLs
 */
export const resourcesLoader = async () => {
  try {
    // 获取资源列表
    const response = await resourceService.getResources();

    // 处理URL拼接
    const processedResources = await Promise.all(
      response.resources.map(async resource => {
        // 获取应用数据目录
        const appData = await appDataDir();
        // 构建完整路径（appData目录 + 相对路径）
        const fullPath = await join(appData, resource.url);
        // 转换为asset协议URL
        const assetUrl = convertFileSrc(fullPath);

        // 返回处理后的资源
        return {
          ...resource,
          url: assetUrl,
        };
      })
    );

    return { resources: processedResources };
  } catch (error) {
    console.error('加载资源列表失败:', error);
    return { resources: [], error: '加载资源失败' };
  }
}; 