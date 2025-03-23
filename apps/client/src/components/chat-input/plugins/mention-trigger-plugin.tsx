import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { KEY_DOWN_COMMAND, COMMAND_PRIORITY_NORMAL } from 'lexical';
import { SHOW_MENTIONS_COMMAND } from '../commands';

/**
 * 提及触发插件
 * 专门负责监听@符号的键盘输入，并发出触发命令
 * 简化版本：仅监听键盘事件，直接触发
 */
export function MentionTriggerPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 检测键盘@符号输入，立即触发提及功能
    const removeKeyDownListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key === '@') {
          editor.dispatchCommand(SHOW_MENTIONS_COMMAND, undefined);
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL
    );

    return () => {
      removeKeyDownListener();
    };
  }, [editor]);

  return null;
}
