import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  TextNode,
  $getSelection,
  $isRangeSelection,
  createCommand,
  LexicalCommand,
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { SHOW_MENTIONS_COMMAND } from './mention-trigger-plugin';

// 定义一个新命令，用于传递@后面的文本和位置
export const MENTION_CONTENT_UPDATE_COMMAND: LexicalCommand<{
  searchText: string;
  anchor: { left: number; top: number; height: number } | null;
}> = createCommand('MENTION_CONTENT_UPDATE_COMMAND');

/**
 * 提及内容追踪插件
 * 该插件在SHOW_MENTIONS_COMMAND被触发后开始工作
 * 监听编辑器内容变化，实时计算@后面的文本内容
 * 并发送更新命令给提及列表插件
 */
export function MentionContentTrackerPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isTracking, setIsTracking] = useState(false);
  
  // 获取光标位置
  const getCursorPosition = () => {
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
  };
  
  useEffect(() => {
    // 监听提及显示命令，开始追踪
    const removeShowMentionsListener = editor.registerCommand(
      SHOW_MENTIONS_COMMAND,
      () => {
        // 开始追踪
        setIsTracking(true);
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听编辑器内容变化，计算@后的内容
    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      if (!isTracking) return;
      
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        
        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        
        if (anchorNode instanceof TextNode) {
          const textContent = anchorNode.getTextContent();
          const offset = anchor.offset;
          
          // 找到最后一个@符号
          const lastAtPos = textContent.lastIndexOf('@', offset);
          
          if (lastAtPos === -1) {
            // 如果没有找到@符号，停止追踪
            setIsTracking(false);
            return;
          }
          
          // 如果找到@符号，计算@后面的文本
          const searchText = textContent.substring(lastAtPos + 1, offset);
          
          // 获取当前光标位置
          const currentPosition = getCursorPosition();
          
          // 发送更新命令
          editor.dispatchCommand(MENTION_CONTENT_UPDATE_COMMAND, {
            searchText,
            anchor: currentPosition
          });
        } else {
          // 如果不是文本节点，停止追踪
          setIsTracking(false);
        }
      });
    });
    
    return () => {
      removeShowMentionsListener();
      removeUpdateListener();
    };
  }, [editor, isTracking]);
  
  return null;
} 