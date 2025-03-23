import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  COMMAND_PRIORITY_HIGH,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  createCommand,
  LexicalCommand,
} from 'lexical';
import { SHOW_MENTIONS_COMMAND } from './mention-trigger-plugin';
import { ChatContact } from '..';

// 创建选择联系人命令
export const SELECT_MENTION_COMMAND: LexicalCommand<ChatContact> = createCommand('SELECT_MENTION_COMMAND');

// 创建移动选中项命令
export const MOVE_MENTION_SELECTION_COMMAND: LexicalCommand<'up' | 'down'> = createCommand('MOVE_MENTION_SELECTION_COMMAND');

interface MentionKeyboardPluginProps {
  isDropdownOpen?: boolean;
  filteredContactsLength?: number;
  onMoveSelection?: (direction: 'up' | 'down') => void;
}

export function MentionKeyboardPlugin({
  isDropdownOpen = false,
  filteredContactsLength = 0,
  onMoveSelection,
}: MentionKeyboardPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [dropdownOpen, setDropdownOpen] = useState(isDropdownOpen);
  
  // 更新下拉列表状态
  useEffect(() => {
    setDropdownOpen(isDropdownOpen);
  }, [isDropdownOpen]);
  
  useEffect(() => {
    if (!editor) return;
    
    // 注册上箭头事件 - 向上移动选中项
    const removeUpListener = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (event) => {
        if (dropdownOpen) {
          // 如果下拉列表打开，阻止默认行为并向上移动选中项
          event?.preventDefault();
          
          // 向上移动选中项
          if (onMoveSelection) {
            onMoveSelection('up');
          }
          
          // 发送移动选中项命令
          editor.dispatchCommand(MOVE_MENTION_SELECTION_COMMAND, 'up');
          
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 注册下箭头事件 - 向下移动选中项
    const removeDownListener = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (event) => {
        if (dropdownOpen) {
          // 如果下拉列表打开，阻止默认行为并向下移动选中项
          event?.preventDefault();
          
          // 向下移动选中项
          if (onMoveSelection) {
            onMoveSelection('down');
          }
          
          // 发送移动选中项命令
          editor.dispatchCommand(MOVE_MENTION_SELECTION_COMMAND, 'down');
          
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 注册回车键事件 - 选择当前项
    const removeEnterListener = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        if (dropdownOpen) {
          // 如果下拉列表打开，阻止默认行为并选择当前项
          event?.preventDefault();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 注册Tab键事件 - 选择当前项
    const removeTabListener = editor.registerCommand(
      KEY_TAB_COMMAND,
      (event) => {
        if (dropdownOpen) {
          // 如果下拉列表打开，阻止默认行为并选择当前项
          event?.preventDefault();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 注册Esc键事件 - 关闭下拉列表
    const removeEscListener = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      (event) => {
        if (dropdownOpen) {
          // 如果下拉列表打开，阻止默认行为并关闭下拉列表
          event?.preventDefault();
          
          // 重新聚焦编辑器
          setTimeout(() => {
            editor.focus();
          }, 0);
          
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
    
    return () => {
      removeUpListener();
      removeDownListener();
      removeEnterListener();
      removeTabListener();
      removeEscListener();
    };
  }, [editor, dropdownOpen, filteredContactsLength, onMoveSelection]);
  
  return null;
} 