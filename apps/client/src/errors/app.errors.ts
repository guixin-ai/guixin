/**
 * 应用模块相关的异常定义
 */

// 应用初始化失败异常
export class AppInitFailedException extends Error {
  readonly originalError?: unknown;
  
  constructor(originalError?: unknown) {
    super('应用初始化失败');
    this.name = 'AppInitFailedException';
    this.originalError = originalError;
  }
} 