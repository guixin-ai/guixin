import { useCallback, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import {
  EditorState,
  LexicalEditor,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
} from 'lexical';
import {
  EditorRefPlugin,
  OnChangePlugin,
  MentionTriggerPlugin,
  MentionListPlugin,
  MentionTransformsPlugin,
  MentionContentTrackerPlugin,
  MentionCancellationPlugin,
  FocusDebugPlugin,
  MentionDeletionPlugin,
  MentionNavigationPlugin,
  EnterToLineBreakPlugin,
} from './plugins';
import { MentionNode } from './nodes';
import { SimpleErrorBoundary } from './components/error-boundary';
import { createLogger } from './utils/logger';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';

const logger = createLogger('聊天输入框');

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

/**
 * 聊天输入组件
 *
 * 主要功能：
 * 1. 基本文本输入 - 支持普通文本输入
 * 2. @提及功能 - 支持@联系人，显示下拉菜单并选择
 * 3. 自动聚焦 - 可通过autoFocus属性控制是否自动获取焦点
 * 4. 初始内容 - 通过initialContent可设置初始文本
 *
 * 提及功能使用细粒度的插件结构：
 * - MentionTriggerPlugin: 监听@符号输入，触发提及功能
 * - MentionContentTrackerPlugin: 追踪@后的内容变化
 * - MentionListPlugin: 显示和管理联系人列表
 * - MentionKeyboardPlugin: 处理键盘导航（上/下/回车）
 * - MentionTransformsPlugin: 将@文本转换为提及节点
 * - MentionNodePlugin: 处理提及节点的特殊行为
 * - MentionCancellationPlugin: 处理取消提及的情况
 * - MentionDeletionPlugin: 处理删除提及节点的逻辑
 * - MentionNavigationPlugin: 处理提及节点周围光标移动
 */
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
    (text: string) => {
      logger.debug('编辑器内容变化，文本内容:', text);

      // 调用外部onChange回调
      if (onChange) {
        onChange(text);
      }
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

          {/* 提及功能插件组 */}
          <MentionTriggerPlugin />
          <MentionContentTrackerPlugin />
          <MentionListPlugin contacts={contacts} />
          <MentionTransformsPlugin contacts={contacts} />
          <MentionCancellationPlugin />
          <MentionDeletionPlugin />
          <MentionNavigationPlugin />

          {/* 添加回车插入换行插件 */}
          <EnterToLineBreakPlugin />

          {/* 工具和引用插件 */}
          <EditorRefPlugin onRef={handleEditorRef} />
          {onChange && <OnChangePlugin onChange={handleEditorChange} />}
          <HistoryPlugin />
          {/* 焦点调试插件 */}
          <FocusDebugPlugin />

          {/* 渲染额外的插件 */}
          {children}
        </LexicalComposer>
      </div>
    </div>
  );
}
