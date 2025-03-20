/**
 * 用户模块相关的异常定义
 */

// 用户未找到异常
export class UserNotFoundException extends Error {
  constructor() {
    super('当前用户不存在');
    this.name = 'UserNotFoundException';
  }
}

// 用户信息获取失败异常
export class UserFetchFailedException extends Error {
  readonly originalError?: unknown;
  
  constructor(originalError?: unknown) {
    super('获取用户信息失败');
    this.name = 'UserFetchFailedException';
    this.originalError = originalError;
  }
} 