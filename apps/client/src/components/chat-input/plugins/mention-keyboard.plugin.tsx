import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
  KEY_ESCAPE_COMMAND,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  LexicalCommand
} from 'lexical';
import { ChatContact } from '..';
import { 
  SELECT_MENTION_COMMAND, 
  SHOW_MENTIONS_COMMAND, 
  CANCEL_MENTIONS_COMMAND 
} from '../commands';

// 创建移动提及选择命令
export const MOVE_MENTION_SELECTION_COMMAND: LexicalCommand<'up' | 'down'> = createCommand('MOVE_MENTION_SELECTION_COMMAND');

interface MentionKeyboardPluginProps {
  filteredContactsLength?: number;
  onMoveSelection?: (direction: 'up' | 'down') => void;
  onSelectMention?: () => void;
  onEscape?: () => void;
}

/**
 * 提及键盘导航插件
 * 处理用户在提及列表中的键盘导航
 * 包括上下移动选择和回车/Tab选择等
 * 监听提及列表的显示和隐藏状态，响应键盘事件
 */
export function MentionKeyboardPlugin({
  filteredContactsLength = 0,
  onMoveSelection,
  onSelectMention,
  onEscape,
}: MentionKeyboardPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  useEffect(() => {
    if (!editor) return;

    // 监听显示提及命令
    const removeShowListener = editor.registerCommand(
      SHOW_MENTIONS_COMMAND,
      () => {
        setIsDropdownOpen(true);
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听取消提及命令
    const removeCancelListener = editor.registerCommand(
      CANCEL_MENTIONS_COMMAND,
      () => {
        setIsDropdownOpen(false);
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 注册上方向键事件 - 向上移动选择
    const removeUpListener = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (event) => {
        if (isDropdownOpen) {
          // 如果下拉列表打开，阻止默认行为并向上移动选择
          event?.preventDefault?.();
          
          if (onMoveSelection) {
            onMoveSelection('up');
          } else {
            // 分发移动选择命令
            editor.dispatchCommand(MOVE_MENTION_SELECTION_COMMAND, 'up');
          }
          
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 注册下方向键事件 - 向下移动选择
    const removeDownListener = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (event) => {
        if (isDropdownOpen) {
          // 如果下拉列表打开，阻止默认行为并向下移动选择
          event?.preventDefault?.();
          
          if (onMoveSelection) {
            onMoveSelection('down');
          } else {
            // 分发移动选择命令
            editor.dispatchCommand(MOVE_MENTION_SELECTION_COMMAND, 'down');
          }
          
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
        if (isDropdownOpen) {
          // 如果下拉列表打开，阻止默认行为并选择当前项
          event?.preventDefault?.();
          
          if (onSelectMention) {
            onSelectMention();
          }
          
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
        if (isDropdownOpen) {
          // 如果下拉列表打开，阻止默认行为并选择当前项
          event?.preventDefault?.();
          
          if (onSelectMention) {
            onSelectMention();
          }
          
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
        if (isDropdownOpen) {
          // 如果下拉列表打开，阻止默认行为并关闭下拉列表
          event?.preventDefault?.();
          
          if (onEscape) {
            onEscape();
          } else {
            // 分发取消提及命令
            editor.dispatchCommand(CANCEL_MENTIONS_COMMAND, undefined);
          }
          
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
      removeShowListener();
      removeCancelListener();
      removeUpListener();
      removeDownListener();
      removeEnterListener();
      removeTabListener();
      removeEscListener();
    };
  }, [editor, isDropdownOpen, filteredContactsLength, onMoveSelection, onSelectMention, onEscape]);
  
  return null;
} 