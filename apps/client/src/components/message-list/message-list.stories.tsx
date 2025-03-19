import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import type { MessageListProps } from './message-list';
import { MessageList, MessageListRef } from './message-list';
import { MessageWithStatus } from '../message-item';

const meta = {
  component: MessageList,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div className="flex flex-col h-[600px] w-[600px] border border-gray-200 rounded-lg overflow-hidden">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof MessageList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockMessages: MessageWithStatus[] = [
  {
    id: '1',
    content: '你好！',
    sender: 'AI',
    time: '10:00',
    isSelf: false,
  },
  {
    id: '2',
    content: '你好！我有一些问题想请教。',
    sender: '我',
    time: '10:01',
    isSelf: true,
    status: 'sent',
  },
  {
    id: '3',
    content: '好的，请问有什么我可以帮你的？',
    sender: 'AI',
    time: '10:01',
    isSelf: false,
  },
];

// 随机短语，用于模拟打字效果
const randomPhrases = [
  'React 虚拟化列表有以下几个主要优势：\n\n1. 提高性能：只渲染可见区域的内容，减少 DOM 节点数量\n2. 内存优化：不会一次性创建所有列表项\n3. 滚动流畅：通过复用 DOM 节点，实现平滑滚动\n4. 适合大数据：能够处理成千上万的列表项',
  '让我为你解释虚拟化列表的工作原理：\n\n1. 计算可视区域大小\n2. 只渲染可见的列表项\n3. 监听滚动事件\n4. 动态更新可见内容',
  '使用虚拟化列表的最佳实践：\n\n1. 固定高度的列表项\n2. 提供准确的滚动容器尺寸\n3. 实现高效的渲染逻辑\n4. 添加适当的缓冲区',
];

function getRandomPhrase() {
  return randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
}

/**
 * 默认视图展示了一个包含多条消息的对话。
 * 消息包括：
 * - AI 发送的消息
 * - 用户发送的消息（带发送状态）
 *
 * 注意：组件必须在 flex 容器中使用，本示例通过 decorator 提供了必要的容器样式。
 */
export const 默认视图: Story = {
  args: {
    initialMessages: mockMessages,
  },
};

/**
 * 展示消息发送状态的不同情况
 */
export const 消息状态: Story = {
  args: {
    initialMessages: [
      {
        id: '1',
        content: '这是一条发送中的消息',
        sender: '我',
        time: '10:00',
        isSelf: true,
        status: 'sending',
      },
      {
        id: '2',
        content: '这是一条已发送的消息',
        sender: '我',
        time: '10:01',
        isSelf: true,
        status: 'sent',
      },
      {
        id: '3',
        content: '这是一条发送失败的消息',
        sender: '我',
        time: '10:02',
        isSelf: true,
        status: 'error',
        error: '网络连接失败',
      },
    ] as MessageWithStatus[],
  },
};

/**
 * 展示加载状态
 */
export const 加载中: Story = {
  args: {
    initialMessages: [],
    isLoading: true,
  },
};

/**
 * 展示错误状态
 */
export const 错误状态: Story = {
  args: {
    initialMessages: [],
    error: '无法加载消息历史',
    onRetry: () => alert('点击了重试按钮'),
  },
};

/**
 * 展示消息列表的 Ref 接口使用方法
 *
 * ```ts
 * interface MessageListRef {
 *   // 添加一条消息到列表末尾
 *   appendMessage: (message: MessageWithStatus, options?: { style?: 'gemini' }) => void;
 *   // 更新指定消息的状态
 *   updateMessageStatus: (messageId: string, status: 'sending' | 'sent' | 'error', error?: string) => void;
 *   // 更新指定消息的内容
 *   updateMessageContent: (messageId: string, content: string) => void;
 *   // 获取当前所有消息
 *   getMessages: () => MessageWithStatus[];
 *   // 清空消息列表
 *   clearMessages: () => void;
 * }
 * ```
 */
export const Ref接口示例: Story = {
  args: {
    initialMessages: mockMessages,
  },
  render: (args: MessageListProps) => {
    const messageListRef = useRef<MessageListRef>(null);

    const handleAppendMessage = () => {
      messageListRef.current?.appendMessage({
        id: Date.now().toString(),
        content: '这是一条新消息',
        sender: '我',
        time: new Date().toLocaleTimeString(),
        isSelf: true,
        status: 'sending',
      });
    };

    const handleClearMessages = () => {
      messageListRef.current?.clearMessages();
    };

    return (
      <>
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={handleAppendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              添加消息
            </button>
            <button
              onClick={handleClearMessages}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              清空消息
            </button>
          </div>
        </div>
        <MessageList ref={messageListRef} {...args} />
      </>
    );
  },
};

/**
 * 展示不同的消息插入风格
 *
 * - Gemini 风格：新消息对齐到顶部，类似 Google Gemini 的聊天效果
 * - 普通风格：新消息滚动到底部，传统聊天效果
 */
export const 消息插入风格: Story = {
  args: {
    initialMessages: mockMessages,
  },
  render: (args: MessageListProps) => {
    const messageListRef = useRef<MessageListRef>(null);

    const handleAppendGeminiStyle = () => {
      messageListRef.current?.appendMessage(
        {
          id: Date.now().toString(),
          content: '这是一条 Gemini 风格的消息，新消息会对齐到顶部',
          sender: 'AI',
          time: new Date().toLocaleTimeString(),
          isSelf: false,
        },
        { style: 'gemini' }
      );

      // 模拟打字效果
      setTimeout(() => {
        messageListRef.current?.appendMessage(
          {
            id: (Date.now() + 1).toString(),
            content: '就像这样，每条新消息都会出现在顶部，更容易看到 AI 的回复',
            sender: 'AI',
            time: new Date().toLocaleTimeString(),
            isSelf: false,
          },
          { style: 'gemini' }
        );
      }, 1500);
    };

    const handleAppendNormalStyle = () => {
      messageListRef.current?.appendMessage({
        id: Date.now().toString(),
        content: '这是一条普通风格的消息，新消息会直接追加不会滚动',
        sender: '我',
        time: new Date().toLocaleTimeString(),
        isSelf: true,
        status: 'sent',
      });

      // 模拟回复
      setTimeout(() => {
        messageListRef.current?.appendMessage({
          id: (Date.now() + 1).toString(),
          content: '就像这样，消息会按照传统聊天的方式追加到底部，不会滚动',
          sender: 'AI',
          time: new Date().toLocaleTimeString(),
          isSelf: false,
        });
      }, 1500);
    };

    const handleClearMessages = () => {
      messageListRef.current?.clearMessages();
    };

    return (
      <>
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={handleAppendGeminiStyle}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Gemini 风格
            </button>
            <button
              onClick={handleAppendNormalStyle}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              普通风格
            </button>
            <button
              onClick={handleClearMessages}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              清空消息
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500">点击按钮查看不同风格的消息插入效果</div>
        </div>
        <MessageList ref={messageListRef} {...args} />
      </>
    );
  },
};

/**
 * 展示 AI 打字效果
 *
 * 演示了如何实现:
 * - AI 消息的渐进式显示
 * - 打字机效果
 * - 消息内容的动态更新
 */
export const AI打字效果: Story = {
  args: {
    initialMessages: [],
  },
  render: (args: MessageListProps) => {
    const messageListRef = useRef<MessageListRef>(null);

    const handleUserQuestion = () => {
      // 用户发送问题
      messageListRef.current?.appendMessage(
        {
          id: Date.now().toString(),
          content: '你能解释一下 React 虚拟化列表的优势吗？',
          sender: '我',
          time: new Date().toLocaleTimeString(),
          isSelf: true,
          status: 'sent',
        },
        { style: 'gemini' }
      );

      // AI 开始回复
      const aiMessageId = (Date.now() + 1).toString();
      setTimeout(() => {
        // 选择一个随机回答
        const answer = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];

        // 首先显示一个带有打字指示器的空消息
        messageListRef.current?.appendMessage({
          id: aiMessageId,
          content: '',
          sender: 'AI',
          time: new Date().toLocaleTimeString(),
          isSelf: false,
          isTyping: true,
        });

        // 模拟打字效果
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
          if (currentIndex >= answer.length) {
            // 完成打字，移除打字指示器
            messageListRef.current?.updateMessage(aiMessageId, {
              content: answer,
              isTyping: false,
            });
            clearInterval(typingInterval);
            return;
          }

          // 一个字一个字地显示
          const currentText = answer.slice(0, currentIndex + 1);
          messageListRef.current?.updateMessage(aiMessageId, {
            content: currentText,
            isTyping: true,
          });
          currentIndex++;
        }, 50); // 每50毫秒打印一个字
      }, 1000);
    };

    const handleClearMessages = () => {
      messageListRef.current?.clearMessages();
    };

    return (
      <>
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={handleUserQuestion}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              发送问题
            </button>
            <button
              onClick={handleClearMessages}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              清空消息
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500">点击"发送问题"查看 AI 打字效果</div>
        </div>
        <MessageList ref={messageListRef} {...args} />
      </>
    );
  },
};
