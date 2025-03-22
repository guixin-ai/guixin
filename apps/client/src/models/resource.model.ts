/**
 * 资源模型 - 定义资源相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

// 资源类型枚举
export enum ResourceType {
  TEXT = 'text',
  IMAGE = 'image'
}

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

// 资源状态接口
export interface ResourceState {
  // 资源列表
  resources: ResourceItem[];
  // 资源详情，以资源ID为键
  resourceDetails: Record<string, ResourceItem>;
  // 是否已初始化资源列表
  initializedList: boolean;

  // 操作方法
  searchResources: (query: string) => ResourceItem[];
  addResource: (resource: ResourceItem) => void;
  getResources: () => ResourceItem[];
  getResourceById: (id: string) => ResourceItem | null;
  removeResource: (id: string) => void;

  // 初始化方法
  initializeList: (resources: ResourceItem[]) => void;
}

// 示例数据
const initialResources: ResourceItem[] = [];

// 创建资源状态存储
export const useResourceStore = create(
  devtools(
    immer<ResourceState>((set, get) => ({
      // 初始状态
      resources: initialResources,
      resourceDetails: {},
      initializedList: false,

      // 搜索资源
      searchResources: (query: string) => {
        const { resources } = get();
        return resources.filter(resource => 
          resource.name.toLowerCase().includes(query.toLowerCase()) ||
          (resource.description && resource.description.toLowerCase().includes(query.toLowerCase()))
        );
      },

      // 添加新资源
      addResource: (resource: ResourceItem) => {
        set(state => {
          // 添加到资源列表
          state.resources.push(resource);
          // 排序-按创建时间倒序
          state.resources.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          // 同时添加到详情
          state.resourceDetails[resource.id] = resource;
        });
      },
      
      // 获取资源列表
      getResources: () => {
        const state = get();
        
        // 如果已经初始化，则直接返回缓存数据
        if (state.initializedList) {
          return state.resources;
        }
        
        // 如果未初始化，则返回空列表
        return [];
      },

      // 根据ID获取资源
      getResourceById: (id: string) => {
        const state = get();
        
        if (state.initializedList) {
          return state.resourceDetails[id] || null;
        }
        
        return null;
      },

      // 移除资源
      removeResource: (id: string) => {
        set(state => {
          // 从列表中移除
          state.resources = state.resources.filter(resource => resource.id !== id);
          // 从详情中移除
          delete state.resourceDetails[id];
        });
      },

      // 初始化资源列表
      initializeList: (resources: ResourceItem[]) => {
        set(state => {
          state.resources = resources;
          
          // 更新详情缓存
          resources.forEach(resource => {
            state.resourceDetails[resource.id] = resource;
          });
          
          state.initializedList = true;
        });
      }
    })),
    {
      name: 'resource',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
); 