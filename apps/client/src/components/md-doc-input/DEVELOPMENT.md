# MarkdownDocInput 开发文档

## 组件架构

### 核心依赖

- `@lexical/react` - Lexical 编辑器框架的 React 集成
- `@lexical/markdown` - Markdown 转换和快捷输入支持
- `lexical` - 核心编辑器框架

### 主要组件结构

```
MarkdownDocInput/
├── index.tsx              # 主组件实现
├── README.md             # 使用文档
├── DEVELOPMENT.md        # 开发文档
├── md-doc-input.stories.tsx  # Storybook 示例
└── examples/             # 示例代码
    └── markdown-editor-example.tsx  # 完整示例应用
```

### 核心功能模块

1. **编辑器核心**
   - `LexicalComposer` - 编辑器上下文提供者
   - `RichTextPlugin` - 富文本编辑支持
   - `ContentEditable` - 可编辑区域

2. **Markdown 支持**
   - `MarkdownShortcutPlugin` - Markdown 快捷输入
   - `$convertFromMarkdownString` - Markdown 导入
   - `$convertToMarkdownString` - Markdown 导出

3. **辅助功能**
   - `AutoFocusPlugin` - 自动聚焦
   - `HistoryPlugin` - 撤销/重做
   - 自定义插件系统

## 开发指南

### 环境设置

1. 确保已安装所需依赖：
```bash
pnpm add @lexical/react @lexical/markdown lexical
```

2. 开发工具推荐：
   - VSCode
   - TypeScript 支持
   - ESLint 配置

### 开发流程

1. **组件开发**
   - 遵循 TypeScript 类型定义
   - 使用函数组件和 Hooks
   - 保持组件的纯函数特性

2. **样式开发**
   - 使用 Tailwind CSS
   - 遵循响应式设计原则
   - 保持主题一致性

3. **测试**
   - 编写单元测试
   - 使用 Storybook 进行视觉测试
   - 进行跨浏览器测试

### 代码规范

1. **命名规范**
   - 组件使用 PascalCase
   - 函数使用 camelCase
   - 常量使用 UPPER_SNAKE_CASE

2. **文件组织**
   - 相关文件放在同一目录
   - 使用 index.tsx 作为主入口
   - 保持文件结构清晰

3. **注释规范**
   - 组件顶部添加功能说明
   - 复杂逻辑添加注释
   - 使用 JSDoc 格式

## 已知问题

### 1. Lexical 类型定义问题

目前 Lexical 的类型定义存在一些问题，主要表现在：

1. `$convertFromMarkdownString` 和 `$convertToMarkdownString` 的返回类型不正确
2. 编辑器状态序列化和反序列化的类型不匹配
3. 插件组件的类型定义不完整

#### 临时解决方案

1. 创建类型声明文件 `types/lexical.d.ts`：

```typescript
import { EditorState, LexicalNode } from 'lexical';

declare module '@lexical/markdown' {
  export interface Transformer {
    export: (node: LexicalNode) => string | null;
    regExp: RegExp;
    replace: (textNode: TextNode, match: RegExpMatchArray) => void;
    type: string;
  }

  export function $convertFromMarkdownString(
    markdown: string,
    transformers: Transformer[]
  ): EditorState;

  export function $convertToMarkdownString(
    transformers: Transformer[],
    node?: LexicalNode
  ): string;
}

declare module '@lexical/react/LexicalMarkdownShortcutPlugin' {
  export interface MarkdownShortcutPluginProps {
    transformers: Transformer[];
  }

  export const MarkdownShortcutPlugin: React.FC<MarkdownShortcutPluginProps>;
}
```

2. 使用简化的文本处理方式：

```typescript
// 初始化编辑器状态
const initialState = createEditor({
  namespace: 'MarkdownDocInput',
  nodes: [...],
  onError: (error) => console.error(error),
});

// 设置初始内容
if (initialMarkdown) {
  initialState.update(() => {
    const root = $getRoot();
    root.clear();
    const lines = initialMarkdown.split('\n');
    lines.forEach(line => {
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(line));
      root.append(paragraph);
    });
  });
}

// 处理内容变化
const handleChange = (editorState: EditorState) => {
  editorState.read(() => {
    const root = $getRoot();
    const text = root.getTextContent();
    onChange?.(text);
  });
};
```

3. 自定义插件组件：

```typescript
const OnChangePlugin: React.FC<{
  onChange: (editorState: EditorState) => void;
}> = ({ onChange }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState);
    });
  }, [editor, onChange]);

  return null;
};
```

### 2. 性能优化建议

1. **状态管理**
   - 使用 `useCallback` 和 `useMemo` 优化函数和对象
   - 避免不必要的重渲染
   - 实现编辑器状态的缓存机制

2. **内容处理**
   - 使用防抖处理频繁的内容更新
   - 实现增量更新机制
   - 优化大文档的处理性能

3. **插件优化**
   - 按需加载插件
   - 优化插件的更新逻辑
   - 减少不必要的状态同步

## 开发建议

1. **代码组织**
   - 将类型定义放在单独的文件中
   - 使用 TypeScript 的 strict 模式
   - 保持代码结构清晰

2. **错误处理**
   - 添加适当的错误边界
   - 实现错误恢复机制
   - 提供友好的错误提示

3. **测试策略**
   - 编写单元测试
   - 添加集成测试
   - 进行性能测试

## 未来改进

1. **功能增强**
   - 完善 Markdown 语法支持
   - 添加更多编辑器功能
   - 优化用户体验

2. **类型支持**
   - 等待 Lexical 官方修复类型问题
   - 完善自定义类型定义
   - 改进类型推导

3. **性能优化**
   - 实现虚拟滚动
   - 优化大文档处理
   - 改进状态管理

## 调试指南

### 常见问题排查

1. **编辑器不响应**
   - 检查节点注册是否完整
   - 验证 TRANSFORMERS 配置
   - 检查事件监听器绑定

2. **Markdown 转换问题**
   - 确保在正确的上下文中调用转换函数
   - 验证 Markdown 语法支持
   - 检查节点转换器配置

### 开发工具

1. **React Developer Tools**
   - 检查组件层次结构
   - 监控状态更新
   - 分析性能瓶颈

2. **Chrome DevTools**
   - 使用 Performance 面板分析性能
   - 使用 Memory 面板检查内存泄漏
   - 使用 Console 查看错误和警告

## 测试策略

1. **单元测试**
   - 测试 Markdown 转换功能
   - 测试编辑器状态管理
   - 测试事件处理

2. **集成测试**
   - 测试与其他组件的交互
   - 测试键盘快捷键
   - 测试复杂的编辑操作

3. **性能测试**
   - 测试大文档的加载性能
   - 测试实时预览性能
   - 测试内存使用情况

## 未来计划

1. **功能增强**
   - 添加更多 Markdown 扩展语法支持
   - 实现自定义快捷键配置
   - 添加协同编辑支持

2. **性能优化**
   - 实现增量渲染
   - 优化状态管理
   - 改进 Markdown 解析性能

3. **开发体验**
   - 提供更好的类型支持
   - 改进错误提示
   - 添加更多示例和文档

## 发布流程

1. **版本控制**
   - 遵循语义化版本
   - 更新 CHANGELOG
   - 创建发布标签

2. **文档更新**
   - 更新 README.md
   - 更新 API 文档
   - 添加迁移指南

3. **测试验证**
   - 运行单元测试
   - 进行集成测试
   - 验证示例代码

## 贡献指南

1. **提交规范**
   - 使用语义化提交信息
   - 添加测试用例
   - 更新相关文档

2. **代码审查**
   - 遵循代码规范
   - 确保测试覆盖
   - 验证性能影响

3. **文档维护**
   - 保持文档最新
   - 添加示例代码
   - 更新 API 说明 