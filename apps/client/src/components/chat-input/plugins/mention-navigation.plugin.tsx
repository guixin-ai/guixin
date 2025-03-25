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
  $isTextNode,
  LexicalNode,
} from 'lexical';
import { $isMentionNode } from '../nodes';
import { createLogger } from '../utils/logger';

// 创建日志记录器
const logger = createLogger('提及导航');

/**
 * 判断节点是否是零宽空格节点
 * @param node 要检查的节点
 * @returns 是否是零宽空格节点
 */
function isZeroWidthSpaceNode(node: LexicalNode | null): boolean {
  if (!node || !$isTextNode(node)) return false;
  return node.getTextContent() === '\u200B';
}

/**
 * 获取零宽空格节点相邻提及节点的位置信息
 * 
 * @param zeroWidthSpace 零宽空格文本节点
 * @param direction 移动方向，'left' 或 'right'
 * @returns 位置信息，包含目标节点的键和偏移量
 */
function getAdjacentMentionPosition(zeroWidthSpace: TextNode, direction: 'left' | 'right') {
  logger.debug(`获取零宽空格节点的${direction === 'left' ? '左' : '右'}侧提及节点位置`);
  
  // 根据方向获取相邻的提及节点
  let mentionNode = null;
  let targetNode = null;
  
  if (direction === 'left') {
    // 向左移动，查找前一个提及节点
    const previousNode = zeroWidthSpace.getPreviousSibling();
    
    if (previousNode && $isMentionNode(previousNode)) {
      mentionNode = previousNode;
      // 获取提及节点前的节点（应该是另一个零宽空格节点）
      targetNode = previousNode.getPreviousSibling();
    }
  } else {
    // 向右移动，查找后一个提及节点
    const nextNode = zeroWidthSpace.getNextSibling();
    
    if (nextNode && $isMentionNode(nextNode)) {
      mentionNode = nextNode;
      // 获取提及节点后的节点（应该是另一个零宽空格节点）
      targetNode = nextNode.getNextSibling();
    }
  }
  
  if (!mentionNode || !targetNode || !$isTextNode(targetNode)) {
    logger.debug('未找到有效的提及节点或目标文本节点');
    return null;
  }
  
  logger.debug('找到目标文本节点:', targetNode.getTextContent());
  
  // 返回目标位置
  return {
    nodeKey: targetNode.getKey(),
    offset: direction === 'left' ? targetNode.getTextContent().length : 0,
    type: 'text' as const
  };
}

/**
 * 提及导航插件
 * 负责处理提及节点周围的光标键盘左右移动
 * 
 * 主要解决的问题：
 * 1. 向左移动：当光标在零宽空格文本节点中时，直接跳到相邻提及节点前方文本节点的末尾位置
 * 2. 向右移动：当光标在零宽空格文本节点中时，直接跳到相邻提及节点后方文本节点的开始位置
 * 
 * 这样在编辑过程中，提及节点就像一个整体，光标不会卡在中间状态
 */
export function MentionNavigationPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;

    logger.debug('插件已初始化');

    // 监听左方向键事件
    const removeLeftArrowListener = editor.registerCommand(
      KEY_ARROW_LEFT_COMMAND,
      (event) => {
        logger.debug('检测到左方向键按下');
        
        // 获取当前选择
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          logger.debug('非范围选择或选择未折叠，跳过处理');
          return false;
        }

        // 获取并记录当前光标位置信息
        const anchor = selection.anchor;
        const currentNode = anchor.getNode();
        const offset = anchor.offset;
        logger.debug('当前光标位置:', {
          nodeType: currentNode.getType(),
          nodeText: currentNode instanceof TextNode ? currentNode.getTextContent() : '非文本节点',
          offset
        });

        // 判断当前是否在零宽空格节点上
        if (!$isTextNode(currentNode) || !isZeroWidthSpaceNode(currentNode)) {
          logger.debug('不在零宽空格节点上，跳过处理');
          return false;
        }

        // 获取相邻的左侧提及节点位置
        const position = getAdjacentMentionPosition(currentNode, 'left');
        
        if (position) {
          logger.debug('获取到左侧提及节点的前一节点位置:', position);
          event?.preventDefault?.();
          
          editor.update(() => {
            const selection = $createRangeSelection();
            selection.anchor.set(
              position.nodeKey, 
              position.offset, 
              position.type
            );
            selection.focus.set(
              position.nodeKey, 
              position.offset, 
              position.type
            );
            $setSelection(selection);
            logger.debug('已将光标设置到左侧提及节点的前一文本节点');
          });
          
          return true;
        }
        
        logger.debug('未匹配到需要处理的情况，交由默认处理');
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    // 监听右方向键事件
    const removeRightArrowListener = editor.registerCommand(
      KEY_ARROW_RIGHT_COMMAND,
      (event) => {
        logger.debug('检测到右方向键按下');
        
        // 获取当前选择
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          logger.debug('非范围选择或选择未折叠，跳过处理');
          return false;
        }

        // 获取并记录当前光标位置信息
        const anchor = selection.anchor;
        const currentNode = anchor.getNode();
        const offset = anchor.offset;
        logger.debug('当前光标位置:', {
          nodeType: currentNode.getType(),
          nodeText: currentNode instanceof TextNode ? currentNode.getTextContent() : '非文本节点',
          offset
        });

        // 判断当前是否在零宽空格节点上
        if (!$isTextNode(currentNode) || !isZeroWidthSpaceNode(currentNode)) {
          logger.debug('不在零宽空格节点上，跳过处理');
          return false;
        }

        // 获取相邻的右侧提及节点位置
        const position = getAdjacentMentionPosition(currentNode, 'right');
        
        if (position) {
          logger.debug('获取到右侧提及节点的后一节点位置:', position);
          event?.preventDefault?.();
          
          editor.update(() => {
            const selection = $createRangeSelection();
            selection.anchor.set(
              position.nodeKey, 
              position.offset, 
              position.type
            );
            selection.focus.set(
              position.nodeKey, 
              position.offset, 
              position.type
            );
            $setSelection(selection);
            logger.debug('已将光标设置到右侧提及节点的后一文本节点');
          });
          
          return true;
        }
        
        logger.debug('未匹配到需要处理的情况，交由默认处理');
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      logger.debug('插件销毁');
      removeLeftArrowListener();
      removeRightArrowListener();
    };
  }, [editor]);

  return null;
} 