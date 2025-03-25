import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_HIGH } from 'lexical';
import { SHOW_MENTIONS_COMMAND, CANCEL_MENTIONS_COMMAND } from '../commands';
import { useMentionState } from '../models';
import { createLogger } from '../utils/logger';

const logger = createLogger('提及状态插件');

/**
 * 提及状态管理插件
 * 
 * 职责：
 * 1. 监听提及相关命令（显示/取消）
 * 2. 更新全局状态管理中的提及状态
 * 3. 将状态从组件内部提取到全局状态管理
 */
export function MentionStatePlugin(): React.ReactNode {
  const [editor] = useLexicalComposerContext();
  const { openDropdown, closeDropdown } = useMentionState();
  
  useEffect(() => {
    if (!editor) return;
    
    // 监听显示提及命令
    const removeShowListener = editor.registerCommand(
      SHOW_MENTIONS_COMMAND,
      () => {
        logger.debug('收到显示提及命令');
        openDropdown();
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听取消提及命令
    const removeCancelListener = editor.registerCommand(
      CANCEL_MENTIONS_COMMAND,
      () => {
        logger.debug('收到取消提及命令');
        closeDropdown();
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    return () => {
      removeShowListener();
      removeCancelListener();
    };
  }, [editor, openDropdown, closeDropdown]);
  
  return null;
} 