import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  TextNode,
  KEY_BACKSPACE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $createRangeSelection, 
  $setSelection,
} from 'lexical';
import { $isMentionNode } from '../../nodes';
import { createLogger } from '../../utils/logger';

// 创建日志记录器
const logger = createLogger('提及节点删除');

/**
 * 提及节点删除插件
 * 
 * 该插件负责处理提及节点的删除
 * 当光标在提及节点后的文本节点开始位置按下退格键时，删除提及节点
 * 
 * 特殊处理：
 * 1. 删除提及节点后，检查前后文本节点并合并
 * 2. 如果合并后的文本节点包含非零宽字符，则删除所有零宽字符
 * 3. 如果合并后的文本节点只包含零宽字符，则只保留一个零宽字符
 */
export function MentionNodeDeletionPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;

    logger.debug('提及节点删除插件已初始化');

    // 监听回退键事件，处理提及节点的删除
    const removeBackspaceListener = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      event => {
        logger.debug('检测到退格键按下');
        
        // 获取当前选择
        const selection = $getSelection();

        // 只处理范围选择（光标选择）的情况
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          logger.debug('非范围选择或选择未折叠，跳过处理');
          return false;
        }

        // 获取光标位置信息
        const anchor = selection.anchor;
        const currentNode = anchor.getNode();
        const offset = anchor.offset;
        
        logger.debug('当前光标位置:', {
          nodeType: currentNode.getType(),
          nodeText: currentNode instanceof TextNode ? currentNode.getTextContent() : '非文本节点',
          offset
        });

        // 当前节点是文本节点，且光标在开始位置，且前一个节点是提及节点
        if (currentNode instanceof TextNode && offset === 0) {
          const prevNode = currentNode.getPreviousSibling();
          
          // 判断前一个节点是否是提及节点
          if (prevNode && $isMentionNode(prevNode)) {
            logger.debug('光标在文本节点开始位置，前面是提及节点，准备删除');
            
            // 阻止默认行为
            event?.preventDefault?.();
            
            // 删除提及节点并处理前后文本节点
            editor.update(() => {
              // 保存当前节点和提及节点的前一个节点（可能是文本节点）
              const currentTextNode = currentNode;
              const beforeMentionNode = prevNode.getPreviousSibling();
              
              // 删除提及节点
              logger.debug('删除提及节点:', prevNode.getMention());
              prevNode.remove();
              
              // 处理前后文本节点合并
              // 如果提及节点前后都是文本节点，则需要合并
              if (beforeMentionNode instanceof TextNode && currentTextNode instanceof TextNode) {
                logger.debug('提及节点前后都是文本节点，准备合并');
                
                // 获取两个文本节点的内容
                const beforeText = beforeMentionNode.getTextContent();
                const afterText = currentTextNode.getTextContent();
                
                // 合并文本内容
                let combinedText = beforeText + afterText;
                
                // 处理零宽字符
                // 检查合并后的文本是否只包含零宽字符
                const hasNonZeroWidthChar = combinedText.replace(/\u200B/g, '').length > 0;
                
                if (hasNonZeroWidthChar) {
                  // 如果包含非零宽字符，则删除所有零宽字符
                  logger.debug('合并后的文本包含非零宽字符，删除所有零宽字符');
                  combinedText = combinedText.replace(/\u200B/g, '');
                } else {
                  // 如果只包含零宽字符，则只保留一个
                  logger.debug('合并后的文本只包含零宽字符，只保留一个');
                  combinedText = '\u200B';
                }
                
                // 更新前一个文本节点的内容
                beforeMentionNode.setTextContent(combinedText);
                
                // 删除当前文本节点，因为内容已合并到前一个节点
                currentTextNode.remove();
                
                // 设置光标位置到合并后的文本节点的正确位置
                // 如果之前的文本节点只有零宽字符，则光标应该在零宽字符后
                // 否则光标应该在原来前一个节点的内容后面
                const selection = $createRangeSelection();
                const cursorPosition = beforeText.length;
                selection.anchor.set(beforeMentionNode.getKey(), cursorPosition, 'text');
                selection.focus.set(beforeMentionNode.getKey(), cursorPosition, 'text');
                $setSelection(selection);
              }
              
              logger.info('提及节点删除完成，并处理了前后文本节点');
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
      logger.debug('提及节点删除插件已销毁');
    };
  }, [editor]);

  return null;
} 