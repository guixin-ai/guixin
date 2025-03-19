import type { Meta, StoryObj } from '@storybook/react';
import ContactList from './contact-list';
import { ContactPerson, ContactGroupModel } from '../../models/routes/chat-contacts.model';

// 生成大量模拟数据的辅助函数
const generateMockContacts = (count: number): ContactPerson[] => {
  const result: ContactPerson[] = [];
  const groups = ['group1', 'group2', 'group3', 'group4', 'group5', 'group6'];
  const titles = [
    '前端开发工程师',
    '后端开发工程师',
    '产品经理',
    'UI设计师',
    '测试工程师',
    '项目经理',
    'DevOps工程师',
    '数据分析师',
  ];
  const surnames = [
    '张',
    '李',
    '王',
    '赵',
    '钱',
    '孙',
    '周',
    '吴',
    '郑',
    '陈',
    '马',
    '林',
    '刘',
    '黄',
    '杨',
    '朱',
    '徐',
    '高',
    '何',
    '郭',
  ];

  for (let i = 0; i < count; i++) {
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const groupId = groups[Math.floor(Math.random() * groups.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];

    result.push({
      id: `contact-${i + 1}`,
      name: `${surname}${Math.floor(Math.random() * 100)}`,
      avatar: surname,
      description: title,
      groupId: groupId,
    });
  }

  return result;
};

// 根据联系人数据生成分组数据
const generateMockGroups = (contacts: ContactPerson[]): ContactGroupModel[] => {
  const groupMap: Record<string, string[]> = {};

  // 收集每个分组的联系人ID
  contacts.forEach(contact => {
    if (!groupMap[contact.groupId]) {
      groupMap[contact.groupId] = [];
    }
    groupMap[contact.groupId].push(contact.id);
  });

  // 生成分组数据
  const groupNames: Record<string, string> = {
    group1: '工作伙伴',
    group2: '项目团队',
    group3: '其他联系人',
    group4: '家人朋友',
    group5: '客户',
    group6: '合作伙伴',
  };

  return Object.entries(groupMap).map(([groupId, contactIds]) => ({
    id: groupId,
    name: groupNames[groupId] || `分组${groupId.slice(-1)}`,
    description: `${groupNames[groupId] || `分组${groupId.slice(-1)}`}的描述`,
    contacts: contactIds,
  }));
};

// 生成大量模拟数据
const mockContacts = generateMockContacts(20);
const mockGroups = generateMockGroups(mockContacts);

// 小量数据用于特定场景测试
const smallMockContacts: ContactPerson[] = [
  {
    id: '1',
    name: '张三',
    avatar: '张',
    description: '前端开发工程师',
    groupId: 'group1',
  },
  {
    id: '2',
    name: '李四',
    avatar: '李',
    description: '产品经理',
    groupId: 'group1',
  },
  {
    id: '3',
    name: '王五',
    avatar: '王',
    description: '后端开发工程师',
    groupId: 'group2',
  },
  {
    id: '4',
    name: '赵六',
    avatar: '赵',
    description: 'UI设计师',
    groupId: 'group2',
  },
  {
    id: '5',
    name: '钱七',
    avatar: '钱',
    description: '测试工程师',
    groupId: 'group3',
  },
];

const smallMockGroups: ContactGroupModel[] = [
  {
    id: 'group1',
    name: '工作伙伴',
    description: '工作相关联系人',
    contacts: ['1', '2'],
  },
  {
    id: 'group2',
    name: '项目团队',
    description: '项目相关联系人',
    contacts: ['3', '4'],
  },
  {
    id: 'group3',
    name: '其他联系人',
    description: '其他联系人分组',
    contacts: ['5'],
  },
  {
    id: 'group4',
    name: '空分组',
    description: '没有联系人的分组',
    contacts: [],
  },
];

/**
 * ContactList 组件故事
 *
 * 该组件负责显示联系人列表，包括搜索、分组和联系人条目
 */
const meta = {
  component: ContactList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '联系人列表组件，显示联系人搜索框、分组和联系人条目，支持搜索、选择和删除操作。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSearch: { action: '搜索' },
    onSelectContact: { action: '选择联系人' },
    onDeleteContact: { action: '删除联系人' },
    onCreateContact: { action: '创建新联系人' },
  },
  decorators: [
    Story => (
      <div style={{ height: '600px', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContactList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 默认展示状态，显示分组和联系人（大数据量）
 */
export const 默认视图: Story = {
  args: {
    contacts: mockContacts,
    groups: mockGroups,
    selectedContactId: mockContacts[0].id,
    searchQuery: '',
    isLoading: false,
    loadings: {
      deleteContact: {},
    },
    onSearch: query => console.log('搜索:', query),
    onSelectContact: id => console.log('选择联系人:', id),
    onDeleteContact: async id => console.log('删除联系人:', id),
    onCreateContact: () => console.log('创建新联系人'),
  },
};

/**
 * 展示搜索功能，输入搜索关键词后的结果
 */
export const 搜索状态: Story = {
  args: {
    ...默认视图.args,
    searchQuery: '工程',
    selectedContactId:
      mockContacts.find(c => c.description && c.description.includes('工程'))?.id || null,
  },
};

/**
 * 展示当前没有联系人时的状态
 */
export const 空联系人列表: Story = {
  args: {
    ...默认视图.args,
    contacts: [],
    groups: [],
    selectedContactId: null,
  },
};

/**
 * 展示联系人数据加载中的状态
 */
export const 加载中: Story = {
  args: {
    ...默认视图.args,
    isLoading: true,
  },
};

/**
 * 展示删除联系人操作中的状态
 */
export const 删除操作: Story = {
  args: {
    ...默认视图.args,
    loadings: {
      deleteContact: {
        [mockContacts[1].id]: true,
      },
    },
  },
};

/**
 * 展示小数据量的联系人列表
 */
export const 小数据量: Story = {
  args: {
    contacts: smallMockContacts,
    groups: smallMockGroups,
    selectedContactId: '1',
    searchQuery: '',
    isLoading: false,
    loadings: {
      deleteContact: {},
    },
    onSearch: query => console.log('搜索:', query),
    onSelectContact: id => console.log('选择联系人:', id),
    onDeleteContact: async id => console.log('删除联系人:', id),
    onCreateContact: () => console.log('创建新联系人'),
  },
};
