import { 
  isAnchorAndFocusOverlapping, 
  isPointsOverlapping,
  isSelectionCollapsed,
  isSelectionAtTextStart
} from '../selection-utils';
import { PointType, RangeSelection } from 'lexical';
import { vi, describe, it, expect } from 'vitest';

// 模拟PointType对象
const createMockPoint = (key: string, offset: number, type: 'text' | 'element'): PointType => {
  return {
    key,
    offset,
    type,
    getNode: vi.fn(),
    is: vi.fn(),
    isBefore: vi.fn(),
    set: vi.fn(),
    _selection: null as any
  };
};

// 模拟RangeSelection对象
const createMockSelection = (
  anchorKey: string, 
  anchorOffset: number, 
  anchorType: 'text' | 'element',
  focusKey: string,
  focusOffset: number,
  focusType: 'text' | 'element'
): RangeSelection => {
  const anchor = createMockPoint(anchorKey, anchorOffset, anchorType);
  const focus = createMockPoint(focusKey, focusOffset, focusType);
  
  return {
    anchor,
    focus,
    format: 0,
    style: '',
    isCollapsed: () => anchorKey === focusKey && anchorOffset === focusOffset && anchorType === focusType,
    _cachedNodes: null,
    dirty: false,
    clone: vi.fn(),
    extract: vi.fn(),
    getNodes: vi.fn(),
    getTextContent: vi.fn(),
    insertText: vi.fn(),
    insertRawText: vi.fn(),
    is: vi.fn(),
    insertNodes: vi.fn(),
    getStartEndPoints: vi.fn(),
    isBackward: vi.fn(),
    getCachedNodes: vi.fn(),
    setCachedNodes: vi.fn()
  } as unknown as RangeSelection;
};

describe('选择工具函数测试', () => {
  describe('isPointsOverlapping', () => {
    it('当两个点完全相同时应返回true', () => {
      const pointA = createMockPoint('node-1', 5, 'text');
      const pointB = createMockPoint('node-1', 5, 'text');
      
      expect(isPointsOverlapping(pointA, pointB)).toBe(true);
    });
    
    it('当两个点key不同时应返回false', () => {
      const pointA = createMockPoint('node-1', 5, 'text');
      const pointB = createMockPoint('node-2', 5, 'text');
      
      expect(isPointsOverlapping(pointA, pointB)).toBe(false);
    });
    
    it('当两个点offset不同时应返回false', () => {
      const pointA = createMockPoint('node-1', 5, 'text');
      const pointB = createMockPoint('node-1', 6, 'text');
      
      expect(isPointsOverlapping(pointA, pointB)).toBe(false);
    });
    
    it('当两个点type不同时应返回false', () => {
      const pointA = createMockPoint('node-1', 5, 'text');
      const pointB = createMockPoint('node-1', 5, 'element');
      
      expect(isPointsOverlapping(pointA, pointB)).toBe(false);
    });
  });
  
  describe('isAnchorAndFocusOverlapping', () => {
    it('当锚点和焦点重叠时应返回true', () => {
      const selection = createMockSelection('node-1', 5, 'text', 'node-1', 5, 'text');
      
      expect(isAnchorAndFocusOverlapping(selection)).toBe(true);
    });
    
    it('当锚点和焦点不重叠时应返回false', () => {
      const selection = createMockSelection('node-1', 5, 'text', 'node-1', 10, 'text');
      
      expect(isAnchorAndFocusOverlapping(selection)).toBe(false);
    });
  });
  
  describe('isSelectionCollapsed', () => {
    it('应调用selection.isCollapsed()方法', () => {
      const selection = createMockSelection('node-1', 5, 'text', 'node-1', 5, 'text');
      const isCollapsedSpy = vi.spyOn(selection, 'isCollapsed');
      
      isSelectionCollapsed(selection);
      
      expect(isCollapsedSpy).toHaveBeenCalled();
    });
    
    it('当选择已折叠时应返回true', () => {
      const selection = createMockSelection('node-1', 5, 'text', 'node-1', 5, 'text');
      
      expect(isSelectionCollapsed(selection)).toBe(true);
    });
    
    it('当选择未折叠时应返回false', () => {
      const selection = createMockSelection('node-1', 5, 'text', 'node-1', 10, 'text');
      
      expect(isSelectionCollapsed(selection)).toBe(false);
    });
  });
  
  describe('isSelectionAtTextStart', () => {
    it('当选择位于文本开始位置时应返回true', () => {
      const selection = createMockSelection('node-1', 0, 'text', 'node-1', 0, 'text');
      
      expect(isSelectionAtTextStart(selection)).toBe(true);
    });
    
    it('当选择不在文本开始位置时应返回false', () => {
      const selection = createMockSelection('node-1', 5, 'text', 'node-1', 5, 'text');
      
      expect(isSelectionAtTextStart(selection)).toBe(false);
    });
    
    it('当选择不是文本类型时应返回false', () => {
      const selection = createMockSelection('node-1', 0, 'element', 'node-1', 0, 'element');
      
      expect(isSelectionAtTextStart(selection)).toBe(false);
    });
  });
}); 