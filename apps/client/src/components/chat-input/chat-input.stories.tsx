import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ChatInput } from '.';
import { TreeViewPlugin } from './plugins';

// 示例联系人数据
const exampleContacts = [
  { id: 'user1', name: '张三', isAI: false },
  { id: 'user2', name: '李四', isAI: false },
  { id: 'user3', name: '王五', isAI: false },
  { id: 'ai1', name: 'AI助手', isAI: true },
  { id: 'ai2', name: 'GPT模型', isAI: true },
];

const meta: Meta<typeof ChatInput> = {
  title: '组件/聊天输入框',
  component: ChatInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

// 带有值显示功能的输入框包装器组件的属性
interface InputWithValueDisplayProps {
  initialContent?: string;
  placeholder?: string;
  className?: string;
  contacts?: typeof exampleContacts;
  autoFocus?: boolean;
}

// 带调试面板的包装器组件，用于显示实时值
const InputWithValueDisplay = ({
  initialContent = '',
  placeholder = '输入消息...',
  className = '',
  contacts = exampleContacts,
  autoFocus = true,
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
          autoFocus={autoFocus}
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
    contacts: exampleContacts,
  },
};

// 初始内容示例
export const 初始内容: Story = {
  render: () => (
    <InputWithValueDisplay 
      initialContent="这是预设的初始内容，可以直接编辑"
      contacts={exampleContacts}
      placeholder="输入聊天消息..."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `
### 初始内容功能说明
- 可以通过设置 \`initialContent\` 属性来预填充编辑器的初始内容
- 初始内容会在编辑器加载时自动显示
- 用户可以直接编辑或删除初始内容
- 适用于回复、引用或继续之前的对话等场景
        `
      }
    }
  }
};

// 提及功能示例
export const 提及功能: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="flex flex-col gap-4 w-full max-w-2xl">
        <div className="text-sm p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="font-medium mb-2">@提及功能演示</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>在输入框中输入<strong>@</strong>符号，会自动弹出联系人列表</li>
            <li>继续输入文字，联系人列表会根据输入内容进行过滤</li>
            <li>使用上/下方向键导航列表，回车或点击选择联系人</li>
            <li>选中后，@文本会转换为带特殊样式的提及节点</li>
            <li>删除提及时会整体删除该节点</li>
          </ol>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <ChatInput
            contacts={exampleContacts}
            onChange={setValue}
            placeholder="输入@开始提及联系人..."
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
        story: `
### @提及功能使用说明
1. **触发方式**：输入@符号会立即触发联系人下拉列表
2. **筛选搜索**：继续输入字符会根据内容过滤联系人列表
3. **选择方式**：可以通过上下键导航并按回车选择，或直接点击
4. **自动转换**：选择后，@+文本会转换为特殊的提及节点，带有气泡样式
5. **整体删除**：删除提及节点时会作为整体删除

这个组件适用于需要在文本输入中添加用户提及的场景，如群聊、评论等。
        `
      }
    }
  }
}; 