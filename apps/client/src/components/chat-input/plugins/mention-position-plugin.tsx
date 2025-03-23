import { useCallback, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { SHOW_MENTIONS_COMMAND } from './mention-trigger-plugin';
import { MENTION_CONTENT_UPDATE_COMMAND } from './mention-content-tracker-plugin';
import { MENTION_POSITION_UPDATE_COMMAND } from './mention-display-plugin';

/**
 * 提及位置插件
 * 负责：
 * 1. 计算下拉列表的最佳位置
 * 2. 监听窗口大小变化重新计算位置
 * 3. 通知显示插件更新位置
 */
export function MentionPositionPlugin() {
  const [editor] = useLexicalComposerContext();
  
  // 获取光标位置
  const getCursorPosition = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      if (rect.width > 0 || rect.height > 0) {
        return {
          left: rect.right,
          top: rect.bottom,
          height: rect.height,
        };
      }
    }
    return null;
  }, []);
  
  // 计算下拉列表位置，确保它在视窗内
  const calculateDropdownPosition = useCallback((anchorPosition: { 
    left: number; 
    top: number; 
    height: number 
  } | null) => {
    if (!anchorPosition) return { left: 0, top: 0 };
    
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // 使用光标在视口中的位置
    let left = anchorPosition.left;
    let top = anchorPosition.top;
    
    // 添加固定的边距
    const MARGIN = 4;
    
    // 宽度和高度的估计值
    const estimatedWidth = 280;
    const estimatedHeight = 250;
    
    // 检查是否会超出右边界，如果是，则向左调整
    if (left + estimatedWidth + MARGIN > viewportWidth) {
      left = Math.max(MARGIN, viewportWidth - estimatedWidth - MARGIN);
    }
    
    // 确保不会超出左边界
    if (left < MARGIN) {
      left = MARGIN;
    }
    
    // 检查底部溢出
    const bottomSpace = viewportHeight - top;
    if (bottomSpace < estimatedHeight) {
      // 如果下方空间不足，将下拉列表放在光标上方
      top = top - estimatedHeight - anchorPosition.height;
      
      // 如果上方空间也不足，放在可能的最佳位置
      if (top < 0) {
        top = Math.min(anchorPosition.top, viewportHeight - estimatedHeight - MARGIN);
      }
    }
    
    return { left, top };
  }, []);
  
  // 更新位置并通知显示插件
  const updatePosition = useCallback(() => {
    const cursorPosition = getCursorPosition();
    if (cursorPosition) {
      const position = calculateDropdownPosition(cursorPosition);
      editor.dispatchCommand(MENTION_POSITION_UPDATE_COMMAND, { position });
    }
  }, [editor, getCursorPosition, calculateDropdownPosition]);
  
  useEffect(() => {
    if (!editor) return;
    
    // 监听显示提及命令
    const removeShowListener = editor.registerCommand(
      SHOW_MENTIONS_COMMAND,
      () => {
        // 初始化位置
        updatePosition();
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听内容更新命令
    const removeContentUpdateListener = editor.registerCommand(
      MENTION_CONTENT_UPDATE_COMMAND,
      () => {
        // 更新位置
        updatePosition();
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 窗口大小变化时重新计算位置
    const handleResize = () => {
      updatePosition();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      removeShowListener();
      removeContentUpdateListener();
      window.removeEventListener('resize', handleResize);
    };
  }, [editor, updatePosition]);
  
  return null;
} 