import type { Meta, StoryObj } from '@storybook/react';
import { ContactItem } from './contact-item';

const meta = {
  component: ContactItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSelect: { action: 'selected' },
    onDelete: { action: 'deleted' },
  },
} satisfies Meta<typeof ContactItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 默认: Story = {
  args: {
    id: '1',
    name: '张三',
    avatar: '张',
    description: '前端开发工程师',
    isSelected: false,
    onSelect: id => console.log(`选择了联系人: ${id}`),
    onDelete: id => console.log(`删除了联系人: ${id}`),
  },
};

export const 已选中: Story = {
  args: {
    ...默认.args,
    isSelected: true,
  },
};

export const 群组成员: Story = {
  args: {
    ...默认.args,
    isInGroup: true,
    name: '李四',
    avatar: '李',
    description: '产品经理',
  },
};

export const 无描述: Story = {
  args: {
    ...默认.args,
    name: '王五',
    avatar: '王',
    description: undefined,
  },
};

export const 长名称: Story = {
  args: {
    ...默认.args,
    name: '这是一个非常长的名称用来测试组件的显示效果',
    avatar: '测',
  },
};

export const 删除功能: Story = {
  args: {
    ...默认.args,
    name: '赵六',
    avatar: '赵',
    description: '测试删除功能',
  },
  play: async () => {
    // 注意：这个 play 函数在 Storybook 中会自动运行，
    // 但由于涉及到右键菜单，可能需要手动测试
  },
};

/**
 * 展示多个联系人列表项的效果
 */
export const 联系人列表: Story = {
  args: {
    ...默认.args,
    id: '1',
    name: '张三',
    avatar: '张',
    description: '前端开发工程师',
    isSelected: true,
  },
  render: args => {
    const contacts = [
      { id: '1', name: '张三', avatar: '张', description: '前端开发工程师', isSelected: true },
      { id: '2', name: '李四', avatar: '李', description: '产品经理', isSelected: false },
      { id: '3', name: '王五', avatar: '王', description: '后端开发工程师', isSelected: false },
      { id: '4', name: '赵六', avatar: '赵', description: 'UI设计师', isSelected: false },
      { id: '5', name: '钱七', avatar: '钱', description: '测试工程师', isSelected: false },
    ];

    return (
      <div className="w-80 border border-gray-200 rounded-md dark:border-gray-700 shadow-sm">
        {contacts.map(contact => (
          <ContactItem
            key={contact.id}
            id={contact.id}
            name={contact.name}
            avatar={contact.avatar}
            description={contact.description}
            isSelected={contact.isSelected}
            onSelect={args.onSelect}
            onDelete={args.onDelete}
          />
        ))}
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};
