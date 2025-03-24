import { createCommand } from 'lexical';
import { ChatContact } from '..';

/**
 * 提及功能命令定义
 * 这个文件集中定义了所有与@提及功能相关的命令
 */

/**
 * 显示提及列表命令
 * 当用户输入@时触发，通知显示提及列表
 */
export const SHOW_MENTIONS_COMMAND = createCommand<void>('SHOW_MENTIONS_COMMAND');

/**
 * 取消提及命令
 * 当用户按下Esc、删除@字符或输入空格时触发
 */
export const CANCEL_MENTIONS_COMMAND = createCommand<void>('CANCEL_MENTIONS_COMMAND');

/**
 * 选择提及联系人命令
 * 当用户选择一个联系人时触发
 */
export const SELECT_MENTION_COMMAND = createCommand<ChatContact>('SELECT_MENTION_COMMAND');

/**
 * 选择当前高亮的提及联系人命令
 * 当用户按下回车键或Tab键选择当前高亮联系人时触发
 */
export const SELECT_HIGHLIGHTED_MENTION_COMMAND = createCommand<void>('SELECT_HIGHLIGHTED_MENTION_COMMAND');

/**
 * 提及内容更新命令
 * 当用户在@后输入内容时触发，用于实时更新过滤内容
 */
export const MENTION_CONTENT_UPDATE_COMMAND = createCommand<{
  searchText: string;
}>('MENTION_CONTENT_UPDATE_COMMAND');

/**
 * 提及位置更新命令
 * 用于更新提及列表的位置
 */
export const MENTION_POSITION_UPDATE_COMMAND = createCommand<{
  position: { left: number; top: number };
}>('MENTION_POSITION_UPDATE_COMMAND');

/**
 * 提及过滤更新命令
 * 用于通知联系人列表过滤结果
 */
export const MENTION_FILTER_UPDATE_COMMAND = createCommand<{
  searchText: string;
  filteredContacts: ChatContact[];
}>('MENTION_FILTER_UPDATE_COMMAND'); 