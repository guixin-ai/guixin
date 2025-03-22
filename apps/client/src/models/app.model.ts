/**
 * 应用模型 - 定义应用相关的类型和状态管理
 */

import { User } from '@/types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// 应用状态接口
export interface AppState {
  // 应用是否已初始化
  initialized: boolean;

  // 当前用户
  currentUser: User | null;

  // 初始化应用
  initialize: (user: User) => void;
}

// 创建应用状态存储
export const useAppStore = create(
  immer<AppState>(set => ({
    // 初始状态
    initialized: false,
    currentUser: null,

    // 初始化应用
    initialize: (user: User) => {
      // 同步方法，设置用户信息并标记应用为已初始化
      set(state => {
        state.currentUser = user;
        state.initialized = true;
      });
    }
  }))
);
