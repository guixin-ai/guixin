import type { Meta, StoryObj } from '@storybook/react';
import { ChatListItem } from './chat-list-item';
import { action } from '@storybook/addon-actions';

const meta = {
  title: '聊天/ChatListItem',
  component: ChatListItem,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    chat: {
      description: '聊天项数据',
      control: 'object',
    },
    onClick: { 
      description: '点击回调',
      action: 'clicked'
    },
    onDelete: {
      description: '删除回调',
      action: 'deleted'
    },
    testId: {
      description: '测试ID，用于自动化测试',
      control: 'text',
    },
  },
} satisfies Meta<typeof ChatListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基础聊天列表项
 */
export const Default: Story = {
  args: {
    chat: {
      id: 'chat-1',
      name: '张三',
      avatar: '张',
      lastMessage: '你好，最近在忙什么呢？',
      timestamp: '10:30',
    },
    onClick: action('clicked'),
    onDelete: action('deleted'),
    testId: 'story-default-chat',
  },
};

/**
 * 带有未读消息的聊天列表项
 */
export const WithUnread: Story = {
  args: {
    chat: {
      id: 'chat-2',
      name: '李四',
      avatar: '李',
      lastMessage: '我发了一个文件给你，请查收！',
      timestamp: '昨天',
      unread: 3,
    },
    onClick: action('clicked'),
    onDelete: action('deleted'),
    testId: 'story-unread-chat',
  },
};

/**
 * 长内容的聊天列表项
 */
export const WithLongContent: Story = {
  args: {
    chat: {
      id: 'chat-3',
      name: '这是一个很长很长很长很长很长很长的聊天名称',
      avatar: '名',
      lastMessage: '这是一段很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的消息',
      timestamp: '上周',
    },
    onClick: action('clicked'),
    onDelete: action('deleted'),
    testId: 'story-long-content-chat',
  },
};

/**
 * AI朋友聊天列表项
 */
export const AIFriend: Story = {
  args: {
    chat: {
      id: 'chat-4',
      name: 'AI助手',
      avatar: 'A',
      lastMessage: '有什么我可以帮助你的吗？',
      timestamp: '刚刚',
    },
    onClick: action('clicked'),
    onDelete: action('deleted'),
    testId: 'story-ai-friend-chat',
  },
};

/**
 * 右键菜单功能展示
 * 
 * 此故事专门用于展示右键点击打开上下文菜单的功能。
 * 右键点击可显示删除选项。
 */
export const ContextMenuDemo: Story = {
  args: {
    chat: {
      id: 'chat-5',
      name: '右键菜单演示',
      avatar: '菜',
      lastMessage: '右键点击我可以看到删除选项',
      timestamp: '现在',
      unread: 1,
    },
    onClick: action('clicked'),
    onDelete: action('deleted'),
    testId: 'story-context-menu-chat',
  },
  parameters: {
    docs: {
      description: {
        story: '右键点击聊天项可以打开上下文菜单，其中包含删除选项。点击删除选项会触发onDelete回调。'
      }
    }
  }
};

/**
 * 固定宽度容器中的文本截断效果
 * 
 * 此故事展示在固定宽度容器中，超长文本如何被截断并显示省略号(...)
 */
export const TruncatedText: Story = {
  args: {
    chat: {
      id: 'chat-6',
      name: '这是一个超级超级超级超级超级超级超级超级超级超级超级超级超级超级长的名字',
      avatar: '长',
      lastMessage: '这是一段非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的消息',
      timestamp: '3小时前',
    },
    onClick: action('clicked'),
    onDelete: action('deleted'),
    testId: 'story-truncated-text-chat',
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: '在固定宽度容器中，长文本会被截断并显示省略号(...)。这个示例使用了w-64（256px）宽度的容器来演示文本截断效果。'
      }
    }
  }
}; 