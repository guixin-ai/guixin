import { useCallback, useEffect, useRef, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { 
  EditorState, 
  LexicalEditor, 
  $getRoot,
  $createParagraphNode,
  $createTextNode
} from 'lexical';
import {
  MentionsPlugin,
  KeyboardPlugin,
  EditorRefPlugin,
  OnChangePlugin,
  MentionTransformsPlugin,
} from './plugins';
import { MentionNode } from './nodes';
import { SimpleErrorBoundary } from './components/error-boundary';

// 聊天联系人接口
export interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  isAI: boolean;
}

// 聊天输入框属性
export interface ChatInputProps {
  onChange?: (value: string) => void;
  initialContent?: string;
  placeholder?: string;
  className?: string;
  contacts: ChatContact[]; // 现在联系人是必须的参数
  autoFocus?: boolean;
  children?: React.ReactNode; // 添加对子组件的支持，用于传入额外插件
}

// 主聊天输入组件
export function ChatInput({
  onChange,
  initialContent = '',
  placeholder = '输入消息...',
  className = '',
  contacts, // 联系人现在必须从外部传入
  autoFocus = true, // 默认启用自动聚焦
  children, // 额外的插件
}: ChatInputProps) {
  const editorRef = useRef<LexicalEditor | null>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  // 处理编辑器内容变化
  const handleEditorChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const root = $getRoot();

        // 获取文本内容（会包含提及节点）
        const text = root.getTextContent();

        // 调用外部onChange回调
        if (onChange) {
          onChange(text);
        }
      });
    },
    [onChange]
  );
  
  // 创建初始内容的函数
  const prepopulateContent = useCallback(() => {
    if (initialContent) {
      const root = $getRoot();
      if (root.getFirstChild() === null) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(initialContent));
        root.append(paragraph);
      }
    }
  }, [initialContent]);

  // 编辑器初始配置
  const initialConfig = {
    namespace: 'ChatInput',
    theme: {
      paragraph: 'my-2',
      text: {
        base: 'text-base',
      },
      mention:
        'bg-blue-100 dark:bg-blue-800/30 rounded-md text-blue-700 dark:text-blue-300 px-1.5 py-0.5 mx-[1px] inline-flex items-center select-none',
      mentionFocused: 'bg-blue-200 dark:bg-blue-700/40 outline-none',
    },
    onError: (error: Error) => {
      console.error('编辑器错误:', error);
    },
    nodes: [MentionNode], // 注册提及节点
    editorState: initialContent ? prepopulateContent : undefined, // 设置初始内容
  };

  // 当获取到编辑器引用时的处理函数
  const handleEditorRef = useCallback((editor: LexicalEditor) => {
    editorRef.current = editor;
  }, []);

  return (
    <div className={`border rounded-md p-2 ${className}`}>
      <div className="min-h-[60px] relative">
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                ref={contentEditableRef}
                className="outline-none min-h-[60px] max-h-[150px] overflow-y-auto py-2 px-3"
                data-placeholder={placeholder}
              />
            }
            placeholder={
              <div className="absolute top-[9px] left-3 text-gray-400 pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={SimpleErrorBoundary}
          />

          {/* 根据参数控制是否添加自动聚焦插件 */}
          {autoFocus && <AutoFocusPlugin defaultSelection="rootEnd" />}

          {/* 核心功能插件 */}
          <MentionsPlugin contacts={contacts} />
          <KeyboardPlugin />

          {/* MentionTransformsPlugin已被修改，不再提供自动转换功能 */}
          <MentionTransformsPlugin contacts={contacts} />

          {/* 工具和引用插件 */}
          <EditorRefPlugin onRef={handleEditorRef} />
          {onChange && <OnChangePlugin onChange={handleEditorChange} />}

          {/* 渲染额外的插件 */}
          {children}
        </LexicalComposer>
      </div>
    </div>
  );
}
