/**
 * 聊天模块相关的异常定义
 */

// 聊天未找到异常
export class ChatNotFoundException extends Error {
  constructor(chatId: string) {
    super(`聊天 ${chatId} 不存在`);
    this.name = 'ChatNotFoundException';
  }
}

// 聊天消息初始化失败异常
export class ChatMessagesInitFailedException extends Error {
  readonly originalError?: unknown;
  
  constructor(chatId: string, originalError?: unknown) {
    super(`初始化聊天 ${chatId} 的消息失败`);
    this.name = 'ChatMessagesInitFailedException';
    this.originalError = originalError;
  }
}

// 聊天列表初始化失败异常
export class ChatListInitFailedException extends Error {
  readonly originalError?: unknown;
  
  constructor(originalError?: unknown) {
    super('初始化聊天列表失败');
    this.name = 'ChatListInitFailedException';
    this.originalError = originalError;
  }
}

// 聊天详情初始化失败异常
export class ChatDetailInitFailedException extends Error {
  readonly originalError?: unknown;
  
  constructor(chatId: string, originalError?: unknown) {
    super(`初始化聊天 ${chatId} 的详情失败`);
    this.name = 'ChatDetailInitFailedException';
    this.originalError = originalError;
  }
}

// 创建群聊失败异常
export class GroupChatCreationFailedException extends Error {
  readonly originalError?: unknown;
  
  constructor(message: string = '创建群聊失败', originalError?: unknown) {
    super(message);
    this.name = 'GroupChatCreationFailedException';
    this.originalError = originalError;
  }
} 