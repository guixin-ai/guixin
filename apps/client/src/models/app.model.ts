/**
 * 应用模型 - 定义应用相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AppInitFailedException } from '@/errors/app.errors';
import { UserNotFoundException, UserFetchFailedException } from '@/errors/user.errors';
import { userService } from '@/services';
import { User } from '@/types';

// 应用状态接口
export interface AppState {
  // 应用是否已初始化
  initialized: boolean;

  // 当前用户
  currentUser: User | null;

  // 初始化应用
  initialize: () => Promise<void>;

  // 获取当前用户
  fetchCurrentUser: () => Promise<User | null>;
}

// 创建应用状态存储
export const useAppStore = create(
  immer<AppState>(set => ({
    // 初始状态
    initialized: false,
    currentUser: null,

    // 初始化应用
    initialize: async () => {
      const state = useAppStore.getState();

      // 如果已经初始化，则直接返回
      if (state.initialized) {
        return;
      }

      try {
        // 获取当前用户
        await state.fetchCurrentUser();

        // 标记为已初始化
        set(state => {
          state.initialized = true;
        });
      } catch (error) {
        console.error('应用初始化失败:', error);
        throw new AppInitFailedException(error);
      }
    },

    // 获取当前用户
    fetchCurrentUser: async () => {
      try {
        const user = await userService.getCurrentUser();
        if (!user) {
          throw new UserNotFoundException();
        }

        set(state => {
          state.currentUser = user;
        });

        return user;
      } catch (error) {
        console.error('获取当前用户失败:', error);
        throw new UserFetchFailedException(error);
      }
    },
  }))
);
