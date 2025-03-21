/**
 * 指令层 - 提供与后端交互的所有命令
 * 这一层封装了与后端的直接通信，提供类型安全的接口
 */

// 导出联系人指令
export { contactCommands, type ContactResponse } from './contact.commands';

// 导出用户指令
export { userCommands, type UserInfo } from './user.commands';

// 导出聊天指令
export { chatCommands, type ChatListResponse, type ChatListItemResponse } from './chat.commands'; 