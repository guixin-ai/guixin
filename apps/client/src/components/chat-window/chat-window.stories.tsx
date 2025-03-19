import type { Meta, StoryObj } from '@storybook/react';
import { ChatWindow, ChatWindowRef } from './chat-window';
import { useRef, useEffect, useState } from 'react';
import { MessageWithStatus } from '../message-list/message-list';
import { Message } from '@/types/chat';

const meta: Meta<typeof ChatWindow> = {
  component: ChatWindow,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className="flex flex-col h-screen">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ChatWindow>;

// 模拟消息数据
const mockMessages: MessageWithStatus[] = [
  {
    id: '1',
    content: '你好！我是 AI 助手，有什么可以帮你的吗？',
    time: '09:00',
    sender: 'ai',
    isSelf: false,
  },
  {
    id: '2',
    content: '我想了解一下如何使用这个聊天系统？',
    time: '09:01',
    sender: 'user',
    isSelf: true,
    status: 'sent',
  },
  {
    id: '3',
    content:
      '这是一个简单的聊天系统，你可以在这里和 AI 助手进行对话。系统支持实时消息发送、消息历史记录等功能...',
    time: '09:02',
    sender: 'ai',
    isSelf: false,
  },
];

// AI 回复模板
const aiResponses = [
  '这是一个很好的问题。让我来详细解释一下...',
  '根据我的理解，这个问题可以从以下几个方面来看...',
  '这确实是个复杂的话题。我建议我们可以这样思考...',
  '从技术角度来说，这里有几个关键点需要注意...',
  '让我们一步一步来分析这个问题...',
  '这个问题很有趣，它涉及到了几个重要的概念...',
  '我认为这个问题的关键在于...',
  '基于我的分析，我建议可以这样处理...',
  '这个问题涉及到多个方面，让我们逐一分析...',
  '从历史发展的角度来看，这个问题经历了以下变化...',
  '结合实际案例，我们可以这样理解...',
  '这里需要注意几个常见的误区...',
  '让我用一个具体的例子来说明...',
  '这个问题的解决方案可以分为以下几步...',
  '从理论到实践，我们需要考虑以下因素...',
];

// 用户问题模板
const userQuestions = [
  '你能解释一下这个概念吗？',
  '这个问题我一直不太明白...',
  '我想请教一下关于这个问题的看法',
  '能详细说明一下这个过程吗？',
  '这个方案听起来不错，但是我有一些疑问',
  '我在实践中遇到了一些困难，希望能得到一些建议',
  '这个问题困扰了我很久，能帮我分析一下吗？',
  '我想了解更多关于这个主题的信息',
  '对于这个说法，你有什么看法？',
  '能给我一些具体的例子吗？',
  '这种情况下应该如何处理？',
  '有没有更好的解决方案？',
  '这个理论在实践中如何应用？',
  '遇到这种情况该怎么办？',
  '能分享一下你的经验吗？',
];

// 生成随机消息
const generateRandomMessages = (maxCount: number = 10): MessageWithStatus[] => {
  // 生成 1 到 maxCount 之间的随机消息数量
  const count = Math.max(Math.floor(Math.random() * maxCount) + 1, 1);
  console.log('生成随机消息，数量:', count);
  const messages: MessageWithStatus[] = [];
  const startTime = Date.now() - count * 60000; // 每条消息间隔1分钟

  // 随机决定第一条消息是否来自 AI
  let isLastMessageFromAI = Math.random() < 0.5;

  for (let i = 0; i < count; i++) {
    // 随机决定是否改变发送者（有 20% 的概率连续发送）
    if (Math.random() > 0.2) {
      isLastMessageFromAI = !isLastMessageFromAI;
    }

    const content = isLastMessageFromAI
      ? aiResponses[Math.floor(Math.random() * aiResponses.length)]
      : userQuestions[Math.floor(Math.random() * userQuestions.length)];

    // 为每条消息生成一个随机的时间偏移（-30秒到+30秒之间）
    const timeOffset = Math.floor(Math.random() * 60000) - 30000;

    messages.push({
      id: `msg-${Date.now()}-${i}`,
      content,
      time: new Date(startTime + i * 60000 + timeOffset).toLocaleTimeString(),
      sender: isLastMessageFromAI ? 'ai' : 'user',
      isSelf: !isLastMessageFromAI,
      status: !isLastMessageFromAI ? 'sent' : undefined,
    });
  }

  return messages;
};

// 基础示例
export const 基础示例: Story = {
  args: {
    activeChat: {
      id: '1',
      name: 'AI 助手',
      avatar: 'AI',
    },
    onLoadMessages: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateRandomMessages(50);
    },
    onSendMessage: (message: string): void => {
      console.log('发送消息:', message);
    },
    disabled: false,
    inputPlaceholder: '输入消息...',
  },
  render: args => {
    const chatWindowRef = useRef<ChatWindowRef>(null);

    const handleSendMessage = (message: string) => {
      if (!chatWindowRef.current) return;

      // 发送用户消息
      const messageId = chatWindowRef.current.sendMessage(message);
      console.log('消息发送成功，ID:', messageId);

      // 模拟 AI 回复
      setTimeout(() => {
        // 发送AI回复
        const receivedMessageId = chatWindowRef.current?.receiveMessage({
          id: `ai-${Date.now()}`,
          content: `收到你的消息：${message}`,
          time: new Date().toLocaleTimeString(),
          sender: 'ai',
          isSelf: false,
        });
        console.log('AI回复消息已接收，ID:', receivedMessageId);
      }, 1000);
    };

    return <ChatWindow ref={chatWindowRef} {...args} onSendMessage={handleSendMessage} />;
  },
};

// 无选中聊天状态
export const 未选择聊天: Story = {
  args: {
    ...基础示例.args,
    activeChat: undefined,
  },
};

// 加载状态
export const 加载中: Story = {
  args: {
    ...基础示例.args,
    onLoadMessages: async () => {
      await new Promise(resolve => setTimeout(resolve, 60000)); // 长时间加载
      return [];
    },
  },
};

// 加载错误
export const 加载错误: Story = {
  args: {
    ...基础示例.args,
    onLoadMessages: async () => {
      await new Promise((_, reject) => setTimeout(() => reject(new Error('网络错误')), 1000));
      return [];
    },
  },
};

// 空消息列表
export const 空消息列表: Story = {
  args: {
    ...基础示例.args,
    onLoadMessages: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [];
    },
  },
};

// 禁用状态
export const 禁用状态: Story = {
  args: {
    ...基础示例.args,
    disabled: true,
    inputPlaceholder: '聊天功能已禁用',
  },
};

// 自定义占位符
export const 自定义占位符: Story = {
  args: {
    ...基础示例.args,
    inputPlaceholder: '请输入您想说的话...',
  },
};

// 黑暗模式
export const 深色模式: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  args: {
    ...基础示例.args,
  },
  decorators: [
    Story => (
      <div className="dark flex flex-col h-screen">
        <Story />
      </div>
    ),
  ],
};

// 消息加载状态示例
export const 消息状态演示: Story = {
  args: {
    ...基础示例.args,
  },
  render: args => {
    const chatWindowRef = useRef<ChatWindowRef>(null);

    const simulateMessageExchange = async () => {
      if (!chatWindowRef.current) return;

      // 模拟用户发送消息
      const userMessageId = chatWindowRef.current.sendMessage('这是一条测试消息');
      console.log('用户消息已发送，ID:', userMessageId);

      // 模拟 AI 接收和回复消息
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 创建一个带有发送中状态的消息
      const aiMessageId = chatWindowRef.current.receiveMessage({
        id: `ai-${Date.now()}`,
        content: '正在思考...',
        time: new Date().toLocaleTimeString(),
        sender: 'ai',
        isSelf: false,
        status: 'sending',
      });

      // 1秒后更新 AI 的回复内容和状态
      await new Promise(resolve => setTimeout(resolve, 1200));
      chatWindowRef.current.updateMessageContent(
        aiMessageId,
        '收到你的测试消息了！这是一个自动回复。'
      );
      chatWindowRef.current.updateMessageStatus(aiMessageId, 'sent');
      console.log('AI回复消息已更新，ID:', aiMessageId);
    };

    useEffect(() => {
      simulateMessageExchange();
    }, []);

    return <ChatWindow ref={chatWindowRef} {...args} />;
  },
};

/**
 * 演示消息发送和接收的完整流程，包括：
 * 1. 发送消息的加载状态
 * 2. 接收消息的加载状态
 * 3. 错误处理
 * 4. 消息内容更新
 * 5. 流式响应效果
 *
 * @remarks
 * 消息发送和接收的操作:
 *
 * 1. 快速响应场景:
 *    - 用户发送消息，AI 快速回复
 *    - 示例：点击"快速响应"按钮，消息在 300ms 内收到回复
 *
 * 2. 慢速响应场景:
 *    - 用户发送消息，AI 延迟回复，显示中间状态
 *    - 示例：点击"慢速响应"按钮，消息在发送后显示"正在思考"状态
 *
 * 3. 错误处理场景:
 *    - 当消息发送失败时，可以更新消息状态为错误
 *    - 示例：点击"错误消息"按钮，模拟消息发送失败
 *
 * 4. 流式响应场景:
 *    - 适用于 AI 生成等需要逐步显示内容的场景
 *    - 示例：点击"流式响应"按钮，模拟逐字显示回复
 */
export const Ref接口演示: Story = {
  args: {
    activeChat: {
      id: '1',
      name: 'AI 助手',
      avatar: 'AI',
    },
    onSendMessage: () => {},
  },
  render: args => {
    const chatWindowRef = useRef<ChatWindowRef>(null);

    const sendQuickMessage = () => {
      if (!chatWindowRef.current) return;

      // 发送用户消息
      const messageId = chatWindowRef.current.sendMessage(
        '快速响应测试 - 这条消息在 200ms 内完成发送'
      );
      console.log('快速消息已发送，ID:', messageId);

      // 快速接收消息测试
      setTimeout(() => {
        const aiMessageId = chatWindowRef.current?.receiveMessage({
          id: `ai-${Date.now()}`,
          content: '这是一个快速的 AI 回复，延迟 300ms',
          time: new Date().toLocaleTimeString(),
          sender: 'ai',
          isSelf: false,
        });
        console.log('快速AI回复已接收，ID:', aiMessageId);
      }, 300);
    };

    const sendSlowMessage = () => {
      if (!chatWindowRef.current) return;

      // 发送用户消息
      const messageId = chatWindowRef.current.sendMessage(
        '慢速响应测试 - 这条消息在 2000ms 后才完成发送'
      );
      console.log('慢速消息已发送，ID:', messageId);

      // 慢速接收消息测试 - 先发送带有loading状态的消息，然后更新
      setTimeout(() => {
        const aiMessageId = chatWindowRef.current?.receiveMessage({
          id: `ai-${Date.now()}`,
          content: 'AI 正在思考中...',
          time: new Date().toLocaleTimeString(),
          sender: 'ai',
          isSelf: false,
          status: 'sending',
        });

        // 先等待 3000ms，然后更新思考状态
        setTimeout(() => {
          chatWindowRef.current?.updateMessageContent(
            aiMessageId as string,
            'AI 正在仔细思考您的问题...'
          );
          chatWindowRef.current?.updateMessageStatus(aiMessageId as string, 'sent');
          console.log('慢速AI回复已更新，ID:', aiMessageId);
        }, 3000);
      }, 2000);
    };

    const sendErrorMessage = () => {
      if (!chatWindowRef.current) return;
      const messageId = chatWindowRef.current.sendMessage('这条消息会发送失败');
      setTimeout(() => {
        chatWindowRef.current?.updateMessageStatus(messageId, 'error', '网络错误');

        const aiMessageId = 'error-message';
        // 错误消息接收测试
        chatWindowRef.current?.receiveMessage({
          id: aiMessageId,
          content: '尝试重新连接...',
          time: new Date().toLocaleTimeString(),
          sender: 'ai',
          isSelf: false,
        });
        console.log('错误消息已接收，ID:', aiMessageId);

        setTimeout(() => {
          chatWindowRef.current?.updateMessageStatus(aiMessageId, 'error', '连接超时');
        }, 2000);
      }, 1500);
    };

    const simulateStreamResponse = async () => {
      if (!chatWindowRef.current) return;
      chatWindowRef.current.sendMessage('正在生成回复...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const receiveMessageId = chatWindowRef.current.receiveMessage({
        id: `stream-message-id-${Date.now()}`,
        content: '正在生成回复...',
        time: new Date().toLocaleTimeString(),
        sender: 'ai',
        isSelf: false,
      });
      const response = '这是一个模拟的流式响应消息，将会逐字显示。';
      for (let i = 1; i <= response.length; i++) {
        chatWindowRef.current.updateMessageContent(receiveMessageId, response.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const finalMessageId = receiveMessageId;
      chatWindowRef.current.updateMessageStatus(finalMessageId, 'sent');
      console.log('流式响应完成，最终消息ID:', finalMessageId);
    };

    return (
      <>
        <div className="flex flex-col h-[calc(100vh-200px)]">
          <ChatWindow ref={chatWindowRef} {...args} />
        </div>
        <div className="h-[200px] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-4 items-center justify-center">
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
          <button
            onClick={sendQuickMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            快速响应
          </button>
          <button
            onClick={sendSlowMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            慢速响应
          </button>
          <button
            onClick={sendErrorMessage}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            错误消息
          </button>
          <button
            onClick={simulateStreamResponse}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            流式响应
          </button>
        </div>
      </>
    );
  },
};

/**
 * 演示不同加载时间对加载状态显示的影响
 *
 * 预期行为：
 * 1. 快速加载场景（加载时间 < 指示器延迟时间）
 *    - 当加载时间为 300ms，指示器延迟时间为 500ms 时
 *    - 用户不会看到加载状态
 *    - 消息直接显示在界面上
 *
 * 2. 慢速加载场景（加载时间 > 指示器延迟时间）
 *    - 当加载时间为 1000ms，指示器延迟时间为 500ms 时
 *    - 前 500ms 不显示加载状态
 *    - 500ms 后显示加载状态
 *    - 1000ms 后显示加载完成的消息
 *
 * 3. 边界场景测试
 *    - 当加载时间接近指示器延迟时间时（如 450ms vs 500ms）
 *    - 应该优先保证用户体验，不显示加载状态
 *
 * 4. 连续加载场景
 *    - 快速点击"重新加载消息"按钮
 *    - 每次加载都应该遵循相同的延迟规则
 *    - 上一次的加载定时器应该被正确清除
 *
 * 5. 极端场景
 *    - 指示器延迟时间设置为 0：立即显示加载状态
 *    - 加载时间设置为 0：立即显示结果
 *    - 指示器延迟时间设置很大（如 5000ms）：
 *      - 如果在 5000ms 内完成加载，不显示加载状态
 *      - 如果超过 5000ms，显示加载状态
 *
 * @remarks
 * 加载指示器延迟机制（loadingIndicatorDelay）说明:
 *
 * 此参数用于控制消息列表加载状态的显示时机，主要用于优化初始加载体验：
 * - 当加载时间 < loadingIndicatorDelay：用户不会看到加载状态，直接看到消息列表
 * - 当加载时间 > loadingIndicatorDelay：先显示加载状态，后显示消息列表
 *
 * 使用场景：
 * - 设置较小的值：几乎立即显示加载状态，适合需要明确反馈的场景
 * - 设置较大的值：只有长时间加载才显示加载状态，避免短暂加载导致的界面闪烁
 *
 * @example
 * ```tsx
 * // 场景 1：快速加载，无加载状态
 * <ChatWindow loadingIndicatorDelay={500} /> // 加载耗时 300ms，用户无感知加载过程
 *
 * // 场景 2：慢速加载，显示加载状态
 * <ChatWindow loadingIndicatorDelay={500} /> // 加载耗时 1000ms，500ms 后显示加载状态
 * ```
 */
export const 加载指示器延迟演示: Story = {
  args: {
    activeChat: {
      id: '1',
      name: 'AI 助手',
      avatar: 'AI',
    },
  },
  render: args => {
    const [chatId, setChatId] = useState(Date.now().toString());
    const [loadTime, setLoadTime] = useState(2000);
    const [debounceTime, setDebounceTime] = useState(500);
    const [messageCount, setMessageCount] = useState(500);
    const chatWindowRef = useRef<ChatWindowRef>(null);

    const mockLoadMessages = async () => {
      const startTime = Date.now();
      console.log('开始加载消息:', {
        预期加载时间: loadTime,
        指示器延迟时间: debounceTime,
        开始时间戳: startTime,
        消息数量: messageCount,
      });

      await new Promise(resolve => setTimeout(resolve, loadTime));

      const endTime = Date.now();
      const messages = generateRandomMessages(messageCount);
      console.log('消息加载完成:', {
        实际加载时间: endTime - startTime,
        结束时间戳: endTime,
        实际消息数量: messages.length,
        消息内容概要: messages.map(m => m.id.substring(0, 8) + '...'),
      });

      return messages;
    };

    const handleLoadTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      console.log('更新加载时间:', {
        原值: loadTime,
        新值: value,
      });
      setLoadTime(value);
    };

    const handleDebounceTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      console.log('更新指示器延迟时间:', {
        原值: debounceTime,
        新值: value,
      });
      setDebounceTime(value);
    };

    const handleMessageCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      console.log('更新消息数量:', {
        原值: messageCount,
        新值: value,
      });
      setMessageCount(value);
    };

    const handleReload = () => {
      console.log('触发重新加载:', {
        当前chatId: chatId,
        新chatId: Date.now().toString(),
        消息数量: messageCount,
      });
      setChatId(Date.now().toString());
    };

    // 测试场景按钮处理函数
    const setTestCase = (newLoadTime: number) => {
      setLoadTime(newLoadTime);
      setChatId(Date.now().toString());
    };

    return (
      <>
        <div className="flex flex-col h-[calc(100vh-200px)]">
          <ChatWindow
            key={chatId}
            ref={chatWindowRef}
            {...args}
            activeChat={{
              id: chatId,
              name: 'AI 助手',
              avatar: 'AI',
            }}
            loadingIndicatorDelay={debounceTime}
            onLoadMessages={mockLoadMessages}
          />
        </div>
        <div className="h-[200px] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <label className="flex-1">
              指示器延迟时间(ms):
              <input
                type="number"
                value={debounceTime}
                onChange={handleDebounceTimeChange}
                className="ml-2 p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </label>
            <label className="flex-1">
              加载时间(ms):
              <input
                type="number"
                value={loadTime}
                onChange={handleLoadTimeChange}
                className="ml-2 p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </label>
            <label className="flex-1">
              消息数量:
              <input
                type="number"
                value={messageCount}
                onChange={handleMessageCountChange}
                className="ml-2 p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </label>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleReload}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              重新加载消息
            </button>

            {/* 测试场景按钮 */}
            <button
              onClick={() => setTestCase(50)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              title="加载时间远小于指示器延迟时间"
            >
              极短加载 (50ms)
            </button>

            <button
              onClick={() => setTestCase(450)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              title="加载时间接近但小于指示器延迟时间"
            >
              接近延迟 (450ms)
            </button>

            <button
              onClick={() => setTestCase(550)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              title="加载时间略大于指示器延迟时间"
            >
              略超延迟 (550ms)
            </button>

            <button
              onClick={() => setTestCase(2000)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              title="加载时间远大于指示器延迟时间"
            >
              极长加载 (2000ms)
            </button>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            提示: 打开控制台查看详细的加载日志
          </div>
        </div>
      </>
    );
  },
};
