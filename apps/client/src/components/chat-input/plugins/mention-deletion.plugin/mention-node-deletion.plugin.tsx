import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  TextNode,
  KEY_BACKSPACE_COMMAND,
  COMMAND_PRIORITY_LOW,
} from 'lexical';
import { $isMentionNode } from '../../nodes';
import { createLogger } from '../../utils/logger';

// 创建日志记录器
const logger = createLogger('提及节点删除');

/**
 * 提及节点删除插件
 * 
 * 该插件负责处理提及节点的删除
 * 当光标在提及节点后的空格节点开始位置按下退格键时，删除提及节点
 * 
 * 特殊处理：
 * 1. 当提及节点前有零宽空格节点，且该节点前面也是提及节点时，不删除该零宽字符节点
 * 2. 当光标所在节点只有一个零宽字符且后面是提及节点时，不删除该节点
 * 3. 如果有多个连续的只包含零宽字符的文本节点，只保留一个
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

        // 情况1：当前节点是文本节点，且前一个节点是提及节点，且光标在开始位置
        if (currentNode instanceof TextNode) {
          const prevNode = currentNode.getPreviousSibling();
          
          // 判断前一个节点是否是提及节点
          if (prevNode && $isMentionNode(prevNode)) {
            logger.debug('当前节点前面有提及节点');
            
            // 判断光标是否在文本节点的开始位置
            if (offset === 0) {
              logger.debug('光标在文本节点开始位置，准备删除前面的提及节点');
              
              // 阻止默认行为
              event?.preventDefault?.();
              
              // 删除提及节点
              editor.update(() => {
                logger.debug('删除提及节点:', prevNode.getMention());
                prevNode.remove();
                
                // 检查提及节点前面的节点
                const beforeMentionNode = prevNode.getPreviousSibling();
                
                // 如果提及节点前有零宽空格节点，判断是否需要删除
                if (beforeMentionNode instanceof TextNode && 
                    beforeMentionNode.getTextContent() === '\u200B') {
                  
                  // 检查零宽空格节点前面是否也是提及节点
                  const nodeBefore = beforeMentionNode.getPreviousSibling();
                  
                  if (nodeBefore && $isMentionNode(nodeBefore)) {
                    // 如果零宽空格前面是提及节点，保留零宽空格节点
                    logger.debug('零宽空格前面也是提及节点，保留零宽空格');
                  } else {
                    // 如果零宽空格前面不是提及节点，删除零宽空格节点
                    logger.debug('删除提及节点前的零宽空格节点');
                    beforeMentionNode.remove();
                  }
                }
              });
              
              logger.info('提及节点删除完成');
              return true;
            }
          }
        }
        
        // 情况2：当前节点是只有一个零宽字符的文本节点
        if (currentNode instanceof TextNode && 
            currentNode.getTextContent() === '\u200B' && 
            offset === 0) {
          
          // 检查后面的节点是否是提及节点
          const nextNode = currentNode.getNextSibling();
          const prevNode = currentNode.getPreviousSibling();
          
          if (nextNode && $isMentionNode(nextNode)) {
            // 如果后面是提及节点，不删除该零宽字符节点
            logger.debug('零宽字符节点后面是提及节点，不删除');
            return false;
          } else if (prevNode && $isMentionNode(prevNode)) {
            // 如果前面是提及节点，检查是否有其他零宽空格节点需要合并
            const prevPrevNode = prevNode.getPreviousSibling();
            
            if (prevPrevNode instanceof TextNode && 
                prevPrevNode.getTextContent() === '\u200B') {
              // 如果前面提及节点的前面也是零宽空格节点，删除当前节点
              logger.debug('发现多个零宽空格节点，删除当前节点');
              
              // 阻止默认行为
              event?.preventDefault?.();
              
              editor.update(() => {
                currentNode.remove();
              });
              
              return true;
            }
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