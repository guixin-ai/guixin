/**
 * 日志工具
 * 提供统一的日志打印功能，可根据不同模块设置不同的前缀
 * 支持全局控制是否显示调试信息
 */

// 全局调试开关
let GLOBAL_DEBUG_ENABLED = true;

// 模块调试开关映射
const MODULE_DEBUG_ENABLED: Record<string, boolean> = {
  '提及导航': true,
  '提及转换': true,
  '提及删除': true,
  '提及触发': true,
  '光标工具': true,
};

/**
 * 创建一个日志记录器
 * @param moduleName 模块名称，会显示为日志前缀
 * @returns 日志记录函数
 */
export function createLogger(moduleName: string) {
  const prefix = `[${moduleName}]`;
  
  // 检查模块是否存在，如果不存在则默认开启
  if (MODULE_DEBUG_ENABLED[moduleName] === undefined) {
    MODULE_DEBUG_ENABLED[moduleName] = true;
  }
  
  /**
   * 打印调试日志
   * 只有在全局调试开关和模块调试开关都开启的情况下才会打印
   */
  const debug = (...args: any[]) => {
    if (GLOBAL_DEBUG_ENABLED && MODULE_DEBUG_ENABLED[moduleName]) {
      console.log(prefix, ...args);
    }
  };
  
  /**
   * 打印信息日志
   * 无论调试开关是否开启，都会打印
   */
  const info = (...args: any[]) => {
    console.log(prefix, ...args);
  };
  
  /**
   * 打印警告日志
   */
  const warn = (...args: any[]) => {
    console.warn(prefix, ...args);
  };
  
  /**
   * 打印错误日志
   */
  const error = (...args: any[]) => {
    console.error(prefix, ...args);
  };
  
  /**
   * 启用该模块的调试日志
   */
  const enable = () => {
    MODULE_DEBUG_ENABLED[moduleName] = true;
    info('调试日志已启用');
  };
  
  /**
   * 禁用该模块的调试日志
   */
  const disable = () => {
    MODULE_DEBUG_ENABLED[moduleName] = false;
    info('调试日志已禁用');
  };
  
  return {
    debug,
    info,
    warn,
    error,
    enable,
    disable
  };
}

/**
 * 启用全局调试
 */
export function enableGlobalDebug() {
  GLOBAL_DEBUG_ENABLED = true;
  console.log('[日志工具] 全局调试已启用');
}

/**
 * 禁用全局调试
 */
export function disableGlobalDebug() {
  GLOBAL_DEBUG_ENABLED = false;
  console.log('[日志工具] 全局调试已禁用');
}

/**
 * 设置特定模块的调试开关
 * @param moduleName 模块名称
 * @param enabled 是否启用
 */
export function setModuleDebug(moduleName: string, enabled: boolean) {
  MODULE_DEBUG_ENABLED[moduleName] = enabled;
  console.log(`[日志工具] 模块 [${moduleName}] 调试已${enabled ? '启用' : '禁用'}`);
} 