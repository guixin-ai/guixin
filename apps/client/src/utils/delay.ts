/**
 * 延迟执行工具函数
 * 提供一个Promise包装的setTimeout实现
 */

/**
 * 延迟指定时间后解析Promise
 * @param ms 延迟的毫秒数
 * @returns 延迟后解析的Promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}; 