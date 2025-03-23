import { TextNode, LexicalEditor, DecoratorNode } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $createMentionNode, $isMentionNode } from '../nodes/mention-node';
import { ChatContact } from '..';

// 用于跟踪正在处理转换的节点，避免循环
const transformingTextNodes = new Set<string>();

/**
 * 注册@提及转换函数
 * 该函数在以前实现了对"@姓名+空格"格式的自动提及转换
 * 但现在这个功能已被移除
 */
function registerMentionTransforms(editor: LexicalEditor, contacts: ChatContact[] = []) {
  // 为TextNode注册转换器
  return editor.registerNodeTransform(TextNode, (textNode) => {
    // 跳过DecoratorNode的子节点
    const parent = textNode.getParent();
    if (parent && parent instanceof DecoratorNode) {
      return;
    }
    
    // 获取节点的唯一键，用于跟踪
    const nodeKey = textNode.getKey();
    
    // 如果节点已经在处理中，避免重复处理
    if (transformingTextNodes.has(nodeKey)) {
      return;
    }

    // 节点处理逻辑已移除
    return;
  });
}

/**
 * 提及转换插件组件
 * 在编辑器中注册转换器
 * 注意：自动将"@姓名+空格"转换为提及节点的功能已被移除
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