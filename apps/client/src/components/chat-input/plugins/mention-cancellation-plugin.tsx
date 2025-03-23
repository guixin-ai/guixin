import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  TextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  BLUR_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_ESCAPE_COMMAND,
} from 'lexical';
import { 
  SHOW_MENTIONS_COMMAND,
  CANCEL_MENTIONS_COMMAND 
} from '../commands';

/**
 * 提及取消插件
 * 负责监听以下情况并触发取消提及命令：
 * 1. 编辑器失去焦点
 * 2. 删除@符号
 * 3. 按下空格键
 * 4. 按下ESC键
 */
export function MentionCancellationPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    // 监听提及显示命令，开始监控
    const removeShowMentionsListener = editor.registerCommand(
      SHOW_MENTIONS_COMMAND,
      () => {
        setIsActive(true);
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听编辑器失去焦点事件
    const removeBlurListener = editor.registerCommand(
      BLUR_COMMAND,
      () => {
        if (isActive) {
          // 如果正在提及状态，触发取消命令
          editor.dispatchCommand(CANCEL_MENTIONS_COMMAND, undefined);
          setIsActive(false);
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听退格键，检查是否删除了@符号
    const removeBackspaceListener = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      () => {
        if (!isActive) return false;
        
        // 检查当前选择位置前是否有@符号
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          
          const anchor = selection.anchor;
          const anchorNode = anchor.getNode();
          
          if (anchorNode instanceof TextNode) {
            const textContent = anchorNode.getTextContent();
            const offset = anchor.offset;
            
            // 如果正在@符号后面并按下退格键，可能是删除了@符号
            const lastAtPos = textContent.lastIndexOf('@', offset);
            
            if (lastAtPos === -1 || offset <= lastAtPos) {
              // 如果没有找到@符号或光标在@符号前面，取消提及
              editor.dispatchCommand(CANCEL_MENTIONS_COMMAND, undefined);
              setIsActive(false);
            }
          }
        });
        
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听文本内容变化，检查是否删除了@符号
    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      if (!isActive) return;
      
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        
        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        
        if (anchorNode instanceof TextNode) {
          const textContent = anchorNode.getTextContent();
          const offset = anchor.offset;
          
          // 检查当前位置前面是否有@符号
          const lastAtPos = textContent.lastIndexOf('@', offset);
          
          if (lastAtPos === -1) {
            // 如果没有找到@符号，可能是已经被删除了
            editor.dispatchCommand(CANCEL_MENTIONS_COMMAND, undefined);
            setIsActive(false);
          } else if (offset > lastAtPos + 1) {
            // 检查@后是否有空格
            const hasSpace = textContent.substring(lastAtPos + 1, offset).includes(' ');
            if (hasSpace) {
              // 如果@后面输入了空格，取消提及
              editor.dispatchCommand(CANCEL_MENTIONS_COMMAND, undefined);
              setIsActive(false);
            }
          }
        } else {
          // 如果不是文本节点，取消提及
          editor.dispatchCommand(CANCEL_MENTIONS_COMMAND, undefined);
          setIsActive(false);
        }
      });
    });
    
    // 监听ESC键，取消提及状态
    const removeEscapeListener = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        if (isActive) {
          // 如果正在提及状态，发送取消命令
          editor.dispatchCommand(CANCEL_MENTIONS_COMMAND, undefined);
          setIsActive(false);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
    
    // 监听取消提及命令
    const removeCancelCommandListener = editor.registerCommand(
      CANCEL_MENTIONS_COMMAND,
      () => {
        console.log('CANCEL_MENTIONS_COMMAND received');
        setIsActive(false);
        return true; // 阻止其他处理
      },
      COMMAND_PRIORITY_HIGH
    );
    
    return () => {
      removeShowMentionsListener();
      removeBlurListener();
      removeBackspaceListener();
      removeUpdateListener();
      removeEscapeListener();
      removeCancelCommandListener();
    };
  }, [editor, isActive]);
  
  return null;
} 