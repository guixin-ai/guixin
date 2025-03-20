/**
 * 用户模型 - 定义用户相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { userService } from '../services';
import { User } from '../types';

// 用户状态接口
export interface UserState {
  // 当前用户
  currentUser: User | null;

  // 操作方法
  fetchCurrentUser: () => Promise<void>;
}

// 创建用户状态存储
export const useUserStore = create(
  immer<UserState>((set) => ({
    // 初始状态
    currentUser: null,

    // 获取当前用户
    fetchCurrentUser: async () => {
      try {
        const user = await userService.getCurrentUser();
        set(state => {
          state.currentUser = user;
        });
      } catch (error) {
        console.error('获取当前用户失败:', error);
      }
    }
  }))
);

// 导出用户状态钩子
export const useUser = () => useUserStore();
