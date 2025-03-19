/**
 * 应用模型 - 定义应用相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// 应用配置接口
export interface AppConfig {
  // 应用名称
  name: string;
  // 应用版本
  version: string;
  // 是否处于开发模式
  isDevelopment: boolean;
  // 日志级别
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  // 最大历史记录数
  maxHistoryItems: number;
  // 自动保存间隔（毫秒）
  autoSaveInterval: number;
}

// 应用状态接口
export interface AppState {
  // 应用是否已初始化
  initialized: boolean;
  // 应用配置
  config: AppConfig;
  // 加载状态
  loading: boolean;
  // 错误信息
  error: string | null;
  // 上次更新时间
  lastUpdated: Date | null;

  // 操作方法
  initializeApp: () => Promise<void>;
  updateConfig: (config: Partial<AppConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// 默认应用配置
const defaultConfig: AppConfig = {
  name: 'Tauri App',
  version: '0.1.0',
  isDevelopment: import.meta.env.DEV,
  logLevel: 'info',
  maxHistoryItems: 100,
  autoSaveInterval: 30000, // 30秒
};

// 创建应用状态存储
export const useAppStore = create(
  immer<AppState>(set => ({
    // 初始状态
    initialized: false,
    config: { ...defaultConfig },
    loading: false,
    error: null,
    lastUpdated: null,

    // 初始化应用
    initializeApp: async () => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        // 这里可以添加从存储加载配置的逻辑
        // 例如: const savedConfig = await appService.loadConfig();

        // 模拟加载延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        set(state => {
          // state.config = { ...defaultConfig, ...savedConfig };
          state.initialized = true;
          state.loading = false;
          state.lastUpdated = new Date();
        });
      } catch (error) {
        console.error('初始化应用失败:', error);
        set(state => {
          state.loading = false;
          state.error = error instanceof Error ? error.message : '初始化应用失败';
        });
      }
    },

    // 更新配置
    updateConfig: async (configUpdate: Partial<AppConfig>) => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        // 这里可以添加保存配置的逻辑
        // 例如: await appService.saveConfig({ ...state.config, ...configUpdate });

        // 模拟保存延迟
        await new Promise(resolve => setTimeout(resolve, 300));

        set(state => {
          state.config = { ...state.config, ...configUpdate };
          state.loading = false;
          state.lastUpdated = new Date();
        });
      } catch (error) {
        console.error('更新配置失败:', error);
        set(state => {
          state.loading = false;
          state.error = error instanceof Error ? error.message : '更新配置失败';
        });
      }
    },

    // 重置配置
    resetConfig: async () => {
      try {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        // 这里可以添加重置配置的逻辑
        // 例如: await appService.resetConfig();

        // 模拟操作延迟
        await new Promise(resolve => setTimeout(resolve, 300));

        set(state => {
          state.config = { ...defaultConfig };
          state.loading = false;
          state.lastUpdated = new Date();
        });
      } catch (error) {
        console.error('重置配置失败:', error);
        set(state => {
          state.loading = false;
          state.error = error instanceof Error ? error.message : '重置配置失败';
        });
      }
    },

    // 设置加载状态
    setLoading: (isLoading: boolean) => {
      set(state => {
        state.loading = isLoading;
      });
    },

    // 设置错误信息
    setError: (error: string | null) => {
      set(state => {
        state.error = error;
      });
    },
  }))
);

// 导出应用状态钩子
export const useApp = () => useAppStore();
