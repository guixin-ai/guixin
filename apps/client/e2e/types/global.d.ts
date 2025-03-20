// 全局类型定义
declare global {
  interface Window {
    __TAURI_INTERNALS__: {
      transformCallback: <T = unknown>(callback?: (response: T) => void, once?: boolean) => number;
      invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
      eval: (script: string) => Promise<unknown>;
      [key: string]: unknown;
    };
    __STORES__: unknown;
  }
}

// 导出一个空对象使其成为模块
export {}; 