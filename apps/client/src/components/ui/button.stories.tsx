import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Download, Mail, Plus } from 'lucide-react';

const meta = {
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

// 基础按钮
export const 基础 = {
  args: {
    children: '默认按钮',
  },
} satisfies Story;

// 所有变体
export const 变体 = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">默认按钮</Button>
      <Button variant="destructive">危险按钮</Button>
      <Button variant="outline">描边按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="ghost">幽灵按钮</Button>
      <Button variant="link">链接按钮</Button>
    </div>
  ),
} satisfies Story;

// 所有尺寸
export const 尺寸 = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="lg">大按钮</Button>
      <Button size="default">默认按钮</Button>
      <Button size="sm">小按钮</Button>
      <Button size="icon">
        <Plus />
      </Button>
    </div>
  ),
} satisfies Story;

// 带图标的按钮
export const 图标 = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <Mail />
        发送邮件
      </Button>
      <Button variant="secondary">
        <Download />
        下载文件
      </Button>
      <Button variant="outline">
        <Plus />
        新建项目
      </Button>
    </div>
  ),
} satisfies Story;

// 禁用状态
export const 禁用 = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>禁用按钮</Button>
      <Button disabled variant="destructive">
        禁用危险
      </Button>
      <Button disabled variant="outline">
        禁用描边
      </Button>
      <Button disabled variant="ghost">
        禁用幽灵
      </Button>
    </div>
  ),
} satisfies Story;

// 加载状态
export const 加载中 = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled variant="default" className="relative">
        <span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute left-0 top-0 size-4 animate-ping rounded-full bg-white/60" />
          <span className="absolute left-0 top-0 size-4 rounded-full bg-white" />
        </span>
        <span className="invisible">加载中</span>
      </Button>
      <Button disabled>
        <svg
          className="size-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="ml-1.5">加载中</span>
      </Button>
    </div>
  ),
} satisfies Story;
