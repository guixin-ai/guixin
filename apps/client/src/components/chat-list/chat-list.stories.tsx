import type { Meta, StoryObj } from '@storybook/react';
import { ChatList } from './chat-list';

/**
 * 聊天列表组件允许用户查看和搜索聊天记录列表，支持显示未读消息数、最后一条消息预览等功能。
 *
 * 职责范围：
 * - 展示聊天列表
 * - 支持搜索过滤
 * - 显示加载状态和错误信息
 * - 提供聊天选择功能
 *
 * 不在职责范围内：
 * - 不处理数据获取和状态管理
 * - 不处理聊天内容的展示
 */
const meta: Meta<typeof ChatList> = {
  component: ChatList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatList>;

const mockChats = [
  {
    id: '1',
    name: '张三',
    avatar: '张',
    lastMessage: '你好，最近怎么样？',
    lastMessageTime: '10:30',
    unread: 2,
  },
  {
    id: '2',
    name: '李四',
    avatar: '李',
    lastMessage: '周末有时间吗？',
    lastMessageTime: '昨天',
    unread: 0,
  },
  {
    id: '3',
    name: '王五',
    avatar: '王',
    lastMessage: '请查收我发送的文件',
    lastMessageTime: '周一',
    unread: 1,
  },
  {
    id: '4',
    name: '项目讨论群',
    avatar: '项',
    lastMessage: '下周一开会讨论项目进度',
    lastMessageTime: '周二',
    unread: 5,
  },
];

/**
 * 默认视图展示了带有搜索功能的聊天列表
 */
export const 默认视图: Story = {
  args: {
    chats: mockChats,
    isLoadingChats: false,
    searchEnabled: true,
    onChatSelect: id => console.log(`选择聊天: ${id}`),
  },
};

/**
 * 激活聊天视图展示了某个聊天被选中的状态
 */
export const 激活聊天: Story = {
  args: {
    chats: mockChats,
    activeChatId: '2',
    isLoadingChats: false,
    searchEnabled: true,
    onChatSelect: id => console.log(`选择聊天: ${id}`),
  },
};

/**
 * 无搜索栏视图展示了禁用搜索功能的聊天列表
 */
export const 无搜索栏: Story = {
  args: {
    chats: mockChats,
    isLoadingChats: false,
    searchEnabled: false,
    onChatSelect: id => console.log(`选择聊天: ${id}`),
  },
};

/**
 * 加载中视图展示了聊天列表的加载状态
 */
export const 加载中: Story = {
  args: {
    chats: [],
    isLoadingChats: true,
    searchEnabled: true,
    onChatSelect: id => console.log(`选择聊天: ${id}`),
  },
};

/**
 * 错误状态视图展示了加载聊天列表失败的错误提示
 */
export const 错误状态: Story = {
  args: {
    chats: [],
    isLoadingChats: false,
    loadError: '加载聊天列表失败，请稍后重试',
    searchEnabled: true,
    onChatSelect: id => console.log(`选择聊天: ${id}`),
  },
};

/**
 * 空列表视图展示了没有聊天记录时的界面
 */
export const 空列表: Story = {
  args: {
    chats: [],
    isLoadingChats: false,
    searchEnabled: true,
    onChatSelect: id => console.log(`选择聊天: ${id}`),
  },
};
