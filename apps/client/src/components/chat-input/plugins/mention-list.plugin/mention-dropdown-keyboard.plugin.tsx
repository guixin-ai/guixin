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
import { 
  SELECT_MENTION_COMMAND, 
  SELECT_HIGHLIGHTED_MENTION_COMMAND,
  CANCEL_MENTIONS_COMMAND
} from '../../commands';
import { useMentionState } from '../../models';
import { createLogger } from '../../utils/logger';

const logger = createLogger('提及键盘导航');

// 创建移动提及选择命令
export const MOVE_MENTION_SELECTION_COMMAND: LexicalCommand<'up' | 'down'> = createCommand('MOVE_MENTION_SELECTION_COMMAND');

interface MentionDropdownKeyboardPluginProps {
  // 移除所有回调属性
}

/**
 * 提及键盘导航插件
 * 处理用户在提及列表中的键盘导航
 * 包括上下移动选择和回车/Tab选择等
 * 使用全局状态管理监听提及列表的显示状态，响应键盘事件
 * 通过命令与其他插件通信
 */
export function MentionDropdownKeyboardPlugin({}: MentionDropdownKeyboardPluginProps) {
  const [editor] = useLexicalComposerContext();
  // 使用全局状态替代本地状态
  const { isDropdownOpen } = useMentionState();
  
  useEffect(() => {
    if (!editor) return;
    
    // 注册上方向键事件 - 向上移动选择
    const removeUpListener = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (event) => {
        if (isDropdownOpen) {
          // 如果下拉列表打开，阻止默认行为并向上移动选择
          event?.preventDefault?.();
          
          // 分发移动选择命令
          editor.dispatchCommand(MOVE_MENTION_SELECTION_COMMAND, 'up');
          
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
          
          // 分发移动选择命令
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
        if (isDropdownOpen) {
          logger.debug('提及状态下拉框打开状态下，拦截回车事件');
          // 如果下拉列表打开，阻止默认行为并选择当前项
          event?.preventDefault?.();
          
          // 分发选择高亮提及命令
          editor.dispatchCommand(SELECT_HIGHLIGHTED_MENTION_COMMAND, undefined);
          
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
          
          // 分发选择高亮提及命令
          editor.dispatchCommand(SELECT_HIGHLIGHTED_MENTION_COMMAND, undefined);
          
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
          
          // 分发取消提及命令
          editor.dispatchCommand(CANCEL_MENTIONS_COMMAND, undefined);
          
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
  }, [editor, isDropdownOpen]);
  
  return null;
} 