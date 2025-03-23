import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  KEY_DOWN_COMMAND, 
  COMMAND_PRIORITY_NORMAL,
  COMMAND_PRIORITY_CRITICAL,
  KEY_SPACE_COMMAND,
  TextNode,
  $getSelection,
  $isRangeSelection
} from 'lexical';
import { SHOW_MENTIONS_COMMAND } from './mentions-plugin';

// 键盘插件 - 检测@键输入
export function KeyboardPlugin() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    // 检测键盘@符号输入，立即触发提及功能
    const removeKeyDownListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key === '@') {
          // 使用更高的优先级和延时确保@符号已输入到编辑器
          setTimeout(() => {
            editor.dispatchCommand(SHOW_MENTIONS_COMMAND, '@');
          }, 10);
        }
        return false;
      },
      COMMAND_PRIORITY_CRITICAL // 提高优先级
    );

    // 主动监听文本变化
    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        
        const textContent = selection.getTextContent();
        const lastChar = textContent.slice(-1);
        
        // 如果当前光标前最后一个字符是@，触发提及
        if (lastChar === '@') {
          editor.dispatchCommand(SHOW_MENTIONS_COMMAND, '@');
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