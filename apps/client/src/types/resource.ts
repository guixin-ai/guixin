/**
 * 资源类型定义
 */

// 资源类型联合类型
export type ResourceType = 'text' | 'image';

// 资源项接口
export interface ResourceItem {
  id: string;
  name: string;
  type: ResourceType;
  url: string;
  fileName: string;
  createdAt: string;
  description?: string;
} 