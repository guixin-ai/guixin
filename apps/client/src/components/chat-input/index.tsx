import { useCallback, useEffect, useRef, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { 
  EditorState, 
  LexicalEditor,
  $getRoot,
} from 'lexical';
import { 
  MentionsPlugin, 
  KeyboardPlugin, 
  EditorRefPlugin, 
  OnChangePlugin, 
  SimpleErrorBoundary,
  MentionTransformsPlugin,
} from './plugins';
import { MentionNode } from './nodes';

// 聊天联系人接口
export interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  isAI: boolean;
}

// 默认测试联系人
const DEFAULT_CONTACTS: ChatContact[] = [
  { id: 'user1', name: '张三', isAI: false },
  { id: 'user2', name: '李四', isAI: false },
  { id: 'user3', name: '王五', isAI: false },
  { id: 'ai1', name: 'AI助手', isAI: true },
  { id: 'ai2', name: 'GPT模型', isAI: true },
];

// 聊天输入框属性
export interface ChatInputProps {
  onChange?: (value: string) => void;
  initialContent?: string;
  placeholder?: string;
  className?: string;
  contacts?: ChatContact[];
  children?: React.ReactNode; // 添加对子组件的支持，用于传入额外插件
}

// 主聊天输入组件
export function ChatInput({
  onChange,
  initialContent = '',
  placeholder = '输入消息...',
  className = '',
  contacts = DEFAULT_CONTACTS, // 使用默认联系人
  children, // 额外的插件
}: ChatInputProps) {
  const [editorValue, setEditorValue] = useState(initialContent);
  const editorRef = useRef<LexicalEditor | null>(null);
  
  // 处理编辑器内容变化
  const handleEditorChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      
      // 获取文本内容（会包含提及节点）
      const text = root.getTextContent();
      
      // 将编辑器值更新到状态中
      setEditorValue(text);
      
      // 调用外部onChange回调
      if (onChange) {
        // 尝试提取提及信息 - 这里只是简单示例，实际可能需要更复杂的序列化
        onChange(text);
      }
    });
  }, [onChange]);
  
  // 编辑器初始配置
  const initialConfig = {
    namespace: 'ChatInput',
    theme: {
      paragraph: 'my-2',
      text: {
        base: 'text-base',
      },
      mention: 'bg-blue-100 dark:bg-blue-800/30 rounded-md text-blue-700 dark:text-blue-300 px-1.5 py-0.5 mx-[1px] inline-flex items-center select-none',
      mentionFocused: 'bg-blue-200 dark:bg-blue-700/40 outline-none',
    },
    onError: (error: Error) => {
      console.error('编辑器错误:', error);
    },
    nodes: [MentionNode], // 注册提及节点
  };
  
  return (
    <div className={`border rounded-md p-2 ${className}`}>
      <div className="min-h-[60px] relative">
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
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
          <MentionsPlugin contacts={contacts} />
          <KeyboardPlugin />
          <EditorRefPlugin onRef={(editor) => { editorRef.current = editor; }} />
          {onChange && <OnChangePlugin onChange={handleEditorChange} />}
          
          {/* 添加提及转换插件，自动处理@提及 */}
          <MentionTransformsPlugin contacts={contacts} />
          
          {/* 渲染额外的插件 */}
          {children}
        </LexicalComposer>
      </div>
    </div>
  );
} 