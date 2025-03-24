import {
  $getSelection,
  $isRangeSelection,
  ElementNode,
  LexicalNode,
  TextNode,
} from 'lexical';
import { $isMentionNode } from '../nodes';

// 调试前缀
const DEBUG_PREFIX = '[光标工具]';
// 调试开关
const DEBUG_ENABLED = true;

/**
 * 调试日志
 */
function debug(...args: any[]) {
  if (DEBUG_ENABLED) {
    console.log(DEBUG_PREFIX, ...args);
  }
}

/**
 * 检查节点是否是零宽空格节点（包含匹配，更宽容）
 * 零宽空格可能单独存在，也可能有其他字符
 * 标准格式：[其他字符零宽空格1][提及节点][零宽空格2其他字符]
 */
function isZeroWidthSpaceNode(node: LexicalNode | null): boolean {
  if (!(node instanceof TextNode)) return false;
  
  const text = node.getTextContent();
  const hasZWS = text.includes('\u200B');
  
  if (DEBUG_ENABLED && hasZWS && text !== '\u200B') {
    debug('检测到非纯净的零宽空格节点:', { 
      text,
      containsZWS: hasZWS,
      textLength: text.length,
      charCodes: Array.from(text).map(c => c.charCodeAt(0))
    });
  }
  
  return hasZWS;
}

/**
 * 检查光标是否真的在零宽空格字符上
 * （用于处理包含零宽空格和普通字符的混合节点）
 */
function isCursorOnZeroWidthSpace(node: TextNode, offset: number): boolean {
  const text = node.getTextContent();
  // 检查光标前方或后方的字符是否是零宽空格
  const charBeforeCursor = offset > 0 ? text.charAt(offset - 1) : '';
  const charAfterCursor = offset < text.length ? text.charAt(offset) : '';
  
  const isOnZWS = charBeforeCursor === '\u200B' || charAfterCursor === '\u200B';
  
  if (!isOnZWS) {
    debug('光标不在零宽空格字符上:', {
      offset,
      textContent: text,
      charBeforeCursor,
      charAfterCursor,
      charBeforeCursorCode: charBeforeCursor ? charBeforeCursor.charCodeAt(0) : null,
      charAfterCursorCode: charAfterCursor ? charAfterCursor.charCodeAt(0) : null
    });
  }
  
  return isOnZWS;
}

/**
 * 判断光标是否在提及节点的前面
 * 光标在提及节点前一个零宽字符的前面
 * 标准结构中：光标位于 |[其他字符零宽空格1][提及节点][零宽空格2其他字符]
 * 
 * @returns {object|null} 包含光标位置信息，如果不靠近提及节点则返回null
 */
export function isCursorBeforeMentionNode() {
  const selection = $getSelection();
  
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }
  
  const anchor = selection.anchor;
  const currentNode = anchor.getNode();
  const offset = anchor.offset;
  
  debug('isCursorBeforeMentionNode 检查:', {
    nodeType: currentNode.getType(),
    textContent: currentNode instanceof TextNode ? currentNode.getTextContent() : null,
    offset
  });
  
  // 处理1: 光标在零宽空格节点或混合节点中零宽空格前
  if (currentNode instanceof TextNode && isZeroWidthSpaceNode(currentNode)) {
    const text = currentNode.getTextContent();
    const zwsIndex = text.indexOf('\u200B');
    
    // 如果零宽空格不在开头，并且光标恰好在零宽空格前
    if (zwsIndex > 0 && offset === zwsIndex) {
      debug('光标在混合节点中零宽空格前');
      // 检查下一个节点是否是提及节点
      const nextSibling = currentNode.getNextSibling();
      
      if (nextSibling && $isMentionNode(nextSibling)) {
        // 检查提及节点后面是否有零宽空格
        const afterZeroWidthSpace = nextSibling.getNextSibling();
        
        if (isZeroWidthSpaceNode(afterZeroWidthSpace)) {
          return {
            position: 'before',
            mentionNode: nextSibling,
            zeroWidthSpace: currentNode
          };
        }
      }
    }
  }
  
  // 原有判断：检查光标位置是否在零宽空格节点的前面（offset === 0）
  // 或在段落节点的开始位置
  if (offset === 0) {
    // 1. 检查当前节点是否是零宽空格
    const isCurrentNodeZWS = isZeroWidthSpaceNode(currentNode);
    
    if (isCurrentNodeZWS) {
      // 获取下一个节点，检查是否是提及节点
      const nextSibling = currentNode.getNextSibling();
      
      if (nextSibling && $isMentionNode(nextSibling)) {
        // 检查提及节点后面是否有零宽空格
        const afterZeroWidthSpace = nextSibling.getNextSibling();
        
        if (isZeroWidthSpaceNode(afterZeroWidthSpace)) {
          return {
            position: 'before',
            mentionNode: nextSibling,
            zeroWidthSpace: currentNode
          };
        }
      }
    } else {
      // 2. 检查当前节点是否是元素节点（如段落节点）
      if (currentNode instanceof ElementNode) {
        const firstChild = currentNode.getFirstChild();
        
        if (firstChild && isZeroWidthSpaceNode(firstChild)) {
          const mentionNode = firstChild.getNextSibling();
          
          if (mentionNode && $isMentionNode(mentionNode)) {
            const afterZeroWidthSpace = mentionNode.getNextSibling();
            
            if (isZeroWidthSpaceNode(afterZeroWidthSpace)) {
              return {
                position: 'before',
                mentionNode: mentionNode,
                zeroWidthSpace: firstChild
              };
            }
          }
        }
      }
    }
  }
  
  return null;
}

/**
 * 判断光标是否在提及节点的后面
 * 光标在提及节点后一个零宽字符的后面
 * 标准结构中：光标位于 [其他字符零宽空格1][提及节点][零宽空格2其他字符]|
 * 
 * @returns {object|null} 包含光标位置信息，如果不靠近提及节点则返回null
 */
export function isCursorAfterMentionNode() {
  const selection = $getSelection();
  
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }
  
  const anchor = selection.anchor;
  const currentNode = anchor.getNode();
  const offset = anchor.offset;
  
  debug('isCursorAfterMentionNode 检查:', {
    nodeType: currentNode.getType(),
    textContent: currentNode instanceof TextNode ? currentNode.getTextContent() : null,
    offset
  });
  
  // 检查是否在零宽空格内，使用更宽容的检测
  if (!isZeroWidthSpaceNode(currentNode) || !(currentNode instanceof TextNode)) {
    return null;
  }
  
  // 如果节点包含零宽空格和其他字符，我们需要更精确地检查光标是否真的在零宽空格上
  // 这样可以避免当光标在其他字符上时，误判为在零宽空格后
  const isNodeMixed = currentNode.getTextContent() !== '\u200B';
  
  if (isNodeMixed) {
    // 检查光标是否真的在零宽空格上
    if (!isCursorOnZeroWidthSpace(currentNode, offset)) {
      return null;
    }
  } else {
    // 对于纯零宽空格节点，必须在节点的末尾位置
    const nodeText = currentNode.getTextContent();
    const nodeLength = nodeText.length;
    
    // 检查光标是否在节点末尾
    const isAtEnd = offset === nodeLength || offset >= 1;
    
    if (!isAtEnd) {
      debug('光标不在零宽节点末尾:', { offset, nodeLength });
      return null;
    }
  }
  
  // 检查前节点
  const previousSibling = currentNode.getPreviousSibling();
  
  // 前一个节点必须是提及节点
  if (previousSibling && $isMentionNode(previousSibling)) {
    // 获取提及节点前面的零宽空格
    const beforeZeroWidthSpace = previousSibling.getPreviousSibling();
    
    if (isZeroWidthSpaceNode(beforeZeroWidthSpace)) {
      debug('找到光标在提及节点后的位置');
      return {
        position: 'after',
        mentionNode: previousSibling,
        zeroWidthSpace: currentNode
      };
    }
  }
  
  return null;
}

/**
 * 判断光标是否位于零宽字符和提及节点之间的"夹缝"中（前方）
 * 光标在提及节点前面的零宽字符的后面（零宽字符和提及节点之间）
 * 标准结构中：光标位于 [其他字符零宽空格1]|[提及节点][零宽空格2其他字符]
 * 
 * @returns {object|null} 包含光标位置信息，如果不在"夹缝"中则返回null
 */
export function isCursorBeforeMentionGap() {
  const selection = $getSelection();
  
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }
  
  const anchor = selection.anchor;
  const currentNode = anchor.getNode();
  const offset = anchor.offset;
  
  debug('isCursorBeforeMentionGap 检查:', {
    nodeType: currentNode.getType(),
    textContent: currentNode instanceof TextNode ? currentNode.getTextContent() : null,
    offset
  });
  
  // 检查是否在零宽空格内，使用更宽容的检测
  if (!isZeroWidthSpaceNode(currentNode) || !(currentNode instanceof TextNode)) {
    return null;
  }
  
  // 对于混合节点（包含零宽空格和其他字符），我们需要更精确地检查位置
  const text = currentNode.getTextContent();
  const isNodeMixed = text !== '\u200B';
  
  if (isNodeMixed) {
    // 在混合节点中，检查光标是否在零宽空格后面
    const zwsIndex = text.indexOf('\u200B');
    if (zwsIndex === -1 || offset <= zwsIndex) {
      return null;
    }
  } else {
    // 检查光标是否在节点末尾
    const nodeLength = text.length;
    const isAtEnd = offset === nodeLength || offset >= 1;
    
    if (!isAtEnd) {
      debug('光标不在零宽节点末尾:', { offset, nodeLength });
      return null;
    }
  }
  
  const nextSibling = currentNode.getNextSibling();
  
  // 下一个节点必须是提及节点
  if (nextSibling && $isMentionNode(nextSibling)) {
    debug('找到光标在提及节点前的夹缝位置');
    return {
      position: 'beforeMention',
      mentionNode: nextSibling,
      zeroWidthSpace: currentNode
    };
  }
  
  return null;
}

/**
 * 判断光标是否位于零宽字符和提及节点之间的"夹缝"中（后方）
 * 光标在提及节点后面的零宽字符的前面（提及节点和零宽字符之间）
 * 标准结构中：光标位于 [其他字符零宽空格1][提及节点]|[零宽空格2其他字符]
 * 
 * @returns {object|null} 包含光标位置信息，如果不在"夹缝"中则返回null
 */
export function isCursorAfterMentionGap() {
  const selection = $getSelection();
  
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }
  
  const anchor = selection.anchor;
  const currentNode = anchor.getNode();
  const offset = anchor.offset;
  
  debug('isCursorAfterMentionGap 检查:', {
    nodeType: currentNode.getType(),
    textContent: currentNode instanceof TextNode ? currentNode.getTextContent() : null,
    offset
  });
  
  // 检查是否在零宽空格内，使用更宽容的检测
  if (!isZeroWidthSpaceNode(currentNode) || !(currentNode instanceof TextNode)) {
    return null;
  }
  
  // 对于混合节点，我们需要检查光标是否在零宽空格之前
  const text = currentNode.getTextContent();
  const isNodeMixed = text !== '\u200B';
  
  if (isNodeMixed) {
    // 在混合节点中，检查光标是否在零宽空格前面
    const zwsIndex = text.indexOf('\u200B');
    if (zwsIndex === -1 || offset > zwsIndex) {
      return null;
    }
  } else {
    // 光标必须在开头
    if (offset !== 0) {
      return null;
    }
  }
  
  const previousSibling = currentNode.getPreviousSibling();
  
  // 前一个节点必须是提及节点
  if (previousSibling && $isMentionNode(previousSibling)) {
    debug('找到光标在提及节点后的夹缝位置');
    return {
      position: 'afterMention',
      mentionNode: previousSibling,
      zeroWidthSpace: currentNode
    };
  }
  
  return null;
}

/**
 * 获取提及节点前的精确位置，方便光标定位
 * 针对标准结构：[其他字符零宽空格1][提及节点][零宽空格2其他字符]
 * 
 * @param mentionNode 提及节点
 * @returns 前位置信息，如果没有对应的零宽字符则为null
 */
export function getMentionNodeBeforePosition(mentionNode: LexicalNode) {
  if (!$isMentionNode(mentionNode)) {
    return null;
  }
  
  // 获取前面的零宽空格节点
  const previousSibling = mentionNode.getPreviousSibling();
  
  if (!previousSibling || !isZeroWidthSpaceNode(previousSibling)) {
    debug('提及节点前没有零宽空格节点:', {
      previousNodeType: previousSibling ? previousSibling.getType() : 'null',
      text: previousSibling instanceof TextNode ? previousSibling.getTextContent() : null
    });
    return null;
  }
  
  // 检查是否为混合节点（包含其他字符和零宽空格）
  if (previousSibling instanceof TextNode) {
    const nodeText = previousSibling.getTextContent();
    const isNodeMixed = nodeText !== '\u200B';
    
    if (isNodeMixed) {
      // 找到零宽空格在文本中的位置
      const zwsIndex = nodeText.indexOf('\u200B');
      if (zwsIndex !== -1) {
        debug('提及节点前是混合节点，光标定位到零宽空格前:', { 
          mixedNodeText: nodeText,
          zwsIndex: zwsIndex
        });
        
        // 将光标定位在零宽空格前面
        return {
          nodeKey: previousSibling.getKey(),
          offset: zwsIndex, // 定位到零宽空格前
          type: 'text'
        };
      }
    }
  }
  
  // 对于非混合节点或未找到零宽空格的情况，返回节点开头位置
  debug('提及节点前是纯零宽空格节点，光标定位到节点开头');
  return {
    nodeKey: previousSibling.getKey(),
    offset: 0, // 使用0，即节点开头
    type: 'text'
  };
}

/**
 * 获取提及节点后的精确位置，方便光标定位
 * 针对标准结构：[其他字符零宽空格1][提及节点][零宽空格2其他字符]
 * 
 * @param mentionNode 提及节点
 * @returns 后位置信息，如果没有对应的零宽字符则为null
 */
export function getMentionNodeAfterPosition(mentionNode: LexicalNode) {
  if (!$isMentionNode(mentionNode)) {
    return null;
  }
  
  // 获取后面的零宽空格节点
  const nextSibling = mentionNode.getNextSibling();
  
  if (!nextSibling || !isZeroWidthSpaceNode(nextSibling)) {
    debug('提及节点后没有零宽空格节点:', {
      nextNodeType: nextSibling ? nextSibling.getType() : 'null',
      text: nextSibling instanceof TextNode ? nextSibling.getTextContent() : null
    });
    return null;
  }
  
  // 处理包含零宽空格和普通字符的混合节点
  const nodeText = nextSibling instanceof TextNode ? nextSibling.getTextContent() : '';
  const isNodeMixed = nodeText !== '\u200B';
  
  if (isNodeMixed && nextSibling instanceof TextNode) {
    // 找到零宽空格在文本中的位置
    const zwsIndex = nodeText.indexOf('\u200B');
    if (zwsIndex !== -1) {
      // 将光标定位在零宽空格后面
      return {
        nodeKey: nextSibling.getKey(),
        offset: zwsIndex + 1,
        type: 'text'
      };
    }
  }
  
  // 获取当前节点的文本长度
  const nodeLength = nodeText.length;
  
  // 获取后面位置（零宽字符后面）
  return {
    nodeKey: nextSibling.getKey(),
    // 使用文本长度作为偏移量，确保光标总是在节点末尾
    offset: Math.max(1, nodeLength),
    type: 'text'
  };
} 