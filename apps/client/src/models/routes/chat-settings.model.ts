import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// 主题类型
export type ThemeType = '浅色' | '深色' | '跟随系统';
export type FontSizeType = '小' | '中' | '大';
export type ChatBgType = '默认' | '纯色' | '自定义图片';

// 设置分类
export interface SettingsCategory {
  id: string;
  name: string;
}

interface SettingsState {
  // 当前选中的设置分类
  activeCategory: string;

  // 外观设置
  theme: ThemeType;
  fontSize: FontSizeType;
  chatBg: ChatBgType;
  customBgColor?: string;
  customBgImage?: string;

  // 通知设置
  enableNotifications: boolean;
  notificationSound: boolean;
  notificationPreview: boolean;

  // 隐私设置
  showLastSeen: boolean;
  readReceipts: boolean;

  // 聊天设置
  enterToSend: boolean;
  autoDownloadMedia: boolean;

  // 操作
  setActiveCategory: (category: string) => void;
  setTheme: (theme: ThemeType) => void;
  setFontSize: (size: FontSizeType) => void;
  setChatBg: (bg: ChatBgType) => void;
  setCustomBgColor: (color: string) => void;
  setCustomBgImage: (image: string) => void;
  toggleNotifications: (enabled: boolean) => void;
  toggleNotificationSound: (enabled: boolean) => void;
  toggleNotificationPreview: (enabled: boolean) => void;
  toggleLastSeen: (show: boolean) => void;
  toggleReadReceipts: (enabled: boolean) => void;
  toggleEnterToSend: (enabled: boolean) => void;
  toggleAutoDownloadMedia: (enabled: boolean) => void;
  resetSettings: () => void;
}

// 设置分类列表
export const settingsCategories: SettingsCategory[] = [
  { id: 'account', name: '账号与安全' },
  { id: 'notifications', name: '新消息通知' },
  { id: 'privacy', name: '隐私' },
  { id: 'chat', name: '聊天' },
  { id: 'storage', name: '存储' },
  { id: 'appearance', name: '外观' },
  { id: 'ollama', name: 'Ollama 本地模型管理' },
  { id: 'help', name: '帮助与反馈' },
  { id: 'about', name: '关于' },
];

// 默认设置
const defaultSettings = {
  activeCategory: 'appearance',
  theme: '浅色' as ThemeType,
  fontSize: '中' as FontSizeType,
  chatBg: '默认' as ChatBgType,
  enableNotifications: true,
  notificationSound: true,
  notificationPreview: true,
  showLastSeen: true,
  readReceipts: true,
  enterToSend: false,
  autoDownloadMedia: true,
};

export const useSettingsStore = create(
  immer<SettingsState>(set => ({
    ...defaultSettings,

    setActiveCategory: category =>
      set(state => {
        state.activeCategory = category;
        return state;
      }),

    setTheme: theme =>
      set(state => {
        state.theme = theme;

        // 应用主题到文档
        if (theme === '深色') {
          document.documentElement.classList.add('dark');
        } else if (theme === '浅色') {
          document.documentElement.classList.remove('dark');
        } else if (theme === '跟随系统') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }

        return state;
      }),

    setFontSize: size =>
      set(state => {
        state.fontSize = size;

        // 应用字体大小到根元素
        const rootElement = document.documentElement;
        if (size === '小') {
          rootElement.style.fontSize = '14px';
        } else if (size === '中') {
          rootElement.style.fontSize = '16px';
        } else if (size === '大') {
          rootElement.style.fontSize = '18px';
        }

        return state;
      }),

    setChatBg: bg =>
      set(state => {
        state.chatBg = bg;
        return state;
      }),

    setCustomBgColor: color =>
      set(state => {
        state.customBgColor = color;
        return state;
      }),

    setCustomBgImage: image =>
      set(state => {
        state.customBgImage = image;
        return state;
      }),

    toggleNotifications: enabled =>
      set(state => {
        state.enableNotifications = enabled;
        return state;
      }),

    toggleNotificationSound: enabled =>
      set(state => {
        state.notificationSound = enabled;
        return state;
      }),

    toggleNotificationPreview: enabled =>
      set(state => {
        state.notificationPreview = enabled;
        return state;
      }),

    toggleLastSeen: show =>
      set(state => {
        state.showLastSeen = show;
        return state;
      }),

    toggleReadReceipts: enabled =>
      set(state => {
        state.readReceipts = enabled;
        return state;
      }),

    toggleEnterToSend: enabled =>
      set(state => {
        state.enterToSend = enabled;
        return state;
      }),

    toggleAutoDownloadMedia: enabled =>
      set(state => {
        state.autoDownloadMedia = enabled;
        return state;
      }),

    resetSettings: () => set(() => ({ ...defaultSettings })),
  }))
);

export default useSettingsStore;
