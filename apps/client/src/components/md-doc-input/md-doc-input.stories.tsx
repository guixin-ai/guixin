import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MarkdownDocInput } from './index';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

const meta: Meta<typeof MarkdownDocInput> = {
  title: 'Components/MarkdownDocInput',
  component: MarkdownDocInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MarkdownDocInput>;

// 基础文档输入框示例
export const Default: Story = {
  args: {
    placeholder: '输入 Markdown 文档...',
    className: 'w-[600px]',
  },
};

// 带有初始内容的文档输入框
export const WithInitialContent: Story = {
  args: {
    initialMarkdown: `# 标题示例

这是一个段落示例。

## 二级标题

- 列表项 1
- 列表项 2
  - 嵌套列表项

\`\`\`javascript
console.log('代码块示例');
\`\`\`

> 引用块示例

[链接示例](https://example.com)`,
    placeholder: '输入 Markdown 文档...',
    className: 'w-[600px]',
  },
};

// 只读模式的文档输入框
export const ReadOnly: Story = {
  args: {
    initialMarkdown: `# 只读模式示例

这是一个只读的 Markdown 文档。

## 功能展示

1. 支持标题
2. 支持列表
3. 支持代码块

\`\`\`typescript
const example = "代码高亮";
\`\`\``,
    readOnly: true,
    className: 'w-[600px]',
  },
};

// 实时预览示例
export const LivePreview: Story = {
  render: () => {
    const [markdown, setMarkdown] = useState('');

    const components: Components = {
      h1: ({ children }) => <h1 className="text-3xl font-bold my-4">{children}</h1>,
      h2: ({ children }) => <h2 className="text-2xl font-bold my-3">{children}</h2>,
      h3: ({ children }) => <h3 className="text-xl font-bold my-2">{children}</h3>,
      h4: ({ children }) => <h4 className="text-lg font-bold my-2">{children}</h4>,
      h5: ({ children }) => <h5 className="text-base font-bold my-1">{children}</h5>,
      h6: ({ children }) => <h6 className="text-sm font-bold my-1">{children}</h6>,
      p: ({ children }) => <p className="my-2">{children}</p>,
      ul: ({ children }) => <ul className="list-disc pl-5 my-2">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal pl-5 my-2">{children}</ol>,
      li: ({ children }) => <li className="my-1">{children}</li>,
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 my-2 text-gray-600">
          {children}
        </blockquote>
      ),
      pre: ({ children }) => (
        <pre className="bg-gray-100 p-2 rounded font-mono text-sm my-2 block">
          {children}
        </pre>
      ),
      code: ({ children }) => (
        <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">
          {children}
        </code>
      ),
      a: ({ href, children }) => (
        <a href={href} className="text-blue-500 underline">
          {children}
        </a>
      ),
    };

    return (
      <div className="flex gap-4">
        <div className="flex-1">
          <MarkdownDocInput
            onChange={(text) => setMarkdown(text)}
            placeholder="在左侧编辑..."
            className="w-full"
          />
        </div>
        <div className="flex-1 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-bold mb-2">预览</h3>
          <div className="markdown-preview">
            <ReactMarkdown components={components}>
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  },
}; 