import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ChatContact } from '../../../chat-input';
import { COMMAND_PRIORITY_HIGH } from 'lexical';
import { 
  MENTION_CONTENT_UPDATE_COMMAND,
  SHOW_MENTIONS_COMMAND,
  MENTION_FILTER_UPDATE_COMMAND
} from '../../commands';

interface MentionFilterPluginProps {
  contacts: ChatContact[];
}

/**
 * 提及过滤插件
 * 负责：
 * 1. 监听内容更新并过滤联系人
 * 2. 根据搜索文本过滤联系人列表
 * 3. 通知显示插件过滤后的结果
 */
export function MentionFilterPlugin({ contacts }: MentionFilterPluginProps) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (!editor) return;
    
    // 监听显示提及命令
    const removeShowListener = editor.registerCommand(
      SHOW_MENTIONS_COMMAND,
      () => {
        // 通知显示插件初始的联系人列表（未过滤）
        editor.dispatchCommand(MENTION_FILTER_UPDATE_COMMAND, {
          searchText: '',
          filteredContacts: contacts,
        });
        
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听内容更新命令
    const removeContentUpdateListener = editor.registerCommand(
      MENTION_CONTENT_UPDATE_COMMAND,
      (payload) => {
        if (payload && typeof payload === 'object' && 'searchText' in payload) {
          const searchText = payload.searchText as string;
          
          // 根据搜索文本过滤联系人
          const filteredContacts = contacts.filter(contact => 
            contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
            contact.id.toLowerCase().includes(searchText.toLowerCase())
          );
          
          // 通知显示插件过滤后的联系人列表
          editor.dispatchCommand(MENTION_FILTER_UPDATE_COMMAND, {
            searchText,
            filteredContacts,
          });
        }
        
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    return () => {
      removeShowListener();
      removeContentUpdateListener();
    };
  }, [editor, contacts]);
  
  return null;
} 