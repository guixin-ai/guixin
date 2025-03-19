/**
 * 用户模型 - 定义用户相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { userService } from '../services';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';

// 用户状态接口
export interface UserState {
  // 当前用户
  currentUser: User | null;
  // 用户列表
  users: User[];
  // 加载状态
  loading: boolean;
  // 错误信息
  error: string | null;

  // 操作方法
  fetchCurrentUser: () => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<User | null>;
  updateUser: (user: Partial<User> & { id: string }) => Promise<void>;
  setTheme: (theme: string) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  setFontSize: (fontSize: number) => Promise<void>;
}

// 创建用户状态存储
export const useUserStore = create(
  immer<UserState>((set, get) => ({
    // 初始状态
    currentUser: null,
    users: [],
    loading: false,
    error: null,

    // 获取当前用户
    fetchCurrentUser: async () => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        const user = await userService.getCurrentUser();

        set(state => {
          state.currentUser = user;
          state.loading = false;
        });
      } catch (error) {
        console.error('获取当前用户失败:', error);
        set(state => {
          state.loading = false;
          state.error = error instanceof Error ? error.message : '获取当前用户失败';
        });
      }
    },

    // 获取所有用户
    fetchAllUsers: async () => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        const users = await userService.getAllUsers();

        set(state => {
          state.users = users;
          state.loading = false;
        });
      } catch (error) {
        console.error('获取所有用户失败:', error);
        set(state => {
          state.loading = false;
          state.error = error instanceof Error ? error.message : '获取所有用户失败';
        });
      }
    },

    // 根据ID获取用户
    fetchUserById: async (id: string) => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        const user = await userService.getUserById(id);

        set(state => {
          // 更新用户列表中的对应用户
          const index = state.users.findIndex(u => u.id === id);
          if (index >= 0) {
            state.users[index] = user;
          } else {
            state.users.push(user);
          }
          state.loading = false;
        });

        return user;
      } catch (error) {
        console.error(`获取用户 ${id} 失败:`, error);
        set(state => {
          state.loading = false;
          state.error = error instanceof Error ? error.message : `获取用户 ${id} 失败`;
        });
        return null;
      }
    },

    // 更新用户
    updateUser: async (userData: Partial<User> & { id: string }) => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        // 获取当前完整的用户数据
        const currentUser = get().currentUser;
        const userToUpdate =
          get().users.find(u => u.id === userData.id) ||
          (currentUser?.id === userData.id ? currentUser : null);

        if (!userToUpdate) {
          throw new Error(`用户 ${userData.id} 不存在`);
        }

        // 合并用户数据
        const updatedUserData = {
          ...userToUpdate,
          ...userData,
        } as User;

        // 调用服务更新用户
        const updatedUser = await userService.updateUser({
          id: updatedUserData.id,
          name: updatedUserData.name,
          email: updatedUserData.email,
          avatar_url: updatedUserData.avatar_url,
          description: updatedUserData.description,
          is_ai: updatedUserData.is_ai,
          cloud_id: updatedUserData.cloud_id,
          sync_enabled: updatedUserData.sync_enabled,
          theme: updatedUserData.theme,
          language: updatedUserData.language,
          font_size: updatedUserData.font_size,
          custom_settings: updatedUserData.custom_settings,
        });

        // 更新状态
        set(state => {
          const index = state.users.findIndex(u => u.id === updatedUser.id);
          if (index >= 0) {
            state.users[index] = updatedUser;
          }

          // 如果更新的是当前用户，也更新currentUser
          if (state.currentUser?.id === updatedUser.id) {
            state.currentUser = updatedUser;
          }

          state.loading = false;
        });
      } catch (error) {
        console.error('更新用户失败:', error);
        set(state => {
          state.loading = false;
          state.error = error instanceof Error ? error.message : '更新用户失败';
        });
      }
    },

    // 设置主题
    setTheme: async (theme: string) => {
      const { currentUser } = get();
      if (currentUser) {
        await get().updateUser({
          id: currentUser.id,
          theme,
        });
      }
    },

    // 设置语言
    setLanguage: async (language: string) => {
      const { currentUser } = get();
      if (currentUser) {
        await get().updateUser({
          id: currentUser.id,
          language,
        });
      }
    },

    // 设置字体大小
    setFontSize: async (font_size: number) => {
      const { currentUser } = get();
      if (currentUser) {
        await get().updateUser({
          id: currentUser.id,
          font_size,
        });
      }
    },
  }))
);

// 导出用户类型
export type { User, CreateUserRequest, UpdateUserRequest } from '../types';
