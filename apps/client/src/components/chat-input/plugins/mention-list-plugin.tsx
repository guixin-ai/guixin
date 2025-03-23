import { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createPortal } from 'react-dom';
import { ChatContact } from '..';
import {
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
} from 'lexical';
import { 
  SHOW_MENTIONS_COMMAND, 
  MENTION_POSITION_COMMAND 
} from './mention-trigger-plugin';
import { SELECT_MENTION_COMMAND } from './mention-keyboard-plugin';

// 联系人列表组件
interface MentionListProps {
  contacts: ChatContact[];
  searchText: string;
  selectedIndex: number;
  onSelectContact: (contact: ChatContact) => void;
}

// 联系人列表组件
function MentionList({ 
  contacts, 
  searchText, 
  selectedIndex, 
  onSelectContact 
}: MentionListProps) {
  // 过滤联系人
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
    contact.id.toLowerCase().includes(searchText.toLowerCase())
  );
  
  // 如果没有匹配的联系人，不显示列表
  if (filteredContacts.length === 0) {
    return null;
  }
  
  return (
    <div className="absolute z-10 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 w-64 max-h-60 overflow-y-auto">
      {filteredContacts.length === 0 ? (
        <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
          未找到匹配的联系人
        </div>
      ) : (
        filteredContacts.map((contact, index) => (
          <div
            key={contact.id}
            className={`px-3 py-2 flex items-center cursor-pointer ${
              index === selectedIndex
                ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700/30'
            }`}
            onClick={() => onSelectContact(contact)}
          >
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs ${
                contact.isAI 
                  ? 'bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}>
                {contact.name[0]}
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <span className="text-sm font-medium">{contact.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {contact.isAI ? 'AI助手' : '联系人'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

interface MentionListPluginProps {
  contacts: ChatContact[];
  onSelectMention?: (contact: ChatContact) => void;
}

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
  
  // 监听显示提及命令
  useEffect(() => {
    if (!editor) return;
    
    // 确保有一个用于传送门的元素
    if (!portalRef.current) {
      portalRef.current = document.createElement('div');
      portalRef.current.setAttribute('data-mention-portal', 'true');
      document.body.appendChild(portalRef.current);
    }
    
    // 监听显示提及命令
    const removeShowListener = editor.registerCommand(
      SHOW_MENTIONS_COMMAND,
      () => {
        setSearchText('');
        setSelectedIndex(0);
        setDropdownOpen(true);
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听位置更新命令
    const removePositionListener = editor.registerCommand(
      MENTION_POSITION_COMMAND,
      ({ left, top, text }) => {
        setPosition({ left, top });
        setSearchText(text);
        
        // 联系人列表保持打开状态
        setDropdownOpen(true);
        return true;
      },
      COMMAND_PRIORITY_LOW
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
      removePositionListener();
      removeSelectListener();
      document.removeEventListener('mousedown', handleClickOutside);
      
      // 清理门户元素
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
        portalRef.current = null;
      }
    };
  }, [editor, dropdownOpen, handleSelectContact]);
  
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
        <div 
          style={{ 
            position: 'absolute', 
            left: position.left, 
            top: position.top, 
            zIndex: 100 
          }}
        >
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