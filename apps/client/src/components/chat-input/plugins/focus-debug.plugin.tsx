import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { BLUR_COMMAND, COMMAND_PRIORITY_LOW, FOCUS_COMMAND } from 'lexical';

/**
 * 焦点调试插件
 * 
 * 监听编辑器的获取焦点和失去焦点事件，并打印调试信息
 */
export function FocusDebugPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;

    // 监听获取焦点事件
    const removeFocusListener = editor.registerCommand(
      FOCUS_COMMAND,
      () => {
        console.log('编辑器获得焦点', new Date().toISOString());
        return false; // 不阻止继续传播，让其他插件也能接收到这个命令
      },
      COMMAND_PRIORITY_LOW
    );

    // 监听失去焦点事件
    const removeBlurListener = editor.registerCommand(
      BLUR_COMMAND,
      () => {
        console.log('编辑器失去焦点', new Date().toISOString());
        return false; // 不阻止继续传播
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      removeFocusListener();
      removeBlurListener();
    };
  }, [editor]);

  return null;
} 