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
  $isElementNode,
  LexicalNode,
} from 'lexical';
import { $isMentionNode } from '../nodes';
import { 
  isCursorBeforeMentionNode,
  isCursorAfterMentionNode,
  isCursorBeforeMentionGap,
  isCursorAfterMentionGap,
  getMentionNodeBeforePosition,
  getMentionNodeAfterPosition
} from '../utils/cursor-utils';
import { createLogger } from '../utils/logger';

// 创建日志记录器
const logger = createLogger('提及导航');

/**
 * 查找零宽空格前的最近可设置光标位置
 * @throws {Error} 当零宽空格不存在时抛出异常
 */
function findPositionBeforeZeroWidthSpace(textNode: TextNode) {
  const text = textNode.getTextContent();
  const parentNode = textNode.getParent();
  
  // 先检查是否存在零宽空格
  const zeroWidthSpaceIndex = text.indexOf('\u200B');
  if (zeroWidthSpaceIndex === -1) {
    logger.error('文本节点中不存在零宽空格');
    throw new Error('文本节点中不存在零宽空格');
  }
  
  // 检查文本节点是否包含其他字符
  if (text.length > 1) {
    if (zeroWidthSpaceIndex > 0) {
      // 零宽空格前有字符，返回前一个字符的前面位置
      logger.debug('零宽空格前存在字符，返回前一个字符的前面位置');
      return {
        nodeKey: textNode.getKey(),
        offset: zeroWidthSpaceIndex - 1,
        type: 'text',
      };
    } else if (zeroWidthSpaceIndex === 0) {
      // 零宽空格在开头，但后面有其他字符
      logger.debug('零宽空格在开头，需要寻找前一个文本节点');
    }
  }
  
  // 如果只有零宽空格，或零宽空格在开头，找前一个文本节点
  logger.debug('零宽空格是唯一字符或在开头，查找前一个文本节点');
  let previousNode = textNode.getPreviousSibling();
  
  // 跳过非文本节点，找到前一个文本节点
  while (previousNode && !$isTextNode(previousNode)) {
    previousNode = previousNode.getPreviousSibling();
  }
  
  if (previousNode && $isTextNode(previousNode)) {
    // 找到前一个文本节点，返回其末尾位置
    const previousText = previousNode.getTextContent();
    logger.debug('找到前一个文本节点，返回其末尾位置');
    return {
      nodeKey: previousNode.getKey(),
      offset: previousText.length,
      type: 'text',
    };
  } else if (parentNode && $isElementNode(parentNode)) {
    // 如果没有前一个文本节点，但有父节点，返回父节点开头位置
    logger.debug('未找到前一个文本节点，返回父节点开头位置');
    return {
      nodeKey: parentNode.getKey(),
      offset: 0,
      type: 'element',
    };
  }
  
  // 如果都没有，返回当前节点开头
  logger.debug('未找到合适位置，返回当前节点开头');
  return {
    nodeKey: textNode.getKey(),
    offset: 0,
    type: 'text',
  };
}

/**
 * 查找零宽空格后的最近可设置光标位置
 * @throws {Error} 当零宽空格不存在时抛出异常
 */
function findPositionAfterZeroWidthSpace(textNode: TextNode) {
  const text = textNode.getTextContent();
  const parentNode = textNode.getParent();
  
  // 先检查是否存在零宽空格
  const zeroWidthSpaceIndex = text.indexOf('\u200B');
  if (zeroWidthSpaceIndex === -1) {
    logger.error('文本节点中不存在零宽空格');
    throw new Error('文本节点中不存在零宽空格');
  }
  
  // 检查文本节点是否包含其他字符
  if (text.length > 1) {
    if (zeroWidthSpaceIndex < text.length - 1) {
      // 零宽空格后有字符，返回下一个字符的后面位置
      logger.debug('零宽空格后存在字符，返回下一个字符的后面位置');
      return {
        nodeKey: textNode.getKey(),
        offset: zeroWidthSpaceIndex + 2, // 零宽空格后第一个字符的后面
        type: 'text',
      };
    } else if (zeroWidthSpaceIndex === text.length - 1) {
      // 零宽空格在末尾
      logger.debug('零宽空格在末尾，需要寻找下一个文本节点');
    }
  }
  
  // 如果只有零宽空格，或零宽空格在末尾，找下一个文本节点
  logger.debug('零宽空格是唯一字符或在末尾，查找下一个文本节点');
  let nextNode = textNode.getNextSibling();
  
  // 跳过非文本节点，找到下一个文本节点
  while (nextNode && !$isTextNode(nextNode)) {
    nextNode = nextNode.getNextSibling();
  }
  
  if (nextNode && $isTextNode(nextNode)) {
    // 找到下一个文本节点，返回其开头位置
    logger.debug('找到下一个文本节点，返回其开头位置');
    return {
      nodeKey: nextNode.getKey(),
      offset: 0,
      type: 'text',
    };
  } else if (parentNode && $isElementNode(parentNode)) {
    // 如果没有下一个文本节点，但有父节点，返回父节点末尾位置
    const childCount = parentNode.getChildrenSize();
    logger.debug('未找到下一个文本节点，返回父节点末尾位置');
    return {
      nodeKey: parentNode.getKey(),
      offset: childCount,
      type: 'element',
    };
  }
  
  // 如果都没有，返回当前节点末尾
  logger.debug('未找到合适位置，返回当前节点末尾');
  return {
    nodeKey: textNode.getKey(),
    offset: text.length,
    type: 'text',
  };
}

/**
 * 提及导航插件
 * 负责处理提及节点周围的光标键盘左右移动
 * 
 * 主要解决的问题：
 * 1. 向左移动：无论光标在提及节点后方还是后方空隙，都直接跳到提及节点前方
 * 2. 向右移动：无论光标在提及节点前方还是前方空隙，都直接跳到提及节点后方
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

        // 检查以下任一情况：
        // 1. 光标在提及节点后方的零宽空格中
        // 2. 光标在提及节点与后方零宽空格之间的空隙中
        const afterNodeInfo = isCursorAfterMentionNode();
        const afterGapInfo = isCursorAfterMentionGap();
        
        logger.debug('检测结果:', {
          isCursorAfterMentionNode: !!afterNodeInfo,
          isCursorAfterMentionGap: !!afterGapInfo
        });
        
        if (afterNodeInfo || afterGapInfo) {
          // 获取相关的提及节点
          const mentionNode = afterNodeInfo ? 
                              afterNodeInfo.mentionNode : 
                              (afterGapInfo ? afterGapInfo.mentionNode : null);
          
          if (mentionNode) {
            logger.debug('找到需要处理的提及节点:', mentionNode.getTextContent());
            
            // 获取提及节点前的位置信息
            const beforePosition = getMentionNodeBeforePosition(mentionNode);
            if (beforePosition) {
              logger.debug('获取到提及节点前位置:', beforePosition);
              event?.preventDefault?.();
              
              editor.update(() => {
                const selection = $createRangeSelection();
                selection.anchor.set(
                  beforePosition.nodeKey, 
                  beforePosition.offset, 
                  beforePosition.type as 'text' | 'element'
                );
                selection.focus.set(
                  beforePosition.nodeKey, 
                  beforePosition.offset, 
                  beforePosition.type as 'text' | 'element'
                );
                $setSelection(selection);
                logger.debug('已将光标设置到提及节点前');
              });
              
              return true;
            } else {
              logger.debug('未找到提及节点前的位置信息');
            }
          } else {
            logger.debug('未能获取有效的提及节点');
          }
        }
        
        // 检查光标是否在提及节点前面的"夹缝"中
        const beforeGapInfo = isCursorBeforeMentionGap();
        logger.debug('检测光标是否在提及节点前面夹缝:', { isCursorBeforeMentionGap: !!beforeGapInfo });
        
        if (beforeGapInfo) {
          const { mentionNode, zeroWidthSpace } = beforeGapInfo;
          logger.debug('找到提及节点:', mentionNode.getTextContent());
          
          // 新增功能：当光标在前方夹缝中，向左移动时寻找零宽空格前最近的位置
          if ($isTextNode(zeroWidthSpace)) {
            try {
              const nearestPosition = findPositionBeforeZeroWidthSpace(zeroWidthSpace);
              if (nearestPosition) {
                logger.debug('获取到零宽空格前最近位置:', nearestPosition);
                event?.preventDefault?.();
                
                editor.update(() => {
                  const selection = $createRangeSelection();
                  selection.anchor.set(
                    nearestPosition.nodeKey, 
                    nearestPosition.offset, 
                    nearestPosition.type as 'text' | 'element'
                  );
                  selection.focus.set(
                    nearestPosition.nodeKey, 
                    nearestPosition.offset, 
                    nearestPosition.type as 'text' | 'element'
                  );
                  $setSelection(selection);
                  logger.debug('已将光标设置到零宽空格前最近位置');
                });
                
                return true;
              }
            } catch (error) {
              logger.warn('查找零宽空格前位置时出错:', error);
              // 异常情况下使用备选方案，不需要额外处理，会继续执行下面的代码
            }
          }
          
          // 如果新功能处理失败，使用原有逻辑作为备选
          const beforePosition = getMentionNodeBeforePosition(mentionNode);
          if (beforePosition) {
            logger.debug('获取到提及节点前位置:', beforePosition);
            event?.preventDefault?.();
            
            editor.update(() => {
              const selection = $createRangeSelection();
              selection.anchor.set(
                beforePosition.nodeKey, 
                beforePosition.offset, 
                beforePosition.type as 'text' | 'element'
              );
              selection.focus.set(
                beforePosition.nodeKey, 
                beforePosition.offset, 
                beforePosition.type as 'text' | 'element'
              );
              $setSelection(selection);
              logger.debug('已将光标设置到提及节点前');
            });
            
            return true;
          } else {
            logger.debug('未找到提及节点前的位置信息');
          }
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

        // 检查以下任一情况：
        // 1. 光标在提及节点前方的零宽空格中
        // 2. 光标在提及节点与前方零宽空格之间的空隙中
        const beforeNodeInfo = isCursorBeforeMentionNode();
        const beforeGapInfo = isCursorBeforeMentionGap();
        
        logger.debug('检测结果:', {
          isCursorBeforeMentionNode: !!beforeNodeInfo,
          isCursorBeforeMentionGap: !!beforeGapInfo
        });
        
        if (beforeNodeInfo || beforeGapInfo) {
          // 获取相关的提及节点
          const mentionNode = beforeNodeInfo ? 
                              beforeNodeInfo.mentionNode : 
                              (beforeGapInfo ? beforeGapInfo.mentionNode : null);
          
          if (mentionNode) {
            logger.debug('找到需要处理的提及节点:', mentionNode.getTextContent());
            
            // 获取提及节点后的位置信息
            const afterPosition = getMentionNodeAfterPosition(mentionNode);
            if (afterPosition) {
              logger.debug('获取到提及节点后位置:', afterPosition);
              event?.preventDefault?.();
              
              editor.update(() => {
                const selection = $createRangeSelection();
                selection.anchor.set(
                  afterPosition.nodeKey, 
                  afterPosition.offset, 
                  afterPosition.type as 'text' | 'element'
                );
                selection.focus.set(
                  afterPosition.nodeKey, 
                  afterPosition.offset, 
                  afterPosition.type as 'text' | 'element'
                );
                $setSelection(selection);
                logger.debug('已将光标设置到提及节点后');
              });
              
              return true;
            } else {
              logger.debug('未找到提及节点后的位置信息');
            }
          } else {
            logger.debug('未能获取有效的提及节点');
          }
        }
        
        // 检查光标是否在提及节点后面的"夹缝"中
        const afterGapInfo = isCursorAfterMentionGap();
        logger.debug('检测光标是否在提及节点后面夹缝:', { isCursorAfterMentionGap: !!afterGapInfo });
        
        if (afterGapInfo) {
          const { mentionNode, zeroWidthSpace } = afterGapInfo;
          logger.debug('找到提及节点:', mentionNode.getTextContent());
          
          // 新增功能：当光标在后方夹缝中，向右移动时寻找零宽空格后最近的位置
          if ($isTextNode(zeroWidthSpace)) {
            try {
              const nearestPosition = findPositionAfterZeroWidthSpace(zeroWidthSpace);
              if (nearestPosition) {
                logger.debug('获取到零宽空格后最近位置:', nearestPosition);
                event?.preventDefault?.();
                
                editor.update(() => {
                  const selection = $createRangeSelection();
                  selection.anchor.set(
                    nearestPosition.nodeKey, 
                    nearestPosition.offset, 
                    nearestPosition.type as 'text' | 'element'
                  );
                  selection.focus.set(
                    nearestPosition.nodeKey, 
                    nearestPosition.offset, 
                    nearestPosition.type as 'text' | 'element'
                  );
                  $setSelection(selection);
                  logger.debug('已将光标设置到零宽空格后最近位置');
                });
                
                return true;
              }
            } catch (error) {
              logger.warn('查找零宽空格后位置时出错:', error);
              // 异常情况下使用备选方案，不需要额外处理，会继续执行下面的代码
            }
          }
          
          // 如果新功能处理失败，使用原有逻辑作为备选
          const afterPosition = getMentionNodeAfterPosition(mentionNode);
          if (afterPosition) {
            logger.debug('获取到提及节点后位置:', afterPosition);
            event?.preventDefault?.();
            
            editor.update(() => {
              const selection = $createRangeSelection();
              selection.anchor.set(
                afterPosition.nodeKey, 
                afterPosition.offset, 
                afterPosition.type as 'text' | 'element'
              );
              selection.focus.set(
                afterPosition.nodeKey, 
                afterPosition.offset, 
                afterPosition.type as 'text' | 'element'
              );
              $setSelection(selection);
              logger.debug('已将光标设置到提及节点后');
            });
            
            return true;
          } else {
            logger.debug('未找到提及节点后的位置信息');
          }
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