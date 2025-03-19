import { forwardRef, useImperativeHandle, useRef } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  VirtuosoMessage,
  VirtuosoMessageListMethods,
} from '../lib/virtuoso-message/virtuoso-message';
import { MessageItem, MessageWithStatus } from '../message-item';

/**
 * 消息列表组件的属性接口
 * @interface
 */
export interface MessageListProps {
  /** 初始消息列表 */
  initialMessages?: MessageWithStatus[];
  /** 是否正在加载消息 */
  isLoading?: boolean;
  /** 加载错误信息 */
  error?: string | null;
  /** 重试加载的回调函数 */
  onRetry?: () => void;
}

/**
 * 消息列表组件的引用接口
 * @interface
 */
export interface MessageListRef {
  /**
   * 添加一条消息到列表末尾
   * @param message - 要添加的消息
   * @param style - 插入风格
   * - 'gemini': Gemini 风格，新消息对齐到顶部
   * - 'normal': 普通风格，新消息对齐到底部（默认）
   */
  appendMessage: (message: MessageWithStatus, options?: { style?: 'gemini' }) => void;
  /**
   * 更新指定消息
   * @param messageId - 消息ID
   * @param updates - 要更新的消息属性
   */
  updateMessage: (messageId: string, updates: Partial<MessageWithStatus>) => void;
  /** 获取当前所有消息 */
  getMessages: () => MessageWithStatus[];
  /** 清空消息列表 */
  clearMessages: () => void;
  /**
   * 替换整个消息列表
   * @param messages - 新的消息列表
   */
  replaceMessages: (messages: MessageWithStatus[]) => void;
}

/**
 * 消息列表组件
 *
 * 一个无状态的消息列表组件，用于显示聊天消息。支持以下功能：
 * - 虚拟滚动，高效处理大量消息
 * - 消息状态显示（发送中、已发送、错误）
 * - 加载状态和错误处理
 * - 通过 ref 提供消息操作 API
 * - 支持暗色模式
 * - 响应式布局
 *
 * @component
 * @remarks
 *
 * 使用限制：
 * 1. 该组件必须直接放置在一个设置了 `display: flex` 和明确高度的容器中
 * 2. 不能被额外的 flex 容器包裹（不要在父容器上使用 flex-1 或其他 flex 属性）
 * 3. 组件会自动占据父容器的剩余空间
 *
 * @example
 *
 * ```tsx
 * // ✅ 正确：直接在 flex 容器中使用
 * <div className="flex flex-col h-[500px]">
 *   <div>其他内容</div>
 *   <MessageList
 *     ref={messageListRef}
 *     initialMessages={messages}
 *     isLoading={false}
 *     error={null}
 *     onRetry={() => {}}
 *   />
 * </div>
 * ```
 *
 * @example
 *
 * ```tsx
 * // ❌ 错误：不要用额外的 flex 容器包裹
 * <div className="flex flex-col h-[500px]">
 *   <div>其他内容</div>
 *   <div className="flex-1 flex flex-col"> // 不要这样包裹
 *     <MessageList
 *       ref={messageListRef}
 *       initialMessages={messages}
 *     />
 *   </div>
 * </div>
 * ```
 */
export const MessageList = forwardRef<MessageListRef, MessageListProps>(
  ({ initialMessages, isLoading, error, onRetry }, ref) => {
    const virtuosoRef = useRef<VirtuosoMessageListMethods<MessageWithStatus>>(null);

    // 暴露组件API
    useImperativeHandle(ref, () => ({
      appendMessage: (message: MessageWithStatus, options?: { style?: 'gemini' }) => {
        if (options?.style === 'gemini') {
          virtuosoRef.current?.data.append([message], ({ atBottom, scrollInProgress }) => {
            return {
              index: 'LAST',
              align: 'start',
              behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
            };
          });
          return;
        }

        virtuosoRef.current?.data.append([message]);
      },
      updateMessage: (messageId: string, updates: Partial<MessageWithStatus>) => {
        virtuosoRef.current?.data.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, ...updates };
          }
          return msg;
        }, 'smooth');
      },
      getMessages: () => {
        return virtuosoRef.current?.data.get() || [];
      },
      clearMessages: () => {
        virtuosoRef.current?.data.replace([]);
      },
      replaceMessages: (messages: MessageWithStatus[]) => {
        virtuosoRef.current?.data.replace(messages);
      },
    }));

    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">加载消息中...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500 flex flex-col items-center">
            <AlertCircle size={24} className="mb-2" />
            <span>{error}</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                重试
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <VirtuosoMessage<MessageWithStatus, null>
        ref={virtuosoRef}
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        initialData={initialMessages}
        computeItemKey={({ data }) => data.id}
        initialLocation={{ index: 'LAST', align: 'end' }}
        ItemContent={MessageItem}
      />
    );
  }
);
