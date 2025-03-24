import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  TextNode,
  KEY_BACKSPACE_COMMAND,
  COMMAND_PRIORITY_LOW,
} from 'lexical';
import { $isMentionNode } from '../nodes';
import { getMentionNodeBeforeCursor } from '../utils/cursor-utils';

/**
 * 提及删除插件
 * 负责处理提及节点的删除
 * 
 * 提及节点的结构：
 * 1. 提及节点前: 零宽空格节点 (\u200B)
 * 2. 提及节点
 * 3. 提及节点后: 零宽空格节点 (\u200B)
 * 4. 普通空格节点 (' ')
 * 
 * 当光标在提及节点后方(无论是在零宽空格内部还是在紧随其后的节点起始处)时，
 * 按下退格键将会删除提及节点及其前后的零宽空格。
 * 
 * 使用工具函数getMentionNodeBeforeCursor处理所有可能的情况，不受光标移动方向的影响。
 */
export function MentionDeletionPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;

    // 监听回退键事件，处理提及节点的删除
    const removeBackspaceListener = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      event => {
        // 获取当前选择
        const selection = $getSelection();

        // 只处理范围选择（光标选择）的情况
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        // 使用工具函数获取光标前的提及节点信息
        const mentionInfo = getMentionNodeBeforeCursor();
        
        // 如果光标前有提及节点，且光标位于提及节点后方
        if (mentionInfo) {
          const { 
            mentionNode,            // 提及节点
            currentZeroWidthSpace,  // 当前光标所在的零宽空格节点
            beforeZeroWidthSpace,   // 提及节点前的零宽空格节点
          } = mentionInfo;
          
          // 阻止默认行为
          event?.preventDefault?.();
          
          // 删除提及节点及其前后的零宽空格
          editor.update(() => {
            if (beforeZeroWidthSpace) {
              beforeZeroWidthSpace.remove();
            }
            mentionNode.remove();
            currentZeroWidthSpace.remove();
          });
          
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_LOW // 使用较低优先级，以允许其他处理程序先处理
    );

    return () => {
      removeBackspaceListener();
    };
  }, [editor]);

  return null;
}
