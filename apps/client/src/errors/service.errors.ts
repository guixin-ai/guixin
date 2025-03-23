/**
 * 服务层相关的异常定义
 */

// 基础服务异常
export class ServiceException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceException';
  }
}

// 聊天服务异常
export class ChatServiceException extends ServiceException {
  constructor(message: string) {
    super(message);
    this.name = 'ChatServiceException';
  }
}

// 联系人服务异常
export class ContactServiceException extends ServiceException {
  constructor(message: string) {
    super(message);
    this.name = 'ContactServiceException';
  }
}

// 用户服务异常
export class UserServiceException extends ServiceException {
  constructor(message: string) {
    super(message);
    this.name = 'UserServiceException';
  }
}

// 聊天服务获取失败异常
export class ChatFetchException extends ChatServiceException {
  constructor() {
    super('获取聊天列表失败');
  }
}

// 聊天详情获取失败异常
export class ChatDetailFetchException extends ChatServiceException {
  constructor(chatId: string) {
    super(`获取聊天 ${chatId} 详情失败`);
  }
}

// 聊天消息获取失败异常
export class ChatMessagesFetchException extends ChatServiceException {
  constructor(chatId: string) {
    super(`获取聊天 ${chatId} 消息失败`);
  }
}

// 创建群聊失败异常
export class GroupChatCreationFailedException extends ChatServiceException {
  constructor() {
    super('创建群聊失败');
  }
}

// 联系人列表获取失败异常
export class ContactListFetchException extends ContactServiceException {
  constructor() {
    super('获取联系人列表失败');
  }
}

// 联系人分组获取失败异常
export class ContactGroupFetchException extends ContactServiceException {
  constructor() {
    super('获取联系人分组失败');
  }
}

// 联系人详情获取失败异常
export class ContactDetailFetchException extends ContactServiceException {
  constructor(contactId: string) {
    super(`获取联系人 ${contactId} 详情失败`);
  }
}

// 用户信息获取失败异常
export class UserInfoFetchException extends UserServiceException {
  constructor() {
    super('获取用户信息失败');
  }
} 