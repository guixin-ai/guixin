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
import { 
  isCursorAfterMentionGap, 
  isCursorAfterMentionNode
} from '../utils/cursor-utils';

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
 * 当光标在以下位置时按下退格键将会删除提及节点及其前后的零宽空格：
 * 1. 在提及节点后的零宽空格中
 * 2. 在提及节点后方的"夹缝"中
 * 
 * 使用工具函数检测光标位置
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

        // 检查光标是否在提及节点后的"夹缝"中
        const afterGapInfo = isCursorAfterMentionGap();
        
        // 检查光标是否在提及节点后的零宽空格中
        const afterNodeInfo = isCursorAfterMentionNode();
        
        // 如果光标在提及节点的相关位置，需要删除提及节点
        if (afterGapInfo || afterNodeInfo) {
          // 获取相关的提及节点
          let mentionNode = null;
          let zeroWidthSpace = null;
          
          if (afterGapInfo) {
            mentionNode = afterGapInfo.mentionNode;
            zeroWidthSpace = afterGapInfo.zeroWidthSpace;
          } else if (afterNodeInfo) {
            mentionNode = afterNodeInfo.mentionNode;
            zeroWidthSpace = afterNodeInfo.zeroWidthSpace;
          }
          
          if (mentionNode) {
            // 阻止默认行为
            event?.preventDefault?.();
            
            // 获取提及节点前的零宽空格节点
            const beforeZeroWidthSpace = mentionNode.getPreviousSibling();
            
            // 删除提及节点及其前后的零宽空格
            editor.update(() => {
              // 如果前面的节点是文本节点，且包含零宽空格
              if (beforeZeroWidthSpace instanceof TextNode) {
                const text = beforeZeroWidthSpace.getTextContent();
                const zwsIndex = text.indexOf('\u200B');
                
                // 如果是纯零宽空格节点，直接删除
                if (text === '\u200B') {
                  beforeZeroWidthSpace.remove();
                } 
                // 如果是混合节点（包含零宽空格和其他字符）
                else if (zwsIndex !== -1) {
                  // 如果零宽空格在末尾，删除零宽空格
                  if (zwsIndex === text.length - 1) {
                    beforeZeroWidthSpace.setTextContent(text.substring(0, zwsIndex));
                  }
                  // 如果零宽空格不在末尾，保留节点，不做操作
                }
              }
              
              // 删除提及节点
              mentionNode.remove();
              
              // 如果后面的节点是文本节点，且包含零宽空格
              if (zeroWidthSpace instanceof TextNode) {
                const text = zeroWidthSpace.getTextContent();
                const zwsIndex = text.indexOf('\u200B');
                
                // 如果是纯零宽空格节点，直接删除
                if (text === '\u200B') {
                  zeroWidthSpace.remove();
                } 
                // 如果是混合节点（包含零宽空格和其他字符）
                else if (zwsIndex !== -1) {
                  // 如果零宽空格在开头，删除零宽空格
                  if (zwsIndex === 0) {
                    zeroWidthSpace.setTextContent(text.substring(1));
                  }
                  // 如果零宽空格不在开头，保留节点，不做操作
                }
              }
            });
            
            return true;
          }
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
