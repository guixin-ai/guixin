import { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createPortal } from 'react-dom';
import { ChatContact } from '..';
import {
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
} from 'lexical';
import { SHOW_MENTIONS_COMMAND } from './mention-trigger-plugin';
import { SELECT_MENTION_COMMAND } from './mention-keyboard-plugin';
import { MENTION_CONTENT_UPDATE_COMMAND } from './mention-content-tracker-plugin';
import { CANCEL_MENTIONS_COMMAND } from './mention-cancellation-plugin';
import { MentionList } from '../components/mention-list';

interface MentionListPluginProps {
  contacts: ChatContact[];
  onSelectMention?: (contact: ChatContact) => void;
}

/**
 * 提及列表插件
 * 负责：
 * 1. 监听显示提及命令并显示联系人列表
 * 2. 监听内容更新并过滤联系人
 * 3. 监听取消命令并隐藏列表
 * 4. 处理联系人选择
 */
export function MentionListPlugin({ contacts, onSelectMention }: MentionListPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [searchText, setSearchText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const portalRef = useRef<HTMLDivElement | null>(null);
  
  // 处理联系人选择
  const handleSelectContact = useCallback((contact: ChatContact) => {
    // 如果有外部回调，调用它
    if (onSelectMention) {
      onSelectMention(contact);
    }
    
    // 分发选择联系人命令
    editor.dispatchCommand(SELECT_MENTION_COMMAND, contact);
    
    // 关闭下拉列表
    setDropdownOpen(false);
  }, [editor, onSelectMention]);
  
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
  
  // 监听显示提及命令、取消命令和内容更新命令
  useEffect(() => {
    if (!editor) return;
    
    // 确保有一个用于传送门的元素
    if (!portalRef.current) {
      portalRef.current = document.createElement('div');
      portalRef.current.setAttribute('data-mention-portal', 'true');
      document.body.appendChild(portalRef.current);
    }
    
    // 监听显示提及命令 - 从MentionTriggerPlugin触发
    const removeShowListener = editor.registerCommand(
      SHOW_MENTIONS_COMMAND,
      () => {
        // 初始化搜索文本和选中项
        setSearchText('');
        setSelectedIndex(0);
        
        // 获取最新的光标位置
        const cursorPosition = getCursorPosition();
        
        // 如果有位置信息，则更新位置
        if (cursorPosition) {
          setPosition(calculateDropdownPosition(cursorPosition));
        }
        
        // 显示下拉列表
        setDropdownOpen(true);
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听内容更新命令 - 从MentionContentTrackerPlugin触发
    const removeContentUpdateListener = editor.registerCommand(
      MENTION_CONTENT_UPDATE_COMMAND,
      (payload) => {
        // 更新搜索文本
        setSearchText(payload.searchText);
        
        // 重置选中项
        setSelectedIndex(0);
        
        // 获取最新的光标位置
        const cursorPosition = getCursorPosition() || payload.anchor;
        
        // 如果有位置信息，则更新位置
        if (cursorPosition) {
          setPosition(calculateDropdownPosition(cursorPosition));
        }
        
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_LOW
    );
    
    // 监听取消提及命令 - 从MentionCancellationPlugin触发
    const removeCancelListener = editor.registerCommand(
      CANCEL_MENTIONS_COMMAND,
      () => {
        console.log('处理 CANCEL_MENTIONS_COMMAND：隐藏下拉列表');
        // 关闭下拉列表
        setDropdownOpen(false);
        return true; // 阻止其他处理，确保命令被消费
      },
      COMMAND_PRIORITY_HIGH // 提高优先级，确保命令被正确处理
    );
    
    // 选择联系人处理
    const removeSelectListener = editor.registerCommand(
      SELECT_MENTION_COMMAND,
      (contact: ChatContact) => {
        handleSelectContact(contact);
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 点击外部关闭下拉列表
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownOpen && 
          portalRef.current && 
          !portalRef.current.contains(e.target as Node) &&
          editor.getRootElement() && 
          !editor.getRootElement()!.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // 窗口大小变化时重新计算位置
    const handleResize = () => {
      if (dropdownOpen) {
        const cursorPosition = getCursorPosition();
        if (cursorPosition) {
          setPosition(calculateDropdownPosition(cursorPosition));
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      removeShowListener();
      removeContentUpdateListener();
      removeCancelListener();
      removeSelectListener();
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      
      // 清理门户元素
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
        portalRef.current = null;
      }
    };
  }, [editor, dropdownOpen, handleSelectContact, calculateDropdownPosition, getCursorPosition]);
  
  // 过滤联系人
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
    contact.id.toLowerCase().includes(searchText.toLowerCase())
  );
  
  // 选中索引边界检查
  useEffect(() => {
    if (filteredContacts.length > 0) {
      // 确保选中索引不超出范围
      if (selectedIndex >= filteredContacts.length) {
        setSelectedIndex(filteredContacts.length - 1);
      }
    }
  }, [filteredContacts, selectedIndex]);
  
  return dropdownOpen && portalRef.current
    ? createPortal(
        <div style={{ 
          position: 'fixed', 
          left: `${position.left}px`, 
          top: `${position.top}px`, 
          zIndex: 9999, 
          transformOrigin: 'top left' 
        }}>
          <MentionList 
            contacts={contacts}
            searchText={searchText}
            selectedIndex={selectedIndex}
            onSelectContact={handleSelectContact}
          />
        </div>,
        portalRef.current
      )
    : null;
} 