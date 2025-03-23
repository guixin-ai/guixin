import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_LOW } from 'lexical';
import { $isMentionNode, MentionNode } from '../nodes';

/**
 * 提及节点插件
 * 处理提及节点的特殊行为，如单击、删除等
 */
export function MentionNodePlugin() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (!editor) return;
    
    // 可以在这里注册节点相关的命令和监听器
    // 例如处理节点的单击、删除等事件
    
    // 监听节点的焦点变化
    const removeNodeTransform = editor.registerNodeTransform(
      MentionNode,
      (node) => {
        // 这里可以处理节点的特殊行为
        // 例如在节点被创建或修改时执行特定操作
      }
    );
    
    return () => {
      removeNodeTransform();
    };
  }, [editor]);
  
  return null;
} 