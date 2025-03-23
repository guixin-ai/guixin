import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  TextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { 
  SHOW_MENTIONS_COMMAND,
  CANCEL_MENTIONS_COMMAND,
  MENTION_CONTENT_UPDATE_COMMAND
} from '../commands';

/**
 * 提及内容追踪插件
 * 该插件在SHOW_MENTIONS_COMMAND被触发后开始工作
 * 监听编辑器内容变化，实时计算@后面的文本内容
 * 并发送更新命令给提及列表插件
 */
export function MentionContentTrackerPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isTracking, setIsTracking] = useState(false);
  
  useEffect(() => {
    if (!editor) return;
    
    // 监听显示提及命令，开始跟踪输入内容
    const startTrackingListener = editor.registerCommand(
      SHOW_MENTIONS_COMMAND,
      () => {
        setIsTracking(true);
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听取消提及命令，停止跟踪
    const stopTrackingListener = editor.registerCommand(
      CANCEL_MENTIONS_COMMAND,
      () => {
        setIsTracking(false);
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听编辑器内容变化，提取@后面的内容
    const updateListener = editor.registerUpdateListener(({ editorState }) => {
      if (!isTracking) return;
      
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        
        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        
        if (anchorNode instanceof TextNode) {
          const textContent = anchorNode.getTextContent();
          const offset = anchor.offset;
          
          // 查找@符号位置
          const lastAtPos = textContent.lastIndexOf('@', offset - 1);
          
          if (lastAtPos !== -1) {
            // 提取@后面到光标位置的文本内容
            const searchText = textContent.substring(lastAtPos + 1, offset);
            
            // 如果没有空格，发送更新命令
            if (!searchText.includes(' ')) {
              editor.dispatchCommand(MENTION_CONTENT_UPDATE_COMMAND, {
                searchText,
              });
            } else {
              // 如果有空格，取消提及状态
              editor.dispatchCommand(CANCEL_MENTIONS_COMMAND, undefined);
              setIsTracking(false);
            }
          } else {
            // 如果找不到@符号，取消提及状态
            editor.dispatchCommand(CANCEL_MENTIONS_COMMAND, undefined);
            setIsTracking(false);
          }
        } else {
          // 如果不是文本节点，取消提及状态
          editor.dispatchCommand(CANCEL_MENTIONS_COMMAND, undefined);
          setIsTracking(false);
        }
      });
    });
    
    return () => {
      startTrackingListener();
      stopTrackingListener();
      updateListener();
    };
  }, [editor, isTracking]);
  
  return null;
} 