import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Smile, Paperclip, Image, Send } from 'lucide-react';
import { Textarea } from '../ui/textarea';

/**
 * 聊天输入框组件的属性接口
 */
export interface ChatInputProps {
  /**
   * 是否禁用输入
   * @default false
   */
  disabled?: boolean;
  /**
   * 占位符文本
   * @default "输入消息..."
   */
  placeholder?: string;
  /**
   * 发送消息的回调函数
   * @param message - 要发送的消息内容
   */
  onSend?: (message: string) => void;
  /**
   * 是否正在发送消息
   * @default false
   */
  isSending?: boolean;
}

/**
 * 聊天输入框组件的引用接口
 *
 * 提供了一组方法来控制输入框的行为：
 * - 获取/设置消息内容
 * - 清空输入框
 * - 控制输入框焦点
 *
 * @example
 * ```tsx
 * const inputRef = useRef<ChatInputRef>(null);
 *
 * // 获取当前消息
 * const message = inputRef.current?.getMessage();
 *
 * // 设置新消息
 * inputRef.current?.setMessage('新消息');
 *
 * // 清空输入框
 * inputRef.current?.clear();
 *
 * // 聚焦输入框
 * inputRef.current?.focus();
 * ```
 */
export interface ChatInputRef {
  /**
   * 获取当前输入框中的消息内容
   * @returns 当前输入框中的文本内容
   * @example
   * const message = inputRef.current?.getMessage();
   */
  getMessage: () => string;

  /**
   * 设置输入框的消息内容
   * @param message - 要设置的消息内容
   * @example
   * inputRef.current?.setMessage('新消息内容');
   */
  setMessage: (message: string) => void;

  /**
   * 清空输入框内容
   * 这个方法会将输入框内容设置为空字符串
   * @example
   * inputRef.current?.clear();
   */
  clear: () => void;

  /**
   * 使输入框获得焦点
   * 这个方法会将键盘焦点设置到输入框上
   * @example
   * inputRef.current?.focus();
   */
  focus: () => void;
}

/**
 * 聊天输入框组件
 *
 * 一个功能完整的聊天输入组件，支持：
 * - 文本输入和发送
 * - 表情、附件、图片按钮（UI 预留）
 * - Enter 快捷发送（Shift + Enter 换行）
 * - 禁用状态
 * - 发送状态
 * - 支持暗色模式
 * - 通过 ref 暴露控制接口
 *
 * @example
 *
 * ```tsx
 * const chatInputRef = useRef<ChatInputRef>(null);
 *
 * <ChatInput
 *   placeholder="请输入消息..."
 *   onSend={(message) => console.log('发送消息:', message)}
 *   ref={chatInputRef}
 * />
 *
 * // 使用 ref 控制输入框
 * chatInputRef.current?.clear();
 * chatInputRef.current?.focus();
 * ```
 */
export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  ({ disabled, placeholder, onSend, isSending }, ref) => {
    const [message, setMessage] = useState('');

    useImperativeHandle(
      ref,
      () => ({
        getMessage: () => message,
        setMessage: (newMessage: string) => setMessage(newMessage),
        clear: () => setMessage(''),
        focus: () => textareaRef.current?.focus(),
      }),
      [message]
    );

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim() && onSend && !disabled && !isSending) {
        onSend(message.trim());
        setMessage('');
      }
    };

    return (
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-lg">
        <div className="flex mb-2">
          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all mr-1">
            <Smile size={20} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all mr-1">
            <Paperclip size={20} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all">
            <Image size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="flex-1 p-3 rounded-2xl resize-none bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
            placeholder={placeholder}
            disabled={disabled || isSending}
            rows={1}
          />
          <button
            type="submit"
            disabled={!message.trim() || disabled || isSending}
            className={`ml-2 px-4 rounded-full flex items-center justify-center transition-all ${
              !message.trim() || disabled || isSending
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-md'
            }`}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';
