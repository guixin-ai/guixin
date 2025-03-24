import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  KEY_DOWN_COMMAND, 
  COMMAND_PRIORITY_NORMAL,
  $getSelection,
  $isRangeSelection,
  TextNode
} from 'lexical';
import { SHOW_MENTIONS_COMMAND } from '../commands';

/**
 * 提及触发插件
 * 专门负责监听@符号的键盘输入，并发出触发命令
 * 条件：
 * 1. @符号前面是空格，或者
 * 2. @符号在文本的开头位置
 */
export function MentionTriggerPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 检测键盘@符号输入，在满足条件时触发提及功能
    const removeKeyDownListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key === '@') {
          // 读取编辑器状态来获取光标位置
          editor.getEditorState().read(() => {
            const selection = $getSelection();
            
            // 只处理范围选择（光标选择）的情况
            if (!$isRangeSelection(selection)) {
              return;
            }
            
            const anchor = selection.anchor;
            const anchorNode = anchor.getNode();
            const offset = anchor.offset;
            
            // 检查是否在文本节点中
            if (anchorNode instanceof TextNode) {
              const textContent = anchorNode.getTextContent();
              
              // 条件1：@符号在文本的开头位置
              if (offset === 0) {
                console.log('SHOW_MENTIONS_COMMAND - 文本开头');
                editor.dispatchCommand(SHOW_MENTIONS_COMMAND, undefined);
                return;
              }
              
              // 条件2：@符号前面是空格
              if (offset > 0) {
                const charBeforeCursor = textContent.charAt(offset - 1);
                if (charBeforeCursor === ' ') {
                  console.log('SHOW_MENTIONS_COMMAND - 空格后');
                  editor.dispatchCommand(SHOW_MENTIONS_COMMAND, undefined);
                  return;
                }
              }
            } else {
              // 在非文本节点的开始位置，如空段落等
              if (offset === 0) {
                console.log('SHOW_MENTIONS_COMMAND - 非文本节点开头');
                editor.dispatchCommand(SHOW_MENTIONS_COMMAND, undefined);
                return;
              }
            }
          });
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
