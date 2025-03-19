import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatInput, ChatInputRef } from '../chat-input/chat-input';
import { MessageList, MessageListRef, MessageWithStatus } from '../message-list/message-list';

/**
 * 聊天窗口组件的属性接口
 */
interface ChatWindowProps {
  /** 当前活跃的聊天对象，包含聊天的基本信息 */
  activeChat?: {
    /** 聊天的唯一标识符 */
    id: string;
    /** 聊天对象的名称 */
    name: string;
    /** 聊天对象的头像文本 */
    avatar: string;
  };
  /** 加载消息的回调函数 */
  onLoadMessages?: () => Promise<MessageWithStatus[]>;
  /** 发送消息的回调函数 */
  onSendMessage: (message: string) => void;
  /** 是否禁用输入框 */
  disabled?: boolean;
  /** 输入框占位符文本 */
  inputPlaceholder?: string;
  /**
   * 加载指示器延迟显示时间（毫秒），在此时间内完成加载则不显示加载状态，默认 500ms
   *
   * @remarks
   * 此参数用于控制消息列表加载状态的显示时机，主要用于优化初始加载体验：
   * 1. 当加载时间 < loadingIndicatorDelay：用户不会看到加载状态，直接看到消息列表
   * 2. 当加载时间 > loadingIndicatorDelay：先显示加载状态，后显示消息列表
   *
   * 使用场景：
   * - 设置较小的值：几乎立即显示加载状态，适合需要明确反馈的场景
   * - 设置较大的值：只有长时间加载才显示加载状态，避免短暂加载导致的界面闪烁
   */
  loadingIndicatorDelay?: number;
}

/**
 * 聊天窗口组件的 ref 接口
 *
 * @remarks
 * 消息发送和接收的最佳实践流程：
 *
 * 1. 发送消息流程：
 * ```typescript
 * // 发送消息并获取消息ID
 * const messageId = chatWindowRef.current.sendMessage('要发送的消息');
 * console.log('消息已发送，ID:', messageId);
 * ```
 *
 * 2. 接收消息流程：
 * ```typescript
 * // 接收消息并获取消息ID
 * const receivedMessageId = chatWindowRef.current.receiveMessage({
 *   id: 'unique-id',
 *   content: '接收到的消息内容',
 *   time: new Date().toLocaleTimeString(),
 *   sender: 'ai',
 *   isSelf: false
 * });
 * console.log('消息已接收，ID:', receivedMessageId);
 * ```
 *
 * 3. 流式响应处理：
 * ```typescript
 * // 1. 创建初始消息
 * const messageId = chatWindowRef.current.receiveMessage({
 *   id: 'stream-msg-id',
 *   content: '',
 *   time: new Date().toLocaleTimeString(),
 *   sender: 'ai',
 *   isSelf: false,
 *   status: 'sending'
 * });
 *
 * try {
 *   // 2. 开始接收流式响应
 *   for await (const chunk of streamResponse) {
 *     // 3. 持续更新消息内容
 *     chatWindowRef.current.updateMessageContent(messageId, chunk);
 *   }
 *
 *   // 4. 流式响应完成，更新状态
 *   chatWindowRef.current.updateMessageStatus(messageId, 'sent');
 * } catch (error) {
 *   // 5. 处理错误
 *   chatWindowRef.current.updateMessageStatus(messageId, 'error', error.message);
 * }
 * ```
 *
 * @interface
 */
export interface ChatWindowRef {
  /**
   * 发送消息
   * @param content - 消息内容
   * @returns 消息的唯一标识符
   */
  sendMessage: (content: string) => string;

  /**
   * 接收消息
   * @param message - 完整的消息对象
   * @returns 消息的唯一标识符
   */
  receiveMessage: (message: MessageWithStatus) => string;

  /**
   * 更新消息内容
   * @param messageId - 消息的标识符
   * @param content - 新的消息内容
   *
   * @remarks
   * 用于更新现有消息的内容，常用于流式响应的场景。
   */
  updateMessageContent: (messageId: string, content: string) => void;

  /**
   * 更新消息状态
   * @param messageId - 消息的标识符
   * @param status - 新的消息状态
   * @param error - 可选的错误信息
   *
   * @remarks
   * 用于更新消息的发送状态和错误信息。
   */
  updateMessageStatus: (
    messageId: string,
    status: 'sending' | 'sent' | 'error',
    error?: string
  ) => void;
}

/**
 * 聊天窗口组件
 *
 * 一个简单的聊天界面布局组件，负责：
 * - 组合消息列表和输入框
 * - 提供聊天窗口的基本布局
 * - 支持暗色模式
 * - 响应式设计
 * - 处理消息加载状态
 *
 * @remarks
 * 布局使用说明：
 * 1. 该组件必须放置在一个设置了 `flex` 或 `grid` 布局的容器中
 * 2. 父容器必须有明确的高度（例如：h-screen、h-[500px] 等）
 * 3. 组件会自动占据父容器的所有可用空间
 *
 * @example
 *
 * ```tsx
 * // ✅ 正确：在 flex 容器中使用
 * <div className="flex flex-col h-screen">
 *   <header className="h-16">Header</header>
 *   <ChatWindow
 *     activeChat={{ id: "1", name: "AI 助手", avatar: "AI" }}
 *     onLoadMessages={async () => {
 *       const messages = await fetchMessages();
 *       return messages;
 *     }}
 *     onSendMessage={(message) => {
 *       console.log('发送消息:', message);
 *     }}
 *   />
 *   <footer className="h-16">Footer</footer>
 * </div>
 * ```
 *
 * @example
 *
 * ```tsx
 * // ❌ 错误：没有设置父容器高度
 * <div className="flex flex-col">
 *   <ChatWindow />
 * </div>
 * ```
 *
 * @example
 *
 * ```tsx
 * // ❌ 错误：父容器没有使用 flex 或 grid 布局
 * <div className="h-screen">
 *   <ChatWindow />
 * </div>
 * ```
 */
export const ChatWindow = forwardRef<ChatWindowRef, ChatWindowProps>(
  (
    {
      activeChat,
      onLoadMessages,
      onSendMessage,
      disabled = false,
      inputPlaceholder = '输入消息...',
      loadingIndicatorDelay = 500,
    },
    ref
  ) => {
    const messageListRef = useRef<MessageListRef>(null);
    const chatInputRef = useRef<ChatInputRef>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loadingTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    // 添加消息列表状态对象，包含 key 和初始消息
    const [messageListState, setMessageListState] = useState<{
      key: number;
      initialMessages: MessageWithStatus[];
    }>({
      key: 0,
      initialMessages: [],
    });

    // 加载消息
    const loadMessages = async () => {
      if (!activeChat || !onLoadMessages) return;

      console.log('开始加载消息流程 - chatId:', activeChat.id);

      // 清除之前的定时器
      if (loadingTimerRef.current) {
        console.log('清除之前的定时器');
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = undefined;
      }

      setError(null);
      setIsLoading(false); // 重置初始状态

      const startTime = Date.now();
      let shouldShowLoading = false;

      // 设置防抖定时器
      console.log('设置加载指示器延迟定时器, 延迟时间:', loadingIndicatorDelay, 'ms');
      const timer = setTimeout(() => {
        console.log('延迟时间已到，设置 shouldShowLoading = true');
        shouldShowLoading = true;
        setIsLoading(true);
      }, loadingIndicatorDelay);

      loadingTimerRef.current = timer;

      try {
        console.log('调用 onLoadMessages');
        const loadedMessages = await onLoadMessages();
        const loadTime = Date.now() - startTime;
        console.log('消息加载完成，耗时:', loadTime, 'ms');

        // 清除定时器
        clearTimeout(timer);
        loadingTimerRef.current = undefined;

        // 更新消息列表状态，通过改变 key 强制重新渲染
        setMessageListState({
          key: messageListState.key + 1,
          initialMessages: loadedMessages,
        });
        console.log('消息列表状态更新完成', loadedMessages);

        // 如果已经显示了加载状态，则清除它
        if (shouldShowLoading) {
          console.log('清除已显示的加载状态');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('加载消息失败:', err);
        setError(err instanceof Error ? err.message : '加载消息失败');
        clearTimeout(timer);
        loadingTimerRef.current = undefined;
        setIsLoading(false);
      }
    };

    // 清理定时器
    useEffect(() => {
      return () => {
        if (loadingTimerRef.current) {
          console.log('组件卸载，清理定时器');
          clearTimeout(loadingTimerRef.current);
        }
      };
    }, []);

    // 当活跃聊天改变时加载消息
    useEffect(() => {
      loadMessages();
    }, [activeChat?.id]);

    // 暴露 ref 方法
    useImperativeHandle(ref, () => {
      return {
        sendMessage: (content: string) => {
          const tempId = `temp-${Date.now()}`;
          messageListRef.current?.appendMessage(
            {
              id: tempId,
              content,
              time: new Date().toLocaleTimeString(),
              sender: 'user',
              isSelf: true,
              status: 'sent',
            },
            {
              style: 'gemini',
            }
          );
          return tempId;
        },

        receiveMessage: (message: MessageWithStatus) => {
          messageListRef.current?.appendMessage({
            ...message,
            status: message.status || 'sent',
          });
          return message.id;
        },

        updateMessageContent: (messageId: string, content: string) => {
          messageListRef.current?.updateMessage(messageId, { content });
        },

        updateMessageStatus: (
          messageId: string,
          status: 'sending' | 'sent' | 'error',
          error?: string
        ) => {
          messageListRef.current?.updateMessage(messageId, { status, error });
        },
      };
    });

    // 处理发送消息
    const handleSendMessage = (message: string) => {
      onSendMessage(message);
    };

    if (!activeChat) {
      return (
        <div className="flex-1 h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="text-blue-500 mb-4">
              <MessageSquare size={48} className="mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">请选择一个聊天开始对话</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* 聊天头部 */}
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white mr-3 shadow-sm">
              {activeChat.avatar}
            </div>
            <span className="font-medium dark:text-white">{activeChat.name}</span>
          </div>
        </div>

        {/* 消息列表 */}
        <MessageList
          key={messageListState.key}
          ref={messageListRef}
          initialMessages={messageListState.initialMessages}
          isLoading={isLoading}
          error={error}
          onRetry={loadMessages}
        />

        {/* 输入区域 */}
        <ChatInput
          ref={chatInputRef}
          disabled={disabled}
          placeholder={inputPlaceholder}
          onSend={handleSendMessage}
        />
      </div>
    );
  }
);

export default ChatWindow;
