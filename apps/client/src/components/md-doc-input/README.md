# Markdown 文档输入组件

基于 Lexical 编辑器框架的 Markdown 文档输入组件，提供友好的 Markdown 编辑体验。

## 功能特性

- 支持常见 Markdown 语法快捷输入（例如 `#` 标题，`*` 列表等）
- 自动将编辑器内容以 Markdown 格式输出
- 支持从 Markdown 字符串导入内容
- 支持只读模式，可用于内容展示
- 完整的键盘操作支持
- 自定义样式和主题支持
- 支持通过插件扩展功能

## 安装

组件已经集成在项目中，无需额外安装。直接从组件目录导入即可：

```tsx
import { MarkdownDocInput } from '@/components/md-doc-input';
```

## 使用示例

### 基本使用

```tsx
import { MarkdownDocInput } from '@/components/md-doc-input';

function MyComponent() {
  const handleChange = (markdown: string) => {
    console.log('Markdown 内容:', markdown);
  };

  return (
    <MarkdownDocInput
      onChange={handleChange}
      placeholder="请输入 Markdown 文档..."
    />
  );
}
```

### 带初始内容

```tsx
<MarkdownDocInput
  initialMarkdown="# 标题\n\n这是初始内容"
  onChange={handleChange}
/>
```

### 只读模式

```tsx
<MarkdownDocInput
  initialMarkdown="# 只读文档\n\n此内容不可编辑"
  readOnly={true}
/>
```

### 实时预览

```tsx
function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# 开始编辑');
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3>编辑器</h3>
        <MarkdownDocInput
          initialMarkdown={markdown}
          onChange={(value) => setMarkdown(value)}
        />
      </div>
      <div>
        <h3>预览</h3>
        <MarkdownDocInput
          initialMarkdown={markdown}
          readOnly={true}
        />
      </div>
    </div>
  );
}
```

## 属性说明

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `onChange` | `(markdown: string, json: SerializedEditorState) => void` | `undefined` | 内容变化时的回调函数 |
| `initialMarkdown` | `string` | `''` | 初始 Markdown 内容 |
| `placeholder` | `string` | `'输入 Markdown 文档...'` | 占位文本 |
| `className` | `string` | `''` | 自定义 CSS 类名 |
| `autoFocus` | `boolean` | `true` | 是否自动获取焦点 |
| `readOnly` | `boolean` | `false` | 是否为只读模式 |
| `children` | `React.ReactNode` | `undefined` | 可以传入额外的 Lexical 插件 |

## 支持的 Markdown 语法

- **标题**：使用 `#` 符号（支持 6 级标题）
- **列表**：无序列表 `- `，有序列表 `1. `
- **格式化**：粗体 `**文本**`，斜体 `*文本*`，删除线 `~~文本~~`
- **代码**：行内代码 `` `代码` ``，代码块 `` ``` ``
- **引用**：使用 `>` 符号
- **链接**：`[链接文本](URL)`

## 扩展功能

组件支持通过 Lexical 插件机制扩展功能。您可以通过 `children` 属性传入额外的插件：

```tsx
import { ListPlugin } from '@lexical/react/LexicalListPlugin';

<MarkdownDocInput>
  <ListPlugin />
  {/* 更多插件 */}
</MarkdownDocInput>
```

## 已知问题和限制

- 图片支持仅限于链接引用，不支持本地图片上传
- 表格编辑体验有限，复杂表格操作可能需要手动编写 Markdown

## 未来计划

- 添加更多 Markdown 扩展语法支持
- 优化表格编辑体验
- 添加图片上传功能
- 改进代码块语法高亮 