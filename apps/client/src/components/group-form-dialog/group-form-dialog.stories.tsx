import type { Meta, StoryObj } from '@storybook/react';
import GroupFormDialog from './group-form-dialog';
import { useState } from 'react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Toaster } from '../ui/sonner';

const meta: Meta<typeof GroupFormDialog> = {
  component: GroupFormDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
  decorators: [
    Story => (
      <div className="w-[600px] p-4">
        <Toaster />
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof GroupFormDialog>;

// 模拟提交函数
const handleSubmit = async (name: string, description: string | null) => {
  console.log('提交分组:', name, description);
  toast.success('提交成功', {
    description: `创建了分组: ${name}${description ? '，描述: ' + description : ''}`,
  });

  // 模拟异步操作
  return new Promise<void>(resolve => setTimeout(resolve, 1000));
};

// 带触发器的交互示例
const DialogWithTrigger = (args: any) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (name: string, description: string | null) => {
    setIsLoading(true);
    try {
      await handleSubmit(name, description);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-gray-500 mb-2">点击下方按钮打开分组创建对话框</p>
      <Button onClick={() => setOpen(true)}>创建新分组</Button>
      <GroupFormDialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

// 基础示例
export const 基础示例: Story = {
  render: DialogWithTrigger,
};

// 自定义标题和描述
export const 自定义标题和描述: Story = {
  render: DialogWithTrigger,
  args: {
    title: '创建联系人分组',
    description: '添加一个新的分组来对您的联系人进行分类管理',
  },
};

// 加载状态
export const 加载状态: Story = {
  render: args => {
    const [open, setOpen] = useState(false);

    // 模拟一个长时间运行的提交操作
    const handleLongSubmit = async (name: string, description: string | null) => {
      console.log('开始长时间提交操作:', name, description);
      // 这个Promise永远不会resolve，模拟一个永久加载状态
      return new Promise<void>(() => {});
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-gray-500 mb-2">点击按钮后表单将进入永久加载状态</p>
        <Button onClick={() => setOpen(true)}>打开加载状态对话框</Button>
        <GroupFormDialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          onSubmit={handleLongSubmit}
          isLoading={open} // 当对话框打开时，始终处于加载状态
        />
      </div>
    );
  },
};
