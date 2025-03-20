/**
 * 联系人模块相关的异常定义
 */

// 联系人未找到异常
export class ContactNotFoundException extends Error {
  constructor(contactId: string) {
    super(`联系人 ${contactId} 未找到`);
    this.name = 'ContactNotFoundException';
  }
}

// 联系人列表初始化失败异常
export class ContactListInitFailedException extends Error {
  constructor(originalError: any) {
    super(`联系人列表初始化失败: ${originalError?.message || '未知错误'}`);
    this.name = 'ContactListInitFailedException';
  }
}

// 联系人详情初始化失败异常
export class ContactDetailInitFailedException extends Error {
  constructor(contactId: string, originalError: any) {
    super(`联系人 ${contactId} 详情初始化失败: ${originalError?.message || '未知错误'}`);
    this.name = 'ContactDetailInitFailedException';
  }
} 