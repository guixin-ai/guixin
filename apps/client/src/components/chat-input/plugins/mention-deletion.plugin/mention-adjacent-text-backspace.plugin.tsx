import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  TextNode,
  KEY_BACKSPACE_COMMAND,
  COMMAND_PRIORITY_NORMAL,
  $createRangeSelection,
  $setSelection,
} from 'lexical';
import { $isMentionNode } from '../../nodes';
import { createLogger } from '../../utils/logger';

// 创建日志记录器
const logger = createLogger('提及节点相邻文本退格处理');

/**
 * 提及节点相邻文本退格处理插件
 * 
 * 该插件负责处理与提及节点相邻的文本节点在退格键按下时的特殊处理：
 * 
 * 当删除文本节点的最后一个字符且该节点与提及节点相邻时，将其转换为零宽字符节点
 * 
 * 特殊处理:
 * - 确保与提及节点相邻时，至少保留一个零宽字符节点作为分隔
 * - 如果删除的最后一个字符已经是零宽字符，则跳过处理，交给其他处理程序
 */
export function MentionAdjacentTextBackspacePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;
    
    logger.debug('提及节点相邻文本退格处理插件已初始化');
    
    // 监听回退键事件
    const removeBackspaceListener = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      event => {
        // 获取当前选择
        const selection = $getSelection();
        
        // 只处理范围选择（光标选择）的情况
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }
        
        // 获取光标位置信息
        const anchor = selection.anchor;
        const currentNode = anchor.getNode();
        const offset = anchor.offset;
        
        // 检查当前节点是否是文本节点
        if (currentNode instanceof TextNode) {
          const nodeText = currentNode.getTextContent();
          const prevNode = currentNode.getPreviousSibling();
          const nextNode = currentNode.getNextSibling();
          
          // 处理删除文本节点的最后一个字符且与提及节点相邻的情况
          if (nodeText.length > 0 && offset === nodeText.length) {
            const isPrevMention = prevNode && $isMentionNode(prevNode);
            const isNextMention = nextNode && $isMentionNode(nextNode);
            
            // 如果前面或后面是提及节点，且将要删除最后一个字符
            if ((isPrevMention || isNextMention) && nodeText.length === 1) {
              // 如果最后一个字符已经是零宽字符，跳过处理
              if (nodeText === '\u200B') {
                logger.debug('最后一个字符已经是零宽字符，跳过处理');
                return false;
              }
              
              logger.debug('即将删除与提及节点相邻的文本节点最后一个字符');
              
              // 阻止默认行为
              event?.preventDefault?.();
              
              // 将文本节点转换为零宽字符节点
              editor.update(() => {
                currentNode.setTextContent('\u200B');
                
                // 设置光标位置到零宽字符前
                const selection = $createRangeSelection();
                selection.anchor.set(currentNode.getKey(), 0, 'text');
                selection.focus.set(currentNode.getKey(), 0, 'text');
                $setSelection(selection);
              });
              
              logger.info('文本节点已转换为零宽字符节点，确保与提及节点之间至少有一个零宽字符');
              return true;
            }
          }
        }
        
        return false;
      },
      COMMAND_PRIORITY_NORMAL
    );
    
    return () => {
      removeBackspaceListener();
      logger.debug('提及节点相邻文本退格处理插件已销毁');
    };
  }, [editor]);

  return null;
} 