import { data } from 'react-router-dom';
import { resourceCommands } from '../commands/resource.commands';
import { convertFileSrc } from '@tauri-apps/api/core';
import { appDataDir, join } from '@tauri-apps/api/path';
import { ResourceItem, ResourceType } from '@/types/resource';

/**
 * 资源列表页面的数据加载器
 * 获取所有资源并处理资源URLs
 */
export const resourcesLoader = async () => {
  try {
    // 获取资源列表
    const resources = await resourceCommands.getCurrentUserResources();

    // 处理URL拼接和转换响应格式
    const processedResources = await Promise.all(
      resources.map(async resource => {
        // 获取应用数据目录
        const appData = await appDataDir();
        // 构建完整路径（appData目录 + 相对路径）
        const fullPath = await join(appData, resource.url);
        // 转换为asset协议URL
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

        return resourceItem;
      })
    );

    // 使用data包裹成功响应
    return data({ 
      success: true,
      resources: processedResources 
    }, { status: 200 });
  } catch (error) {
    // 捕获并处理错误
    console.error('加载资源列表失败:', error);
    
    // 返回错误响应
    return data({
      success: false,
      error: `加载资源列表失败: ${error instanceof Error ? error.message : String(error)}`,
      resources: [] // 提供空资源列表作为默认值
    }, { status: 500 });
  }
};
