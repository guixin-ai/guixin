import { useCallback, useRef, useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import {
  EditorState,
  LexicalEditor,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  SerializedEditorState,
  createEditor,
} from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';

import { SimpleErrorBoundary } from '../chat-input/components/error-boundary';

// Markdown 文档输入框属性
export interface MarkdownDocInputProps {
  onChange?: (markdown: string, json: SerializedEditorState) => void;
  initialMarkdown?: string;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  children?: React.ReactNode; // 支持额外插件
}

/**
 * Markdown 文档输入组件
 * 
 * 主要功能：
 * 1. 支持 Markdown 语法输入和编辑
 * 2. 可导入/导出 Markdown 格式
 * 3. 支持常见 Markdown 快捷输入（如 # 标题、* 列表等）
 * 4. 自动保留 Markdown 格式
 */
export function MarkdownDocInput({
  onChange,
  initialMarkdown = '',
  placeholder = '输入 Markdown 文档...',
  className = '',
  autoFocus = true,
  readOnly = false,
  children,
}: MarkdownDocInputProps) {
  const contentEditableRef = useRef<HTMLDivElement>(null);

  // 修改 onChange 回调
  const handleEditorChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const root = $getRoot();
        const markdown = $convertToMarkdownString(TRANSFORMERS, root);
        if (onChange) {
          onChange(markdown, editorState.toJSON());
        }
      });
    },
    [onChange]
  );

  // 创建初始配置
  const initialConfig = {
    namespace: 'MarkdownDocInput',
    theme: {
      paragraph: 'my-2',
      heading: {
        h1: 'text-3xl font-bold my-3',
        h2: 'text-2xl font-bold my-3',
        h3: 'text-xl font-bold my-2',
        h4: 'text-lg font-bold my-2',
        h5: 'text-base font-bold my-1',
        h6: 'text-sm font-bold my-1',
      },
      list: {
        ol: 'list-decimal pl-5 my-2',
        ul: 'list-disc pl-5 my-2',
        listitem: 'my-1',
        nested: {
          listitem: 'my-1',
        },
      },
      quote: 'border-l-4 border-gray-300 pl-4 my-2 text-gray-600',
      code: 'bg-gray-100 p-2 rounded font-mono text-sm my-2 block',
      codeHighlight: {
        atrule: 'text-blue-500',
        attr: 'text-blue-500',
        boolean: 'text-purple-500',
        builtin: 'text-green-500',
        cdata: 'text-gray-500',
        char: 'text-green-500',
        class: 'text-blue-500',
        'class-name': 'text-blue-500',
        comment: 'text-gray-500 italic',
        constant: 'text-purple-500',
        deleted: 'text-red-500',
        doctype: 'text-gray-500',
        entity: 'text-yellow-500',
        function: 'text-yellow-500',
        important: 'text-yellow-500',
        inserted: 'text-green-500',
        keyword: 'text-purple-500',
        namespace: 'text-yellow-500',
        number: 'text-purple-500',
        operator: 'text-blue-500',
        prolog: 'text-gray-500',
        property: 'text-blue-500',
        punctuation: 'text-gray-500',
        regex: 'text-red-500',
        selector: 'text-blue-500',
        string: 'text-green-500',
        symbol: 'text-purple-500',
        tag: 'text-blue-500',
        url: 'text-blue-500',
        variable: 'text-yellow-500',
      },
      text: {
        bold: 'font-bold',
        italic: 'italic',
        strikethrough: 'line-through',
        underline: 'underline',
        code: 'bg-gray-100 px-1 py-0.5 rounded font-mono text-sm',
      },
      link: 'text-blue-500 underline',
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListItemNode,
      ListNode,
      CodeHighlightNode,
      CodeNode,
      AutoLinkNode,
      LinkNode,
    ],
    onError: (error: Error) => {
      console.error('Lexical Editor Error:', error);
    },
    editable: !readOnly,
  };

  // 初始化编辑器状态
  const initializeEditor = useCallback((editor: LexicalEditor) => {
    editor.update(() => {
      const root = $getRoot();
      if (root.isEmpty()) {
        if (initialMarkdown) {
          // 如果有初始内容，尝试转换为 Markdown
          try {
            const state = $convertFromMarkdownString(initialMarkdown, TRANSFORMERS);
            if (state) {
              editor.setEditorState(state);
              return;
            }
          } catch (error) {
            console.error('Failed to parse markdown:', error);
          }
        }
        // 如果没有初始内容或转换失败，创建一个空段落
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(''));
        root.append(paragraph);
      }
    }, {
      tag: 'history-merge'
    });
  }, [initialMarkdown]);

  return (
    <div className={`border rounded-md ${className}`}>
      <div className="relative">
        <LexicalComposer initialConfig={{
          ...initialConfig,
          editorState: (editor) => {
            initializeEditor(editor);
          },
        }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                ref={contentEditableRef}
                className={`outline-none min-h-[200px] p-4 overflow-y-auto ${readOnly ? 'bg-gray-50' : ''}`}
                data-placeholder={placeholder}
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={SimpleErrorBoundary}
          />

          {/* 根据参数控制是否添加自动聚焦插件 */}
          {autoFocus && !readOnly && <AutoFocusPlugin />}

          {/* 核心 Markdown 功能插件 */}
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          
          {/* 历史记录插件（撤销/重做） */}
          <HistoryPlugin />

          {/* 监听内容变化 */}
          {onChange && (
            <OnChangePlugin onChange={handleEditorChange} />
          )}

          {/* 渲染额外的插件 */}
          {children}
        </LexicalComposer>
      </div>
    </div>
  );
}

// 内容变化监听插件
const OnChangePlugin: React.FC<{
  onChange: (editorState: EditorState) => void;
}> = ({ onChange }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState);
    });
  }, [editor, onChange]);

  return null;
}; 