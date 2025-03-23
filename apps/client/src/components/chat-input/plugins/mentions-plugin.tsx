import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LexicalEditor,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  TextNode,
  $createTextNode,
  $getNodeByKey,
  createCommand,
  COMMAND_PRIORITY_CRITICAL,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createMentionNode } from '../nodes';
import { mergeRegister } from '@lexical/utils';
import { ChatContact } from '..';

// 创建一个自定义命令用于触发提及功能
export const SHOW_MENTIONS_COMMAND = createCommand('SHOW_MENTIONS_COMMAND');

// 修改过滤逻辑，使其根据输入的名称过滤联系人
const filterContacts = (contacts: ChatContact[], searchText: string): ChatContact[] => {
  const searchLower = searchText.toLowerCase();
  return contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchLower) || contact.id.toLowerCase().includes(searchLower)
  );
};

interface MentionsPluginProps {
  contacts: ChatContact[];
}

export function MentionsPlugin({ contacts }: MentionsPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [filteredContacts, setFilteredContacts] = useState<ChatContact[]>([]);
  const [selectedContactIndex, setSelectedContactIndex] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);
  
  // 保存触发位置的状态
  const [triggerPosition, setTriggerPosition] = useState<{ left: number; top: number; height: number } | null>(null);
  
  // 处理提及触发逻辑
  const handleMentionTrigger = useCallback(
    (textNode: TextNode) => {
      if (textNode) {
        const textContent = textNode.getTextContent();
        const lastAtPos = textContent.lastIndexOf('@');
        
        if (lastAtPos !== -1) {
          // 获取@后的搜索文本
          const searchText = textContent.substring(lastAtPos + 1);
          
          // 更新状态
          setQueryString(searchText);
          setDropdownOpen(true);
          setSelectedContactIndex(0);
          
          // 筛选匹配的联系人
          setFilteredContacts(filterContacts(contacts, searchText));
          
          // 获取@符号的位置
          editor.getEditorState().read(() => {
            const domSelection = window.getSelection();
            const domRange = domSelection?.getRangeAt(0);
            
            if (domRange) {
              // 创建一个临时范围用于定位@符号
              const tempRange = document.createRange();
              tempRange.setStart(domRange.startContainer, lastAtPos);
              tempRange.setEnd(domRange.startContainer, lastAtPos + 1);
              
              // 获取@符号的边界框
              const rect = tempRange.getBoundingClientRect();
              
              // 如果编辑器挂载在文档中
              if (rect && inputRef.current) {
                const editorRect = inputRef.current.getBoundingClientRect();
                
                // 计算相对于编辑器的位置
                setTriggerPosition({
                  left: rect.left - editorRect.left,
                  top: rect.bottom - editorRect.top,
                  height: rect.height,
                });
              } else if (inputRef.current) {
                // 处理特殊情况，如编辑器为空时，使用编辑器的起始位置
                const editorRect = inputRef.current.getBoundingClientRect();
                
                setTriggerPosition({
                  left: 0,
                  top: 20, // 行高默认
                  height: 20, // 预估行高
                });
              }
            }
          });
        } else {
          // 如果没有@符号或它已被删除，关闭下拉列表
          setDropdownOpen(false);
        }
      } else {
        // 如果没有文本节点，关闭下拉列表
        setDropdownOpen(false);
      }
    },
    [contacts, editor]
  );
  
  // 插入提及节点
  const insertMention = useCallback(
    (contact: ChatContact) => {
      editor.update(() => {
        const selection = $getSelection();
        
        if ($isRangeSelection(selection)) {
          const anchor = selection.anchor;
          const focus = selection.focus;
          const anchorNode = anchor.getNode();
          
          if (anchorNode instanceof TextNode) {
            const textContent = anchorNode.getTextContent();
            const lastAtPos = textContent.lastIndexOf('@');
            
            if (lastAtPos !== -1) {
              // 创建提及节点 - 只传递名称和ID两个参数
              const mentionNode = $createMentionNode(contact.name, contact.id);
              
              // 分割文本节点，删除@和搜索文本
              if (lastAtPos > 0) {
                anchorNode.splitText(lastAtPos);
              }
              
              // 替换文本节点中的@+查询文本
              const textNodeKey = anchorNode.getKey();
              const textNode = $getNodeByKey(textNodeKey);
              
              if (textNode && textNode instanceof TextNode) {
                textNode.setTextContent(textContent.substring(0, lastAtPos));
                textNode.insertAfter(mentionNode);
                
                // 在提及节点后插入一个空格节点
                const spaceNode = $createTextNode(' ');
                mentionNode.insertAfter(spaceNode);
                
                // 将选择移到空格节点后
                spaceNode.select();
              }
            }
          }
        }
        
        // 关闭下拉列表
        setDropdownOpen(false);
        
        // 确保编辑器保持焦点
        setTimeout(() => {
          editor.focus();
        }, 0);
      });
    },
    [editor]
  );
  
  // 设置键盘监听和事件处理
  useEffect(() => {
    if (!editor) return;
    
    // 获取编辑器DOM引用
    const rootElement = editor.getRootElement();
    if (rootElement) {
      inputRef.current = rootElement.closest('div.relative') || null;
    }
    
    // 注册命令和侦听器
    return mergeRegister(
      // 监听输入变化
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          
          const anchor = selection.anchor;
          const anchorNode = anchor.getNode();
          
          if (anchorNode instanceof TextNode) {
            handleMentionTrigger(anchorNode);
          } else if (dropdownOpen) {
            // 如果不再是文本节点，关闭下拉列表
            setDropdownOpen(false);
          }
        });
      }),
      
      // 特殊处理空编辑器情况下的@输入
      editor.registerTextContentListener((text) => {
        if (text.length === 1 && text === '@') {
          setQueryString('');
          setDropdownOpen(true);
          setSelectedContactIndex(0);
          setFilteredContacts(contacts);
          
          // 如果编辑器挂载在文档中
          if (inputRef.current) {
            const editorRect = inputRef.current.getBoundingClientRect();
            
            // 设置触发位置为编辑器的起始位置
            setTriggerPosition({
              left: 0,
              top: 20, // 行高默认
              height: 20, // 预估行高
            });
          }
        }
      }),
      
      // 监听SHOW_MENTIONS_COMMAND命令
      editor.registerCommand(
        SHOW_MENTIONS_COMMAND,
        () => {
          setQueryString('');
          setDropdownOpen(true);
          setSelectedContactIndex(0);
          setFilteredContacts(contacts);
          
          // 延迟一下计算位置，确保DOM已更新
          setTimeout(() => {
            if (inputRef.current) {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                const editorRect = inputRef.current.getBoundingClientRect();
                
                if (rect.width > 0 && rect.height > 0) {
                  setTriggerPosition({
                    left: rect.left - editorRect.left,
                    top: rect.bottom - editorRect.top,
                    height: rect.height,
                  });
                } else {
                  // 空编辑器情况
                  setTriggerPosition({
                    left: 0,
                    top: 20,
                    height: 20,
                  });
                }
              }
            }
          }, 0);
          return true;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      
      // 监听按键导航
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        () => {
          if (dropdownOpen && filteredContacts.length > 0) {
            const nextIndex = (selectedContactIndex + 1) % filteredContacts.length;
            setSelectedContactIndex(nextIndex);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_NORMAL
      ),
      
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        () => {
          if (dropdownOpen && filteredContacts.length > 0) {
            const prevIndex = (selectedContactIndex - 1 + filteredContacts.length) % filteredContacts.length;
            setSelectedContactIndex(prevIndex);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_NORMAL
      ),
      
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        () => {
          if (dropdownOpen && filteredContacts.length > 0) {
            insertMention(filteredContacts[selectedContactIndex]);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_NORMAL
      ),
      
      editor.registerCommand(
        KEY_TAB_COMMAND,
        () => {
          if (dropdownOpen && filteredContacts.length > 0) {
            insertMention(filteredContacts[selectedContactIndex]);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_NORMAL
      ),
      
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (dropdownOpen) {
            setDropdownOpen(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [
    editor,
    handleMentionTrigger,
    dropdownOpen,
    filteredContacts,
    selectedContactIndex,
    insertMention,
    contacts,
  ]);
  
  // 如果没有要显示的内容，不渲染任何东西
  if (!dropdownOpen || !triggerPosition) {
    return null;
  }
  
  return (
    <div
      ref={dropdownRef}
      className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-auto max-h-60 w-64"
      style={{
        top: `${triggerPosition.top + triggerPosition.height}px`,
        left: `${triggerPosition.left}px`,
      }}
    >
      {filteredContacts.length === 0 ? (
        <div className="p-2 text-gray-500 dark:text-gray-400">未找到联系人</div>
      ) : (
        <ul>
          {filteredContacts.map((contact, index) => (
            <li
              key={contact.id}
              className={`p-2 cursor-pointer flex items-center ${
                index === selectedContactIndex
                  ? 'bg-blue-100 dark:bg-blue-900'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => insertMention(contact)}
            >
              {contact.avatar && (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 mr-2 flex-shrink-0">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-full h-full rounded-full"
                  />
                </div>
              )}
              {!contact.avatar && (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 mr-2 flex items-center justify-center flex-shrink-0">
                  {contact.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{contact.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {contact.isAI ? '人工智能' : '用户'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 