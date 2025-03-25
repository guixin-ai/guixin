import { PointType, RangeSelection } from 'lexical';

/**
 * 选择相关工具函数
 */

/**
 * 检查锚点和焦点是否重叠
 * 重叠意味着用户没有选择范围，只有一个光标位置
 * 
 * @param selection 范围选择对象
 * @returns 如果锚点和焦点重叠则返回true，否则返回false
 */
export function isAnchorAndFocusOverlapping(selection: RangeSelection): boolean {
  const anchor = selection.anchor;
  const focus = selection.focus;
  
  return isPointsOverlapping(anchor, focus);
}

/**
 * 检查两个选择点是否重叠
 * 两个点重叠意味着它们指向相同的位置
 * 
 * @param pointA 第一个选择点
 * @param pointB 第二个选择点
 * @returns 如果两个点重叠则返回true，否则返回false
 */
export function isPointsOverlapping(pointA: PointType, pointB: PointType): boolean {
  // 检查key（节点ID）是否相同
  if (pointA.key !== pointB.key) {
    return false;
  }
  
  // 检查类型是否相同
  if (pointA.type !== pointB.type) {
    return false;
  }
  
  // 检查偏移量是否相同
  if (pointA.offset !== pointB.offset) {
    return false;
  }
  
  // 所有条件都满足，认为点重叠
  return true;
}

/**
 * 检查选择是否折叠（没有选择范围）
 * 这是对selection.isCollapsed()的替代，提供更明确的语义
 * 
 * @param selection 范围选择对象
 * @returns 如果选择已折叠（锚点和焦点相同）则返回true
 */
export function isSelectionCollapsed(selection: RangeSelection): boolean {
  return selection.isCollapsed();
}

/**
 * 获取选择的锚点节点和焦点节点
 * 
 * @param selection 范围选择对象
 * @returns 包含锚点节点和焦点节点的对象
 */
export function getSelectionNodes(selection: RangeSelection) {
  return {
    anchorNode: selection.anchor.getNode(),
    focusNode: selection.focus.getNode(),
  };
}

/**
 * 判断选择是否在文本节点的开头位置
 * 
 * @param selection 范围选择对象
 * @returns 如果选择在文本节点的开头则返回true
 */
export function isSelectionAtTextStart(selection: RangeSelection): boolean {
  // 使用锚点判断，因为对于光标位置，锚点和焦点是相同的
  const anchor = selection.anchor;
  return anchor.type === 'text' && anchor.offset === 0;
} 