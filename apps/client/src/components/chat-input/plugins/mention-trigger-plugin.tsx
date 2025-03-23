import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  KEY_DOWN_COMMAND, 
  COMMAND_PRIORITY_NORMAL,
  TextNode,
  $getSelection,
  $isRangeSelection,
  createCommand,
  LexicalCommand,
} from 'lexical';

// 创建一个自定义命令用于触发提及功能
export const SHOW_MENTIONS_COMMAND: LexicalCommand<void> = createCommand('SHOW_MENTIONS_COMMAND');

// 创建一个自定义命令用于传递@的位置信息
export const MENTION_POSITION_COMMAND: LexicalCommand<{
  left: number;
  top: number;
  text: string;
}> = createCommand('MENTION_POSITION_COMMAND');

/**
 * 提及触发插件
 * 专门负责监听@符号的输入，并发出触发命令
 * 独立出来有助于关注点分离
 */
export function MentionTriggerPlugin() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    // 检测键盘@符号输入，立即触发提及功能
    const removeKeyDownListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key === '@') {
          // 使用更高的优先级和延时确保@符号已输入到编辑器
          setTimeout(() => {
            editor.dispatchCommand(SHOW_MENTIONS_COMMAND, undefined);
          }, 10);
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL
    );

    // 监听文本变化，检测@符号
    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        
        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        
        if (anchorNode instanceof TextNode) {
          const textContent = anchorNode.getTextContent();
          const offset = anchor.offset;
          
          // 找到最后一个@符号
          const lastAtPos = textContent.lastIndexOf('@');
          
          if (lastAtPos !== -1 && lastAtPos < offset) {
            // 计算@后面的文本
            const searchText = textContent.substring(lastAtPos + 1, offset);
            
            // 获取@符号的位置
            const domSelection = window.getSelection();
            const domRange = domSelection?.getRangeAt(0);
            
            if (domRange) {
              // 创建一个临时范围用于定位@符号
              const tempRange = document.createRange();
              tempRange.setStart(domRange.startContainer, lastAtPos);
              tempRange.setEnd(domRange.startContainer, lastAtPos + 1);
              
              // 获取@符号的边界框
              const rect = tempRange.getBoundingClientRect();
              
              // 找到编辑器容器
              const editorElement = editor.getRootElement();
              if (rect && editorElement) {
                const editorRect = editorElement.getBoundingClientRect();
                
                // 发送位置信息命令
                editor.dispatchCommand(MENTION_POSITION_COMMAND, {
                  left: rect.left - editorRect.left,
                  top: rect.bottom - editorRect.top,
                  text: searchText
                });
              }
            }
          }
        }
      });
    });

    return () => {
      removeKeyDownListener();
      removeUpdateListener();
    };
  }, [editor]);
  
  return null;
} 