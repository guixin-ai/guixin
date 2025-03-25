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
 * 或者当文本节点内容为零宽字符且光标位于零宽字符后面位置按退格键时，也删除提及节点
 * 
 * 特殊处理：
 * 1. 删除前检查前后是否有只含零宽字符的文本节点，且不在两个提及节点之间，则一并删除
 * 2. 删除提及节点后，检查前后文本节点并合并
 * 3. 如果合并后的文本节点包含非零宽字符，则删除所有零宽字符
 * 4. 如果合并后的文本节点只包含零宽字符，则只保留一个零宽字符
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

        // 当前节点是文本节点
        if (currentNode instanceof TextNode) {
          const nodeText = currentNode.getTextContent();
          const prevNode = currentNode.getPreviousSibling();
          
          // 满足以下两种条件之一：
          // 1. 光标在文本节点开始位置
          // 2. 文本节点内容是零宽字符，且光标位置在零宽字符后面
          const isAtStart = offset === 0;
          const isAfterZeroWidth = nodeText === '\u200B' && offset === 1;
          
          // 判断前一个节点是否是提及节点
          if (prevNode && $isMentionNode(prevNode) && (isAtStart || isAfterZeroWidth)) {
            logger.debug('光标在文本节点开始位置或零宽字符后，前面是提及节点，准备删除');
            
            // 阻止默认行为
            event?.preventDefault?.();
            
            // 删除提及节点并处理前后文本节点
            editor.update(() => {
              // 保存当前节点和提及节点的前一个节点（可能是文本节点）
              const currentTextNode = currentNode;
              const beforeMentionNode = prevNode.getPreviousSibling();
              
              // 检查前面的节点是否是只包含零宽字符的文本节点
              let shouldDeleteBeforeNode = false;
              if (beforeMentionNode instanceof TextNode && 
                  beforeMentionNode.getTextContent() === '\u200B') {
                // 检查这个零宽字符节点的前面是否是提及节点
                const nodeBefore = beforeMentionNode.getPreviousSibling();
                if (!nodeBefore || !$isMentionNode(nodeBefore)) {
                  // 如果前面不是提及节点，标记为需要删除
                  shouldDeleteBeforeNode = true;
                  logger.debug('提及节点前是只包含零宽字符的文本节点，且不在两个提及节点之间，将一并删除');
                }
              }
              
              // 检查当前节点是否是只包含零宽字符的文本节点
              let shouldDeleteCurrentNode = false;
              if (currentTextNode.getTextContent() === '\u200B') {
                // 检查这个零宽字符节点的后面是否是提及节点
                const nodeAfter = currentTextNode.getNextSibling();
                if (!nodeAfter || !$isMentionNode(nodeAfter)) {
                  // 如果后面不是提及节点，标记为需要删除
                  shouldDeleteCurrentNode = true;
                  logger.debug('提及节点后是只包含零宽字符的文本节点，且不在两个提及节点之间，将一并删除');
                }
              }
              
              // 删除提及节点
              logger.debug('删除提及节点:', prevNode.getMention());
              prevNode.remove();
              
              // 根据判断删除只包含零宽字符的前置节点
              if (shouldDeleteBeforeNode && beforeMentionNode) {
                beforeMentionNode.remove();
                logger.debug('删除提及节点前的零宽字符节点');
              }
              
              // 根据判断删除只包含零宽字符的后置节点
              if (shouldDeleteCurrentNode) {
                currentTextNode.remove();
                logger.debug('删除提及节点后的零宽字符节点');
                
                // 设置光标位置到合适的位置
                if (beforeMentionNode instanceof TextNode && !shouldDeleteBeforeNode) {
                  const selection = $createRangeSelection();
                  selection.anchor.set(beforeMentionNode.getKey(), beforeMentionNode.getTextContent().length, 'text');
                  selection.focus.set(beforeMentionNode.getKey(), beforeMentionNode.getTextContent().length, 'text');
                  $setSelection(selection);
                }
                
                // 如果已经删除了节点，不需要继续合并
                return;
              }
              
              // 处理前后文本节点合并
              // 如果提及节点前后都是文本节点（且未被删除），则需要合并
              if (beforeMentionNode instanceof TextNode && !shouldDeleteBeforeNode && 
                  currentTextNode instanceof TextNode && !shouldDeleteCurrentNode) {
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