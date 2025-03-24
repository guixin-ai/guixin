import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  TextNode,
  $getSelection,
  $isRangeSelection,
  $createRangeSelection,
  $setSelection,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { $isMentionNode } from '../nodes';
import { 
  getMentionNodeBeforeCursor,
  getMentionNodeAfterCursor,
  getZeroWidthSpacesAroundNode 
} from '../utils/cursor-utils';

/**
 * 提及导航插件
 * 负责处理提及节点周围的光标键盘左右移动
 * 
 * 主要解决的问题：
 * 1. 当光标在提及节点后的零宽空格（前面或后面），按左方向键时，直接跳到提及节点前的零宽空格前面
 * 2. 当光标在提及节点前的零宽空格（前面或后面），按右方向键时，直接跳到提及节点后的零宽空格后面
 * 
 * 使用工具函数处理各种光标位置情况，不受光标移动方向的影响
 */
export function MentionNavigationPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;

    // 监听左方向键事件
    const removeLeftArrowListener = editor.registerCommand(
      KEY_ARROW_LEFT_COMMAND,
      (event) => {
        // 获取当前选择
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        // 使用工具函数获取光标前的提及节点信息
        const mentionInfo = getMentionNodeBeforeCursor();
        
        // 如果光标前有提及节点，且光标位于提及节点后方
        if (mentionInfo) {
          const { mentionNode, beforeZeroWidthSpace } = mentionInfo;
          
          // 如果提及节点前面有零宽空格，将光标移到它前面
          if (beforeZeroWidthSpace) {
            event?.preventDefault?.();
            
            editor.update(() => {
              const selection = $createRangeSelection();
              selection.anchor.set(beforeZeroWidthSpace.getKey(), 0, 'text');
              selection.focus.set(beforeZeroWidthSpace.getKey(), 0, 'text');
              $setSelection(selection);
            });
            
            return true;
          }
        }
        
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    // 监听右方向键事件
    const removeRightArrowListener = editor.registerCommand(
      KEY_ARROW_RIGHT_COMMAND,
      (event) => {
        // 获取当前选择
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        // 使用工具函数获取光标后的提及节点信息
        const mentionInfo = getMentionNodeAfterCursor();
        
        // 如果光标后有提及节点，且光标位于提及节点前方
        if (mentionInfo) {
          const { mentionNode, afterZeroWidthSpace } = mentionInfo;
          
          // 如果提及节点后面有零宽空格，将光标移到它后面
          if (afterZeroWidthSpace) {
            event?.preventDefault?.();
            
            editor.update(() => {
              const selection = $createRangeSelection();
              selection.anchor.set(afterZeroWidthSpace.getKey(), 1, 'text');
              selection.focus.set(afterZeroWidthSpace.getKey(), 1, 'text');
              $setSelection(selection);
            });
            
            return true;
          }
        }
        
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      removeLeftArrowListener();
      removeRightArrowListener();
    };
  }, [editor]);

  return null;
} 