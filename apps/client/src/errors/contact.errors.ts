/**
 * 联系人模块相关的异常定义
 */

// 联系人未找到异常
export class ContactNotFoundException extends Error {
  constructor(contactId: string) {
    super(`联系人 ${contactId} 不存在`);
    this.name = 'ContactNotFoundException';
  }
}

// 联系人列表初始化失败异常
export class ContactListInitFailedException extends Error {
  readonly originalError?: unknown;
  
  constructor(originalError?: unknown) {
    super('初始化联系人列表失败');
    this.name = 'ContactListInitFailedException';
    this.originalError = originalError;
  }
} 