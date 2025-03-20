/**
 * 应用模型 - 定义应用相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// 应用状态接口
export interface AppState {
  // 应用是否已初始化
  initialized: boolean;

  // 初始化应用
  initialize: () => Promise<void>;
}

// 创建应用状态存储
export const useAppStore = create(
  immer<AppState>(set => ({
    // 初始状态
    initialized: false,

    // 初始化应用
    initialize: async () => {
      const state = useAppStore.getState();
      
      // 如果已经初始化，则直接返回
      if (state.initialized) {
        return;
      }
      
      try {
        // 标记为已初始化
        set(state => {
          state.initialized = true;
        });
      } catch (error) {
        console.error('应用初始化失败:', error);
      }
    }
  }))
);

// 导出应用状态钩子
export const useApp = () => useAppStore();
