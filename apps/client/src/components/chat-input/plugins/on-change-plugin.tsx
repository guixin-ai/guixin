import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { EditorState } from 'lexical';

// 内容变化插件
export function OnChangePlugin({ onChange }: { onChange: (editorState: EditorState) => void }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    // 使用registerUpdateListener可以在每次编辑器状态更新时触发
    // 包括所有类型的变化，如普通文本输入、格式变化、提及插入等
    return editor.registerUpdateListener(({ editorState }) => {
      // 无论什么类型的更新都会触发onChange
      onChange(editorState);
    });
  }, [editor, onChange]);
  
  return null;
} 