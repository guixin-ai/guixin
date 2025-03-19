import React, { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  VirtuosoMessage,
  VirtuosoMessageListMethods,
  ItemContent as VirtuosoItemContent,
} from './virtuoso-message';

// 定义消息类型
interface Message {
  key: string;
  text: string;
  user: 'me' | 'other';
}

// 创建随机消息的辅助函数
let idCounter = 0;
function randomMessage(user: Message['user'], text?: string): Message {
  return {
    user,
    key: `${idCounter++}`,
    text: text || `这是一条${user === 'me' ? '我的' : '对方的'}消息 ${idCounter}`,
  };
}

// 随机短语，用于模拟打字效果
const randomPhrases = [
  '我理解你的问题，',
  '让我思考一下，',
  '根据我的分析，',
  '这是一个很好的问题，',
  '从技术角度来看，',
  '考虑到你的需求，',
  '基于最佳实践，',
];

function getRandomPhrase() {
  return randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
}

// 定义聊天频道上下文
interface MessageListContext {
  loadingNewer: boolean;
  channel: {
    currentUser: string;
    loaded: boolean;
  };
}

// 定义基础消息类型
interface ChatMessage {
  id?: number;
  localId?: string;
  key: string;
  delivered?: boolean;
  user: {
    id: string;
    avatar: string;
  };
  message: string;
}

// 消息项组件
const MessageItemContent: VirtuosoItemContent<Message, null> = ({ data }) => {
  const ownMessage = data.user === 'me';
  return (
    <div style={{ paddingBottom: '2rem', display: 'flex' }}>
      <div
        style={{
          maxWidth: '80%',
          marginLeft: data.user === 'me' ? 'auto' : undefined,
          background: ownMessage ? '#0253B3' : '#F0F0F3',
          color: ownMessage ? 'white' : 'black',
          borderRadius: '1rem',
          padding: '1rem',
        }}
      >
        {data.text}
      </div>
    </div>
  );
};

// 故事书元数据
const meta = {
  component: VirtuosoMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof VirtuosoMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Gemini 风格的聊天机器人示例
export const GeminiChatbot = () => {
  const virtuoso = useRef<VirtuosoMessageListMethods<Message>>(null);

  const handleAskQuestion = () => {
    // 用户发送消息
    const myMessage = randomMessage('me', '你能告诉我关于 React 虚拟化列表的优势吗？');
    virtuoso.current?.data.append([myMessage], ({ scrollInProgress, atBottom }) => {
      return {
        index: 'LAST',
        align: 'start', // Gemini 风格：将新消息对齐到顶部
        behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
      };
    });

    // 模拟机器人回复
    setTimeout(() => {
      const botMessage = randomMessage('other', '');
      virtuoso.current?.data.append([botMessage]);

      // 模拟打字效果
      let counter = 0;
      const interval = setInterval(() => {
        if (counter++ > 20) {
          clearInterval(interval);
        }
        virtuoso.current?.data.map(
          message => {
            if (message.key === botMessage.key) {
              return {
                ...message,
                text: message.text + getRandomPhrase(),
              };
            }
            return message;
          },
          'smooth' // 平滑滚动
        );
      }, 150);
    }, 1000);
  };

  return (
    <div style={{ height: 500, display: 'flex', flexDirection: 'column', width: 600 }}>
      <VirtuosoMessage<Message, null>
        ref={virtuoso}
        style={{ flex: 1, border: '1px solid #eee', borderRadius: '8px' }}
        computeItemKey={({ data }) => data.key}
        ItemContent={MessageItemContent}
      />
      <button
        onClick={handleAskQuestion}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#0253B3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        发送问题
      </button>
    </div>
  );
};

// 创建初始化聊天数据
const createInitialMessages = (): ChatMessage[] => {
  return [
    {
      id: 1,
      key: '1',
      user: {
        id: 'user1',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
      },
      message: '你好！这是一个聊天示例',
      delivered: true,
    },
    {
      id: 2,
      key: '2',
      user: {
        id: 'user2',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
      },
      message: '你好！这个聊天组件支持以下功能：',
      delivered: true,
    },
    {
      id: 3,
      key: '3',
      user: {
        id: 'user2',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
      },
      message: '1. 虚拟滚动\n2. 消息状态显示\n3. 头像展示\n4. 消息气泡样式\n5. 平滑滚动效果',
      delivered: true,
    },
    {
      id: 4,
      key: '4',
      user: {
        id: 'user1',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
      },
      message: '看起来不错！让我们开始测试吧',
      delivered: true,
    },
  ];
};

// 高级聊天示例
export const AdvancedChat = () => {
  const virtuoso = useRef<VirtuosoMessageListMethods<ChatMessage>>(null);
  const [loadingNewer, setLoadingNewer] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>(createInitialMessages());

  const context: MessageListContext = {
    loadingNewer,
    channel: {
      currentUser: 'user1',
      loaded: true,
    },
  };

  const ItemContent: VirtuosoItemContent<ChatMessage, MessageListContext> = ({
    data: message,
    context,
  }) => {
    const ownMessage = context.channel.currentUser === message.user.id;
    return (
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          paddingBottom: '1rem',
          flexDirection: ownMessage ? 'row-reverse' : 'row',
        }}
      >
        <img
          src={message.user.avatar}
          style={{ borderRadius: '100%', width: 30, height: 30, border: '1px solid #ccc' }}
          alt="avatar"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '50%' }}>
          <div
            style={{
              background: ownMessage ? '#0253B3' : '#F0F0F3',
              color: ownMessage ? 'white' : 'black',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              ...(ownMessage ? { borderTopRightRadius: '0' } : { borderTopLeftRadius: '0' }),
            }}
          >
            {message.message}
          </div>
          {!message.delivered && (
            <div style={{ textAlign: 'right', fontSize: '0.8em', color: '#666' }}>发送中...</div>
          )}
        </div>
      </div>
    );
  };

  const sendMessage = () => {
    const newMessage: ChatMessage = {
      id: Date.now(),
      key: Date.now().toString(),
      localId: Date.now().toString(),
      user: {
        id: 'user1',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
      },
      message: '这是一条新消息 ' + Date.now(),
      delivered: false,
    };

    virtuoso.current?.data.append([newMessage], ({ atBottom, scrollInProgress }) => {
      if (atBottom || scrollInProgress) {
        return 'smooth';
      }
      return 'auto';
    });

    // 模拟消息发送
    setTimeout(() => {
      virtuoso.current?.data.map(msg => {
        if (msg.localId === newMessage.localId) {
          return { ...msg, delivered: true };
        }
        return msg;
      });
    }, 1000);
  };

  const receiveMessage = () => {
    const newMessage: ChatMessage = {
      id: Date.now(),
      key: Date.now().toString(),
      user: {
        id: 'user2',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
      },
      message: '这是一条回复消息 ' + Date.now(),
      delivered: true,
    };

    virtuoso.current?.data.append([newMessage], ({ atBottom, scrollInProgress }) => {
      if (atBottom || scrollInProgress) {
        return 'smooth';
      }
      return 'auto';
    });
  };

  return (
    <div style={{ height: 500, display: 'flex', flexDirection: 'column', width: 600 }}>
      <VirtuosoMessage<ChatMessage, MessageListContext>
        ref={virtuoso}
        context={context}
        style={{ flex: 1, border: '1px solid #eee', borderRadius: '8px' }}
        computeItemKey={({ data }) => data.key}
        ItemContent={ItemContent}
        initialData={messages}
      />
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button
          onClick={sendMessage}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#0253B3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          发送消息
        </button>
        <button
          onClick={receiveMessage}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          接收消息
        </button>
      </div>
    </div>
  );
};
