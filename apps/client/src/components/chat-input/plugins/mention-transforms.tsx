import { TextNode, LexicalEditor } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $createMentionNode } from '../nodes/mention-node';
import { ChatContact } from '..';

// @提及正则表达式 - 匹配@后面跟着的文本
const MENTION_REGEX = /@(\w+)(?=\s|$)/g;

// 用于跟踪正在处理转换的节点，避免循环
const transformingTextNodes = new Set<string>();

/**
 * 注册@提及转换函数
 * 将文本中的@username自动转换为提及节点
 */
function registerMentionTransforms(editor: LexicalEditor, contacts: ChatContact[] = []) {
  // 为TextNode注册转换器
  return editor.registerNodeTransform(TextNode, (textNode) => {
    // 获取节点的唯一键，用于跟踪
    const nodeKey = textNode.getKey();
    
    // 如果节点已经在处理中，避免重复处理
    if (transformingTextNodes.has(nodeKey)) {
      return;
    }

    // 标记节点正在处理中
    transformingTextNodes.add(nodeKey);

    // 获取文本内容
    const textContent = textNode.getTextContent();
    
    // 查找所有@提及
    const matches = Array.from(textContent.matchAll(MENTION_REGEX));
    
    // 如果没有匹配，解除标记并返回
    if (matches.length === 0) {
      transformingTextNodes.delete(nodeKey);
      return;
    }
    
    // 从后向前处理匹配项，以避免索引变化
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const mentionName = match[1]; // @后面的名称
      const startOffset = match.index!;
      const endOffset = startOffset + match[0].length;
      
      // 查找匹配的联系人
      const contact = contacts.find(
        (c) => c.name.toLowerCase() === mentionName.toLowerCase()
      );
      
      // 如果找到匹配的联系人，创建提及节点
      if (contact) {
        try {
          // 分割文本节点
          const splitNodes = textNode.splitText(startOffset, endOffset);
          const mentionTextNode = splitNodes[1];
          
          // 替换为提及节点
          const mentionNode = $createMentionNode(contact.name, contact.id);
          mentionTextNode.replace(mentionNode);
        } catch (error) {
          console.error('转换提及节点时出错:', error);
        }
      }
    }
    
    // 解除节点处理中的标记
    transformingTextNodes.delete(nodeKey);
  });
}

/**
 * 提及转换插件组件
 * 在编辑器中注册转换器，实现@提及的自动识别和转换
 */
export function MentionTransformsPlugin({ contacts = [] }: { contacts: ChatContact[] }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    // 注册转换器
    const removeTransform = registerMentionTransforms(editor, contacts);
    
    // 组件卸载时移除转换器
    return () => {
      removeTransform();
      // 清空转换跟踪集合
      transformingTextNodes.clear();
    };
  }, [editor, contacts]);
  
  // 这是一个逻辑插件，不渲染任何内容
  return null;
}

// 为TypeScript添加类型扩展
declare global {
  interface TextNode {
    __transformMentionsInProgress?: boolean;
  }
} 