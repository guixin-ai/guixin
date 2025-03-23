import { useEffect } from 'react';
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

// 创建选择提及命令
export const SELECT_MENTION_COMMAND: LexicalCommand<ChatContact> = createCommand('SELECT_MENTION_COMMAND');

// 创建移动提及选择命令
export const MOVE_MENTION_SELECTION_COMMAND: LexicalCommand<'up' | 'down'> = createCommand('MOVE_MENTION_SELECTION_COMMAND');

interface MentionKeyboardPluginProps {
  isDropdownOpen?: boolean;
  filteredContactsLength?: number;
  onMoveSelection?: (direction: 'up' | 'down') => void;
  onSelectMention?: () => void;
  onEscape?: () => void;
}

/**
 * 提及键盘导航插件
 * 处理用户在提及列表中的键盘导航
 * 包括上下移动选择和回车/Tab选择等
 */
export function MentionKeyboardPlugin({
  isDropdownOpen = false,
  filteredContactsLength = 0,
  onMoveSelection,
  onSelectMention,
  onEscape,
}: MentionKeyboardPluginProps) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (!editor) return;

    
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
      removeUpListener();
      removeDownListener();
      removeEnterListener();
      removeTabListener();
      removeEscListener();
    };
  }, [editor, isDropdownOpen, filteredContactsLength, onMoveSelection, onSelectMention, onEscape]);
  
  return null;
} 