import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  TextNode,
  $getSelection,
  $isRangeSelection,
  $createTextNode,
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { SELECT_MENTION_COMMAND } from '../commands';
import { $createMentionNode } from '../nodes';
import { ChatContact } from '..';

/**
 * 提及转换插件
 * 负责将选择的联系人转换为提及节点
 */
export function MentionTransformsPlugin({ contacts }: { contacts: ChatContact[] }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (!editor) return;
    
    // 监听选择联系人命令
    const removeSelectMentionListener = editor.registerCommand(
      SELECT_MENTION_COMMAND,
      (contact: ChatContact) => {
        console.log('SELECT_MENTION_COMMAND received');
        // 在编辑器中插入提及节点
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
                // 创建提及节点
                const mentionNode = $createMentionNode(contact.name, contact.id);
                
                // 分割文本节点，删除@和搜索文本
                if (lastAtPos > 0) {
                  anchorNode.splitText(lastAtPos);
                }
                
                // 替换文本节点中的@+查询文本
                const textNodeKey = anchorNode.getKey();
                const textNode = anchorNode.getLatest();
                
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
        });
        
        // 确保编辑器保持焦点
        setTimeout(() => {
          editor.focus();
        }, 0);
        
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );
    
    return () => {
      removeSelectMentionListener();
    };
  }, [editor, contacts]);
  
  return null;
} 