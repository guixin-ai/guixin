import type { Meta, StoryObj } from '@storybook/react';
import { MessageItem, MessageWithStatus } from './message-item';

const meta = {
  component: MessageItem,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div className="w-[600px] p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof MessageItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 用户发送的消息
 */
export const 用户消息: Story = {
  args: {
    data: {
      id: '1',
      content: '你好！我有一些问题想请教。',
      sender: '我',
      time: '10:01',
      isSelf: true,
      status: 'sent',
    } as MessageWithStatus,
  },
};

/**
 * AI 回复的消息
 */
export const AI消息: Story = {
  args: {
    data: {
      id: '2',
      content: '你好！我是 AI 助手，很高兴为你提供帮助。请问有什么我可以帮你的？',
      sender: 'AI',
      time: '10:02',
      isSelf: false,
    } as MessageWithStatus,
  },
};

/**
 * 消息发送中状态
 */
export const 发送中状态: Story = {
  args: {
    data: {
      id: '3',
      content: '这是一条正在发送中的消息...',
      sender: '我',
      time: '10:03',
      isSelf: true,
      status: 'sending',
    } as MessageWithStatus,
  },
};

/**
 * 消息发送失败状态
 */
export const 发送失败状态: Story = {
  args: {
    data: {
      id: '4',
      content: '这是一条发送失败的消息',
      sender: '我',
      time: '10:04',
      isSelf: true,
      status: 'error',
      error: '网络连接失败',
    } as MessageWithStatus,
  },
};

/**
 * 消息加载中状态
 */
export const 加载中状态: Story = {
  args: {
    data: {
      id: '5',
      content: '',
      sender: 'AI',
      time: '10:05',
      isSelf: false,
      isLoading: true,
    } as MessageWithStatus,
  },
};

/**
 * AI 打字效果
 */
export const 打字效果: Story = {
  args: {
    data: {
      id: '6',
      content: '正在生成回复',
      sender: 'AI',
      time: '10:06',
      isSelf: false,
      isTyping: true,
    } as MessageWithStatus,
  },
};

/**
 * 长文本消息
 */
export const 长文本消息: Story = {
  args: {
    data: {
      id: '7',
      content:
        'React 虚拟化列表有以下几个主要优势：\n\n1. 提高性能：只渲染可见区域的内容，减少 DOM 节点数量\n2. 内存优化：不会一次性创建所有列表项\n3. 滚动流畅：通过复用 DOM 节点，实现平滑滚动\n4. 适合大数据：能够处理成千上万的列表项\n\n使用虚拟化列表的最佳实践：\n\n1. 固定高度的列表项\n2. 提供准确的滚动容器尺寸\n3. 实现高效的渲染逻辑\n4. 添加适当的缓冲区',
      sender: 'AI',
      time: '10:07',
      isSelf: false,
    } as MessageWithStatus,
  },
};

/**
 * 消息状态图标组合展示
 */
export const 状态图标组合: Story = {
  args: {
    data: {
      id: '8-1',
      content: '发送中状态',
      sender: '我',
      time: '10:08',
      isSelf: true,
      status: 'sending',
    } as MessageWithStatus,
  },
  render: args => (
    <div className="flex flex-col gap-4">
      <MessageItem
        data={{
          id: '8-1',
          content: '发送中状态',
          sender: '我',
          time: '10:08',
          isSelf: true,
          status: 'sending',
        }}
      />
      <MessageItem
        data={{
          id: '8-2',
          content: '发送成功状态',
          sender: '我',
          time: '10:09',
          isSelf: true,
          status: 'sent',
        }}
      />
      <MessageItem
        data={{
          id: '8-3',
          content: '发送失败状态',
          sender: '我',
          time: '10:10',
          isSelf: true,
          status: 'error',
          error: '网络连接失败',
        }}
      />
    </div>
  ),
};
