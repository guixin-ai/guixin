import { useState, useCallback } from 'react';
import { MarkdownDocInput } from '../index';

const initialMarkdown = `# 欢迎使用 Markdown 编辑器

这是一个基于 Lexical 的 Markdown 编辑器示例。

## 特性

- **实时预览**：边写边看效果
- **导出功能**：一键导出 Markdown 源码
- **语法支持**：支持所有常见 Markdown 语法

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+B | 粗体 |
| Ctrl+I | 斜体 |
| Ctrl+Z | 撤销 |
| Ctrl+Shift+Z | 重做 |

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

> 开始编辑，体验 Markdown 的魅力吧！
`;

export function MarkdownEditorExample() {
  const [markdown, setMarkdown] = useState<string>(initialMarkdown);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'split'>('split');

  const handleChange = useCallback((value: string) => {
    setMarkdown(value);
  }, []);

  const handleExport = useCallback(() => {
    // 创建一个 Blob 对象
    const blob = new Blob([markdown], { type: 'text/markdown' });
    
    // 创建一个下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    
    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [markdown]);

  const handleReset = useCallback(() => {
    if (window.confirm('确定要重置编辑器内容吗？这将丢失当前所有修改。')) {
      setMarkdown(initialMarkdown);
    }
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Markdown 编辑器</h1>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            重置
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1 bg-blue-500 text-white hover:bg-blue-600 rounded"
          >
            导出 Markdown
          </button>
        </div>
      </div>

      <div className="mb-4 flex border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'edit' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          编辑
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'preview' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          预览
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'split' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
          onClick={() => setActiveTab('split')}
        >
          分屏模式
        </button>
      </div>

      {activeTab === 'edit' && (
        <div className="border rounded-md">
          <MarkdownDocInput
            initialMarkdown={markdown}
            onChange={handleChange}
            className="min-h-[600px]"
          />
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="border rounded-md p-4 min-h-[600px]">
          <MarkdownDocInput
            initialMarkdown={markdown}
            readOnly={true}
          />
        </div>
      )}

      {activeTab === 'split' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-md">
            <MarkdownDocInput
              initialMarkdown={markdown}
              onChange={handleChange}
              className="min-h-[600px]"
            />
          </div>
          <div className="border rounded-md p-4 min-h-[600px] overflow-auto">
            <MarkdownDocInput
              initialMarkdown={markdown}
              readOnly={true}
            />
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-medium mb-2">Markdown 源码</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[200px] text-sm">
          {markdown}
        </pre>
      </div>
    </div>
  );
} 