import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Message } from '../../models/routes/chat-chats.model';

/**
 * 带状态的消息类型
 * @interface
 * @extends {Message}
 * @property {('sending' | 'sent' | 'error')} [status] - 消息发送状态
 * @property {string} [error] - 错误信息
 * @property {boolean} [isLoading] - 消息是否正在加载中
 */
export interface MessageWithStatus extends Message {
  /** 消息发送状态：发送中、已发送、错误 */
  status?: 'sending' | 'sent' | 'error';
  /** 错误信息 */
  error?: string;
  /** 消息是否正在加载中 */
  isLoading?: boolean;
}

/**
 * 消息状态图标组件属性
 * @interface
 */
export interface MessageStatusIconProps {
  /** 消息状态 */
  status?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 消息状态图标组件
 *
 * 显示消息的发送状态图标：发送中、已发送、错误
 *
 * @param props - 组件属性
 */
export const MessageStatusIcon = ({ status, error }: MessageStatusIconProps) => {
  if (!status) return null;

  return (
    <div className="flex items-center ml-2" title={error}>
      {status === 'sending' && <Clock size={14} className="text-gray-400 animate-pulse" />}
      {status === 'sent' && <Check size={14} className="text-green-500" />}
      {status === 'error' && <AlertCircle size={14} className="text-red-500" />}
    </div>
  );
};

/**
 * 消息项组件属性
 * @interface
 */
export interface MessageItemProps {
  /** 消息数据 */
  data: MessageWithStatus;
}

/**
 * 消息项组件
 *
 * 显示单条消息的内容，包括：
 * - 发送者头像
 * - 消息内容
 * - 发送时间
 * - 消息状态
 *
 * @param props - 组件属性
 */
export const MessageItem = ({ data }: MessageItemProps) => {
  return (
    <div className={`flex mb-4 ${data.isSelf ? 'justify-end' : 'justify-start'}`}>
      {!data.isSelf && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white mr-2 shadow-sm">
          {data.sender}
        </div>
      )}
      <div className="max-w-[70%]">
        <div
          className={`p-3 rounded-2xl ${
            data.isSelf
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 dark:text-gray-100 shadow-sm'
          }`}
        >
          {data.isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              {data.content}
              {data.isTyping && (
                <span className="inline-block ml-1">
                  <span className="typing-dot">.</span>
                  <span className="typing-dot">.</span>
                  <span className="typing-dot">.</span>
                </span>
              )}
            </>
          )}
        </div>
        <div
          className={`flex items-center text-xs text-gray-500 mt-1 ${data.isSelf ? 'justify-end' : 'justify-start'}`}
        >
          <span>{data.time}</span>
          {data.isSelf && <MessageStatusIcon status={data.status} error={data.error} />}
        </div>
      </div>
      {data.isSelf && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white ml-2 shadow-sm">
          我
        </div>
      )}
    </div>
  );
};
