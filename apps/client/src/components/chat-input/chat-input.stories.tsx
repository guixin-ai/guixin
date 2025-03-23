import type { Meta, StoryObj } from '@storybook/react';
import { ChatInput, ChatContact } from './index';
import { useEffect, useState } from 'react';
import { TreeViewPlugin } from './plugins';

// 测试联系人数据
const testContacts: ChatContact[] = [
  { id: 'user1', name: '张三', isAI: false },
  { id: 'user2', name: '李四', isAI: false },
  { id: 'user3', name: '王五', isAI: false },
  { id: 'ai1', name: 'AI助手', isAI: true },
  { id: 'ai2', name: 'GPT模型', isAI: true },
];

// 定义组件元数据
const meta: Meta<typeof ChatInput> = {
  title: '组件/聊天输入框',
  component: ChatInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '纯文本聊天输入组件，支持@提及功能，无发送按钮'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
    initialContent: { control: 'text' },
    placeholder: { control: 'text' },
    className: { control: 'text' },
    contacts: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

// 示例联系人数据
const exampleContacts: ChatContact[] = [
  { id: '1', name: '张三', avatar: '张', isAI: false },
  { id: '2', name: '李四', avatar: '李', isAI: false },
  { id: '3', name: 'AI助手', avatar: 'A', isAI: true },
  { id: '4', name: '王五', avatar: '王', isAI: false },
  { id: '5', name: '赵六', avatar: '赵', isAI: false },
  { id: '6', name: '孙七', avatar: '孙', isAI: false },
  { id: '7', name: '周八', avatar: '周', isAI: false },
  { id: '8', name: '吴九', avatar: '吴', isAI: false },
  { id: '9', name: '郑十', avatar: '郑', isAI: false },
  { id: '10', name: '冯十一', avatar: '冯', isAI: false },
];

// 包装器组件接口
interface InputWithValueDisplayProps {
  initialContent?: string;
  placeholder?: string;
  className?: string;
  contacts?: ChatContact[];
}

// 带调试面板的包装器组件，用于显示实时值
const InputWithValueDisplay = ({
  initialContent = '',
  placeholder = '输入消息...',
  className = '',
  contacts = [],
}: InputWithValueDisplayProps) => {
  const [value, setValue] = useState(initialContent);
  
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl">
      {/* 聊天输入组件 */}
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="p-2 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
          聊天输入组件
        </div>
        <ChatInput
          initialContent={initialContent}
          placeholder={placeholder}
          className={className}
          contacts={contacts}
          onChange={setValue}
        >
          <TreeViewPlugin />
        </ChatInput>
      </div>
      
      {/* 当前输入值显示 */}
      <div className="text-xs text-gray-500 mt-2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg">
        <span className="font-semibold">当前输入值:</span> {value || '<空>'}
      </div>
    </div>
  );
};

// 基础用法
export const 默认: Story = {
  render: (args) => (
    <InputWithValueDisplay
      placeholder={args.placeholder}
      contacts={args.contacts}
    />
  ),
  args: {
    placeholder: '输入聊天消息...',
  },
};

// 带初始内容
export const 带初始内容: Story = {
  render: (args) => (
    <InputWithValueDisplay
      initialContent={args.initialContent}
      placeholder={args.placeholder}
      contacts={args.contacts}
    />
  ),
  args: {
    initialContent: '你好，这是一条初始消息。',
    placeholder: '继续聊天...',
  },
};

// 自定义样式
export const 自定义样式: Story = {
  render: (args) => (
    <InputWithValueDisplay
      placeholder={args.placeholder}
      className={args.className}
      contacts={args.contacts}
    />
  ),
  args: {
    className: 'bg-gray-100 border-blue-500 border-2',
    placeholder: '输入消息...',
  },
};

// 展示@提及功能
export const 带提及功能: Story = {
  render: (args) => (
    <InputWithValueDisplay
      placeholder={args.placeholder}
      contacts={args.contacts}
    />
  ),
  args: {
    contacts: testContacts,
    placeholder: '输入@可以提及联系人',
  },
  parameters: {
    docs: {
      description: {
        story: '输入@字符后可以看到联系人列表，选择一个联系人可以将其添加为提及。',
      },
    },
  },
};

// 不同容器大小
export const 不同容器大小: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    
    return (
      <div className="space-y-6 w-full max-w-2xl">
        <div className="w-full">
          <p className="mb-2 text-sm text-gray-500">宽容器</p>
          <div className="border rounded-lg overflow-hidden">
            <ChatInput
              placeholder="宽容器中的输入框..."
              contacts={testContacts}
              onChange={setValue1}
            >
              <TreeViewPlugin />
            </ChatInput>
          </div>
          <div className="text-xs text-gray-500 mt-2 border-t pt-2">
            <span className="font-semibold">当前输入值:</span> {value1 || '<空>'}
          </div>
        </div>
        <div className="w-64">
          <p className="mb-2 text-sm text-gray-500">窄容器 (w-64)</p>
          <div className="border rounded-lg overflow-hidden">
            <ChatInput
              placeholder="窄容器中的输入框..."
              contacts={testContacts}
              onChange={setValue2}
            >
              <TreeViewPlugin />
            </ChatInput>
          </div>
          <div className="text-xs text-gray-500 mt-2 border-t pt-2">
            <span className="font-semibold">当前输入值:</span> {value2 || '<空>'}
          </div>
        </div>
      </div>
    );
  },
};

// @提及交互说明
export const 提及交互说明: Story = {
  render: (args) => (
    <InputWithValueDisplay
      placeholder={args.placeholder}
      contacts={args.contacts}
    />
  ),
  args: {
    placeholder: '输入@尝试提及用户',
    contacts: exampleContacts
  },
  parameters: {
    docs: {
      description: {
        story: `
### @提及使用说明
1. 在输入框中输入@符号
2. 联系人列表会自动弹出
3. 使用上/下方向键在列表中导航
4. 按Enter键或点击选择联系人
5. 按Esc键取消选择
        `
      }
    }
  }
};

// 提及测试 - 使用预置内容触发
const MentionTester = () => {
  const [value, setValue] = useState('@');
  
  useEffect(() => {
    // 模拟输入@触发提及列表
    console.log('测试@提及功能');
  }, []);
  
  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl">
      <div className="text-sm text-gray-500">
        这个例子中，我们通过预先输入"@"来测试提及弹出功能。下面输入框中应该立即显示联系人列表。
      </div>
      <div className="border rounded-lg overflow-hidden">
        <ChatInput 
          initialContent="@"
          onChange={setValue}
          placeholder="应该立即显示@联系人列表"
          contacts={exampleContacts}
        >
          <TreeViewPlugin />
        </ChatInput>
      </div>
      <div className="text-xs text-gray-500 mt-2 border-t pt-2">
        <span className="font-semibold">当前输入值:</span> {value || '<空>'}
      </div>
    </div>
  );
};

export const 提及测试: Story = {
  render: () => <MentionTester />,
  parameters: {
    docs: {
      description: {
        story: '这个测试用例应该自动显示@联系人列表，用于测试功能是否正常工作'
      }
    }
  }
};

// 调试工具示例
export const 调试工具: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="flex flex-col gap-4 w-full max-w-2xl">
        <div className="text-sm p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium mb-2">完整调试工具演示</h3>
          <p className="text-sm">
            这个示例展示了编辑器的完整调试工具集，包括调试面板和树视图。
            这些工具对开发过程中观察和理解编辑器的内部结构和状态变化非常有帮助。
          </p>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <ChatInput
            contacts={exampleContacts}
            onChange={setValue}
            placeholder="在此输入内容，查看调试信息..."
          >
            <TreeViewPlugin />
          </ChatInput>
        </div>
        
        <div className="mt-4 p-4 border rounded-lg">
          <div className="text-sm font-medium mb-2">当前输入值:</div>
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded min-h-10">
            {value || '<空>'}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '这个示例展示了编辑器的完整调试工具集。TreeView插件显示了编辑器的内部结构，而DebugPanel提供了更详细的状态信息。在实际应用中，这些调试工具通常只在开发环境中启用。',
      },
    },
  },
};

// 提及修复演示
export const 提及修复演示: Story = {
  render: (args) => {
    const [value, setValue] = useState('@');
    
    return (
      <div className="flex flex-col gap-4 w-full max-w-2xl">
        <div className="text-sm p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="font-medium mb-2">@提及功能修复演示</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>输入框已预填充@符号，应立即显示联系人列表</li>
            <li>点击列表中的联系人，会在输入框中显示带气泡效果的提及</li>
            <li>查看下方"当前输入值"显示的内容应包含选中的联系人</li>
            <li>如使用键盘，可按上下箭头选择，回车确认</li>
          </ol>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <ChatInput
            contacts={exampleContacts}
            onChange={setValue}
            initialContent="@"
            placeholder="从列表中选择一个联系人..."
          >
            <TreeViewPlugin />
          </ChatInput>
        </div>
        
        <div className="mt-4 p-4 border rounded-lg">
          <div className="text-sm font-medium mb-2">当前输入值:</div>
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded min-h-10">
            {value || '<空>'}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '这个示例专门用于测试修复后的@提及功能。输入框中已经预填充了@符号，应该立即显示联系人列表。选择一个联系人后，输入框中应该显示带气泡效果的提及，并且"当前输入值"也应该相应更新。'
      }
    }
  }
};

// @提及转换示例
export const 自动提及转换: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="flex flex-col gap-4 w-full max-w-2xl">
        <div className="text-sm p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="font-medium mb-2">自动@提及转换演示</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>在输入框中输入"@"加联系人名称，例如"@张三"</li>
            <li>在名称后输入空格或换行</li>
            <li>文本将自动转换为提及气泡</li>
            <li>转换是自动的，不需要从下拉菜单选择</li>
          </ol>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <ChatInput
            contacts={[
              { id: 'user1', name: '张三', isAI: false },
              { id: 'user2', name: '李四', isAI: false },
              { id: 'user3', name: '王五', isAI: false },
              { id: 'ai1', name: 'AI助手', isAI: true },
            ]}
            onChange={setValue}
            placeholder="尝试输入'@张三 '看看效果..."
          >
            <TreeViewPlugin />
          </ChatInput>
        </div>
        
        <div className="mt-4 p-4 border rounded-lg">
          <div className="text-sm font-medium mb-2">当前输入值:</div>
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded min-h-10">
            {value || '<空>'}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '这个示例展示了自动@提及转换功能。当用户输入"@"加联系人名称后，文本会自动转换为提及气泡。这是通过Lexical的Node Transforms实现的，不需要用户从下拉菜单中选择联系人。'
      }
    }
  }
}; 