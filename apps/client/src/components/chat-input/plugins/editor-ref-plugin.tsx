import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalEditor } from 'lexical';

// 编辑器引用插件 - 用于获取编辑器实例
export function EditorRefPlugin({ onRef }: { onRef: (editor: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    onRef(editor);
  }, [editor, onRef]);
  
  return null;
} 