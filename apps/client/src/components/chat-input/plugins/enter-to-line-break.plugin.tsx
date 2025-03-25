import { useEffect } from 'react';
import {
  $createLineBreakNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_NORMAL,
  KEY_ENTER_COMMAND,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMentionState } from '../models';
import { createLogger } from '../utils/logger';

const logger = createLogger('回车插入换行插件');

/**
 * 回车插入换行插件
 * 
 * 该插件会覆盖默认的回车键行为，使得按下回车键时：
 * 1. 不创建新的段落节点（默认行为）
 * 2. 而是插入一个LineBreakNode（换行节点）
 * 
 * 注意事项：
 * - 只有在提及下拉框未打开时才会响应回车事件
 * - 这样能保持所有内容在同一个段落内，只是视觉上换行
 */
export function EnterToLineBreakPlugin(): React.ReactNode {
  const [editor] = useLexicalComposerContext();
  // 使用全局提及状态
  const { isDropdownOpen } = useMentionState();

  useEffect(() => {
    // 注册对回车键的处理
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        // 如果提及下拉框正在打开状态，不处理回车事件
        if (isDropdownOpen) {
          logger.debug('提及下拉框打开状态，不处理回车事件');
          return false;
        }

        const selection = $getSelection();
        
        // 只处理范围选择（普通的光标选择）
        if (!$isRangeSelection(selection)) {
          return false;
        }

        // 如果有原生事件对象，阻止默认行为
        if (event !== null) {
          event.preventDefault();
        }

        // 在选择位置插入一个LineBreakNode
        selection.insertNodes([$createLineBreakNode()]);
        
        logger.debug('已插入换行节点');
        
        // 返回true表示命令已处理，不需要继续传递
        return true;
      },
      // 使用正常优先级，让提及下拉框的处理有机会先执行
      COMMAND_PRIORITY_HIGH
    );
  }, [editor, isDropdownOpen]);

  // 这个插件不渲染任何UI元素
  return null;
} 