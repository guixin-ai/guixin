import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  TextNode, 
  $getSelection, 
  $createTextNode, 
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  KEY_DOWN_COMMAND,
  createCommand,
} from 'lexical';
import { ChatContact } from '..';
import { $createMentionNode } from '../nodes/mention-node';

// 创建一个自定义命令用于触发提及功能
export const SHOW_MENTIONS_COMMAND = createCommand('SHOW_MENTIONS_COMMAND');

// 正则表达式 - 匹配@后面跟着的文本，允许前面有任意字符
const AT_MATCH_REGEX = /@(\S*)$/;

// 提及弹出框的位置
type MentionPopupPosition = {
  top: number;
  left: number;
};

export function MentionsPlugin({ contacts = [] }: { contacts: ChatContact[] }) {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<MentionPopupPosition | null>(null);
  const [selectedContactIndex, setSelectedContactIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // 过滤联系人 - 确保始终有内容显示
  const filteredContacts = useMemo(() => {
    if (queryString === null) {
      return contacts;
    }
    
    const filtered = contacts.filter((contact) => 
      contact.name.toLowerCase().includes(queryString.toLowerCase())
    );
    
    // 如果没有匹配项，返回所有联系人
    return filtered.length > 0 ? filtered : contacts;
  }, [contacts, queryString]);

  // 检查文本是否包含@符号
  const checkForMentions = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }
      
      // 获取选择的文本内容
      const textContent = selection.getTextContent();
      const node = selection.anchor.getNode();
      
      // 如果是最后一个字符是@，直接显示
      if (textContent === '@' || textContent.endsWith('@')) {
        setQueryString('');
        setIsVisible(true);
        
        // 计算弹出框位置
        calculatePopupPosition();
        return;
      }
      
      // 否则尝试找@符号后面的内容
      const match = AT_MATCH_REGEX.exec(textContent);
      
      if (match) {
        // 找到@后面的内容
        const matchingString = match[1] || '';
        setQueryString(matchingString);
        setIsVisible(true);
        
        // 计算弹出框位置
        calculatePopupPosition();
      } else {
        // 没有@，关闭弹出框
        setIsVisible(false);
      }
    });
  }, [editor]);
  
  // 计算弹出框位置
  const calculatePopupPosition = useCallback(() => {
    const editorElement = editor.getRootElement();
    if (!editorElement) return;
    
    const editorRect = editorElement.getBoundingClientRect();
    
    const domSelection = window.getSelection();
    if (domSelection && domSelection.rangeCount > 0) {
      const range = domSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      if (rect.width > 0 && rect.height > 0) {
        // 有效的选择范围位置，使用光标位置
        setPopupPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
      } else {
        // 无效的选择范围，使用编辑器位置加偏移
        setPopupPosition({
          top: editorRect.top + 30 + window.scrollY,
          left: editorRect.left + 30 + window.scrollX,
        });
      }
    } else {
      // 无选择，使用编辑器位置
      setPopupPosition({
        top: editorRect.top + 30 + window.scrollY,
        left: editorRect.left + 30 + window.scrollX,
      });
    }
  }, [editor]);

  // 插入@提及
  const insertMention = useCallback((contact: ChatContact) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }

      const anchorNode = selection.anchor.getNode();
      const textContent = anchorNode.getTextContent();
      const anchorOffset = selection.anchor.offset;
      
      // 处理有@字符的情况
      const match = AT_MATCH_REGEX.exec(textContent);
      
      if (match) {
        // 计算@符号的位置
        const matchText = match[0]; // 完整匹配文本，如"@abc"
        const startOffset = anchorOffset - matchText.length;
        
        // 设置选择范围从@符号开始到当前光标位置
        selection.setTextNodeRange(
          anchorNode as TextNode,
          startOffset,
          anchorNode as TextNode,
          anchorOffset
        );
        
        // 删除选中的内容（@及后面的查询文本）
        selection.deleteCharacter(true);
        
        // 创建并插入提及节点
        const mentionNode = $createMentionNode(contact.name, contact.id);
        selection.insertNodes([mentionNode]);
        
        // 添加空格以方便继续输入
        selection.insertText(' ');
      } else if (textContent === '@' || textContent.endsWith('@')) {
        // 处理刚输入@的情况
        let startOffset;
        if (textContent === '@') {
          startOffset = 0;
        } else {
          startOffset = anchorOffset - 1; // 只删除@符号
        }
        
        // 设置选择范围
        selection.setTextNodeRange(
          anchorNode as TextNode,
          startOffset,
          anchorNode as TextNode,
          anchorOffset
        );
        
        // 删除@符号
        selection.deleteCharacter(true);
        
        // 创建并插入提及节点
        const mentionNode = $createMentionNode(contact.name, contact.id);
        selection.insertNodes([mentionNode]);
        
        // 添加空格以方便继续输入
        selection.insertText(' ');
      }

      // 强制编辑器更新，确保视图刷新
      setTimeout(() => {
        // 触发编辑器重新渲染
        editor.update(() => {
          // 空更新，仅用于触发视图刷新
        });
      }, 0);

      // 关闭弹出框
      setIsVisible(false);
    });
  }, [editor]);

  // 处理按键事件
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 如果弹出框不可见，不处理
    if (!isVisible || !popupPosition || filteredContacts.length === 0) {
      return false;
    }

    // 上下键选择
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedContactIndex(prev => 
        prev < filteredContacts.length - 1 ? prev + 1 : 0
      );
      return true;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedContactIndex(prev => 
        prev > 0 ? prev - 1 : filteredContacts.length - 1
      );
      return true;
    } 
    // 回车键或Tab键确认选择
    else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(filteredContacts[selectedContactIndex]);
      return true;
    } 
    // Esc键关闭
    else if (e.key === 'Escape') {
      e.preventDefault();
      setIsVisible(false);
      return true;
    }
    
    return false;
  }, [isVisible, popupPosition, filteredContacts, selectedContactIndex, insertMention]);

  // 处理点击联系人项
  const handleContactClick = useCallback((contact: ChatContact) => {
    insertMention(contact);
    // 防止冒泡到document导致关闭弹出框
    setTimeout(() => setIsVisible(false), 0);
  }, [insertMention]);

  // 检测@字符输入
  const handleAtCharInput = useCallback((text: string) => {
    if (text === '@') {
      // 立即设置可见状态和计算位置
      setQueryString('');
      setIsVisible(true);
      
      // 延迟一点计算位置，确保DOM已更新
      setTimeout(() => {
        calculatePopupPosition();
      }, 10);
      
      return true;
    }
    return false;
  }, [calculatePopupPosition]);

  // 点击事件监听，点击外部关闭弹出框
  useEffect(() => {
    const onClickOutside = () => {
      setIsVisible(false);
    };

    document.addEventListener('click', onClickOutside);
    
    return () => {
      document.removeEventListener('click', onClickOutside);
    };
  }, []);

  // 更新监听
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      checkForMentions();
    });
  }, [editor, checkForMentions]);

  // 按键监听
  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        return handleKeyDown(event);
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, handleKeyDown]);

  // 文本输入监听
  useEffect(() => {
    const removeTextContentListener = editor.registerTextContentListener(
      (text) => {
        // 当文本变化时，检查是否输入了@
        const lastChar = text.charAt(text.length - 1);
        if (lastChar === '@') {
          handleAtCharInput('@');
        }
      }
    );
    
    return () => {
      removeTextContentListener();
    };
  }, [editor, handleAtCharInput]);

  // 没有弹出框位置或不可见时不渲染
  if (!isVisible || !popupPosition || filteredContacts.length === 0) {
    return null;
  }

  return (
    <div 
      className="absolute z-10 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto w-56"
      style={{
        left: `${popupPosition.left}px`,
        top: `${popupPosition.top}px`,
      }}
      onClick={(e) => e.stopPropagation()} // 防止冒泡到document
    >
      <div className="p-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
        {queryString ? `搜索 "${queryString}"` : '选择联系人'}
      </div>
      <ul className="py-1">
        {filteredContacts.map((contact, index) => (
          <li 
            key={contact.id}
            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center ${
              index === selectedContactIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            onClick={() => handleContactClick(contact)}
            onMouseEnter={() => setSelectedContactIndex(index)}
          >
            <div className="flex items-center space-x-2 w-full">
              <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                contact.isAI ? 'bg-blue-500' : 'bg-gray-500'
              } text-white text-xs font-medium`}>
                {contact.avatar || contact.name.charAt(0)}
              </div>
              <span className="text-sm truncate">
                {contact.name}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 