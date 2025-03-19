import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import { ChatInput, type ChatInputRef } from './chat-input';

const meta = {
  component: ChatInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基础用法示例
 */
export const 基础用法: Story = {
  args: {
    placeholder: '请输入消息...',
    onSend: message => {
      console.log('发送消息:', message);
    },
  },
};

/**
 * 禁用状态示例
 */
export const 禁用状态: Story = {
  args: {
    disabled: true,
    placeholder: '输入框已禁用',
  },
};

/**
 * 发送状态示例
 */
export const 发送状态: Story = {
  args: {
    isSending: true,
    placeholder: '正在发送消息...',
  },
};

/**
 * 通过 ref 可以访问以下方法：
 *
 * ```ts
 * interface ChatInputRef {
 *   // 获取当前输入框中的文本内容
 *   getMessage: () => string;
 *
 *   // 设置输入框的消息内容
 *   setMessage: (message: string) => void;
 *
 *   // 清空输入框内容
 *   clear: () => void;
 *
 *   // 使输入框获得焦点
 *   focus: () => void;
 * }
 * ```
 */
export const Ref接口示例: Story = {
  render: function RefExample(args) {
    const inputRef = useRef<ChatInputRef>(null);

    const handleSetMessage = () => {
      inputRef.current?.setMessage('这是通过 ref 设置的消息');
    };

    const handleClear = () => {
      inputRef.current?.clear();
    };

    const handleFocus = () => {
      inputRef.current?.focus();
    };

    const handleGetMessage = () => {
      const message = inputRef.current?.getMessage();
      alert(`当前消息内容: ${message}`);
    };

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSetMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            设置消息
          </button>
          <button
            onClick={handleGetMessage}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            获取消息
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            清空
          </button>
          <button
            onClick={handleFocus}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
          >
            聚焦
          </button>
        </div>
        <ChatInput
          ref={inputRef}
          {...args}
          placeholder="尝试使用上方的按钮控制输入框"
          onSend={message => {
            console.log('发送消息:', message);
          }}
        />
      </div>
    );
  },
};

/**
 * 暗色模式示例
 */
export const 暗色模式: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    className: 'dark',
  },
  args: {
    placeholder: '暗色模式下的输入框',
  },
};
