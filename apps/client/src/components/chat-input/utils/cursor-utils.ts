import {
  $getSelection,
  $isRangeSelection,
  LexicalNode,
  TextNode,
  RangeSelection,
} from 'lexical';
import { $isMentionNode } from '../nodes';

/**
 * 光标相关的工具函数
 */

/**
 * 获取光标位置的前后节点信息
 * 该函数处理光标在零宽字符前后的特殊情况，不受光标移动方向的影响
 * 
 * @returns {object} 包含光标前后节点的信息
 */
export function getCursorSurroundingNodes() {
  const selection = $getSelection();
  
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }
  
  const anchor = selection.anchor;
  const currentNode = anchor.getNode();
  const offset = anchor.offset;
  
  // 获取当前节点的前后相邻节点
  const previousSibling = currentNode.getPreviousSibling();
  const nextSibling = currentNode.getNextSibling();
  
  return {
    currentNode,
    offset,
    previousSibling,
    nextSibling,
    // 如果光标在节点开始位置
    isAtNodeStart: offset === 0,
    // 如果光标在节点结束位置
    isAtNodeEnd: offset === (currentNode instanceof TextNode ? currentNode.getTextContentSize() : 0),
    // 当前节点是否是零宽空格
    isZeroWidthSpace: currentNode instanceof TextNode && currentNode.getTextContent() === '\u200B',
    // 前一个节点是否是提及节点
    isPreviousMention: previousSibling !== null && $isMentionNode(previousSibling),
    // 后一个节点是否是提及节点
    isNextMention: nextSibling !== null && $isMentionNode(nextSibling),
  };
}

/**
 * 获取节点周围的零宽空格节点
 * 用于获取提及节点前后的零宽空格
 * 
 * @param node 目标节点
 * @returns 包含前后零宽空格节点的对象
 */
export function getZeroWidthSpacesAroundNode(node: LexicalNode) {
  const previousSibling = node.getPreviousSibling();
  const nextSibling = node.getNextSibling();
  
  const beforeZeroWidthSpace = 
    previousSibling instanceof TextNode && 
    previousSibling.getTextContent() === '\u200B' 
      ? previousSibling 
      : null;
      
  const afterZeroWidthSpace = 
    nextSibling instanceof TextNode && 
    nextSibling.getTextContent() === '\u200B' 
      ? nextSibling 
      : null;
  
  return {
    beforeZeroWidthSpace,
    afterZeroWidthSpace,
  };
}

/**
 * 获取光标前的提及节点（如果存在）
 * 处理以下情况：
 * 1. 光标在零宽空格内，前面是提及节点
 * 2. 光标在节点开头，前一个节点是零宽空格，再前一个是提及节点
 * 
 * @returns 光标前的提及节点及其相关信息，如果不存在则返回null
 */
export function getMentionNodeBeforeCursor() {
  const surroundingNodes = getCursorSurroundingNodes();
  
  if (!surroundingNodes) {
    return null;
  }
  
  const { 
    currentNode, 
    offset, 
    previousSibling, 
    isAtNodeStart, 
    isZeroWidthSpace 
  } = surroundingNodes;
  
  // 情况1: 当前节点是零宽空格，前面是提及节点
  if (isZeroWidthSpace && previousSibling && $isMentionNode(previousSibling)) {
    const { beforeZeroWidthSpace } = getZeroWidthSpacesAroundNode(previousSibling);
    
    return {
      mentionNode: previousSibling,
      currentZeroWidthSpace: currentNode,
      beforeZeroWidthSpace,
      isCursorInZeroWidthSpace: true,
      offset,
    };
  }
  
  // 情况2: 光标在节点开始位置，前一个节点是零宽空格
  if (isAtNodeStart && previousSibling instanceof TextNode && previousSibling.getTextContent() === '\u200B') {
    const mentionNode = previousSibling.getPreviousSibling();
    
    if (mentionNode && $isMentionNode(mentionNode)) {
      const { beforeZeroWidthSpace } = getZeroWidthSpacesAroundNode(mentionNode);
      
      return {
        mentionNode,
        currentZeroWidthSpace: previousSibling,
        beforeZeroWidthSpace,
        isCursorInZeroWidthSpace: false,
        offset: 0,
      };
    }
  }
  
  return null;
}

/**
 * 获取光标后的提及节点（如果存在）
 * 
 * @returns 光标后的提及节点及相关信息，如果不存在则返回null
 */
export function getMentionNodeAfterCursor() {
  const surroundingNodes = getCursorSurroundingNodes();
  
  if (!surroundingNodes) {
    return null;
  }
  
  const { 
    currentNode, 
    offset, 
    nextSibling, 
    isAtNodeEnd, 
    isZeroWidthSpace 
  } = surroundingNodes;
  
  // 情况1: 当前节点是零宽空格，后面是提及节点
  if (isZeroWidthSpace && nextSibling && $isMentionNode(nextSibling)) {
    const { afterZeroWidthSpace } = getZeroWidthSpacesAroundNode(nextSibling);
    
    return {
      mentionNode: nextSibling,
      currentZeroWidthSpace: currentNode,
      afterZeroWidthSpace,
      isCursorInZeroWidthSpace: true,
      offset,
    };
  }
  
  // 情况2: 光标在节点结束位置，后一个节点是零宽空格
  if (isAtNodeEnd && nextSibling instanceof TextNode && nextSibling.getTextContent() === '\u200B') {
    const mentionNode = nextSibling.getNextSibling();
    
    if (mentionNode && $isMentionNode(mentionNode)) {
      const { afterZeroWidthSpace } = getZeroWidthSpacesAroundNode(mentionNode);
      
      return {
        mentionNode,
        currentZeroWidthSpace: nextSibling,
        afterZeroWidthSpace,
        isCursorInZeroWidthSpace: false,
        offset,
      };
    }
  }
  
  return null;
} 