/**
 * 简单调试工具 - 提供全局访问各个store的功能
 */

import { useAppStore } from '@/models/app.model';
import { useChatStore } from '@/models/chat.model';
import { useContactStore } from '@/models/contact.model';

// 在开发环境中将store挂载到全局对象
if (process.env.NODE_ENV === 'development') {
  // 定义全局调试对象
  window.__STORES__ = {
    appStore: useAppStore,
    chatStore: useChatStore,
    contactStore: useContactStore
  };
  
  console.log(
    '%c[调试工具]%c 已加载，可以使用 window.__STORES__ 对象访问各个store',
    'background: #4CAF50; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
    'color: #4CAF50; font-weight: bold;'
  );
}

// 扩展Window接口
declare global {
  interface Window {
    __STORES__: {
      appStore: typeof useAppStore;
      chatStore: typeof useChatStore;
      contactStore: typeof useContactStore;
    };
  }
}

// 空导出，保持模块结构
export {}; 