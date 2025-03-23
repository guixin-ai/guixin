import { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createPortal } from 'react-dom';
import { ChatContact } from '..';
import {
  COMMAND_PRIORITY_HIGH,
  createCommand,
} from 'lexical';
import { SHOW_MENTIONS_COMMAND } from './mention-trigger-plugin';
import { SELECT_MENTION_COMMAND } from './mention-keyboard-plugin';
import { CANCEL_MENTIONS_COMMAND } from './mention-cancellation-plugin';
import { MentionList } from '../components/mention-list';

// 定义位置更新命令（避免循环依赖）
export const MENTION_POSITION_UPDATE_COMMAND = createCommand<{
  position: { left: number; top: number };
}>();

// 定义过滤更新命令（避免循环依赖）
export const MENTION_FILTER_UPDATE_COMMAND = createCommand<{
  searchText: string;
  filteredContacts: ChatContact[];
}>();

interface MentionDisplayPluginProps {
  contacts: ChatContact[];
  onSelectMention?: (contact: ChatContact) => void;
}

/**
 * 提及显示插件
 * 负责：
 * 1. 监听显示提及命令并显示联系人列表
 * 2. 监听取消命令并隐藏列表
 * 3. 处理联系人选择
 * 4. 创建和管理列表的DOM渲染
 */
export function MentionDisplayPlugin({ contacts, onSelectMention }: MentionDisplayPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [searchText, setSearchText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [filteredContacts, setFilteredContacts] = useState<ChatContact[]>(contacts);
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
        setFilteredContacts(contacts);
        
        // 显示下拉列表
        setDropdownOpen(true);
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听位置更新命令 - 从MentionPositionPlugin触发
    const removePositionUpdateListener = editor.registerCommand(
      MENTION_POSITION_UPDATE_COMMAND,
      (payload) => {
        if (payload && typeof payload === 'object' && 'position' in payload) {
          setPosition(payload.position);
        }
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听过滤更新命令 - 从MentionFilterPlugin触发
    const removeFilterUpdateListener = editor.registerCommand(
      MENTION_FILTER_UPDATE_COMMAND,
      (payload) => {
        if (payload && typeof payload === 'object' && 'searchText' in payload && 'filteredContacts' in payload) {
          setSearchText(payload.searchText);
          setFilteredContacts(payload.filteredContacts);
          
          // 重置选中项
          setSelectedIndex(0);
        }
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听取消提及命令 - 从MentionCancellationPlugin触发
    const removeCancelListener = editor.registerCommand(
      CANCEL_MENTIONS_COMMAND,
      () => {
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
    
    return () => {
      removeShowListener();
      removePositionUpdateListener();
      removeFilterUpdateListener();
      removeCancelListener();
      removeSelectListener();
      document.removeEventListener('mousedown', handleClickOutside);
      
      // 清理门户元素
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
        portalRef.current = null;
      }
    };
  }, [editor, dropdownOpen, handleSelectContact, contacts]);
  
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
        <div 
          className="mention-list-portal"
          style={{ 
            position: 'fixed', 
            left: `${position.left}px`, 
            top: `${position.top}px`, 
            zIndex: 9999, 
            transformOrigin: 'top left',
            maxWidth: '90vw'
          }}
        >
          <MentionList 
            contacts={filteredContacts}
            searchText={searchText}
            selectedIndex={selectedIndex}
            onSelectContact={handleSelectContact}
          />
        </div>,
        portalRef.current
      )
    : null;
} 