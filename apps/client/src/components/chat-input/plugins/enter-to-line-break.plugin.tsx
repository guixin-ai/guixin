import { useEffect } from 'react';
import {
  $createLineBreakNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_NORMAL,
  KEY_ENTER_COMMAND,
  LexicalEditor,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createLogger } from '../utils/logger';

const logger = createLogger('回车插入换行插件');

/**
 * 回车插入换行插件
 * 
 * 该插件会覆盖默认的回车键行为，使得按下回车键时：
 * 1. 不创建新的段落节点（默认行为）
 * 2. 而是插入一个LineBreakNode（换行节点）
 * 
 * 这样就能保持所有内容在同一个段落内，只是视觉上换行
 */
export function EnterToLineBreakPlugin(): React.ReactNode {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 注册对回车键的处理
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
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
      // 使用高优先级，确保覆盖默认的处理程序
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor]);

  // 这个插件不渲染任何UI元素
  return null;
} 