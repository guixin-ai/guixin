# Lexical 框架中的选择类型详解

Lexical 是一个强大的富文本编辑器框架，其核心特性之一是对不同类型选择的支持。选择（Selection）是编辑器状态的一部分，每次更新或变更编辑器时，选择状态始终与编辑器状态的节点树保持一致。本文将详细介绍 Lexical 中的各种选择类型。

## Lexical 中的选择类型

在 Lexical 中，存在四种主要的选择类型：

1. **RangeSelection（范围选择）**
2. **NodeSelection（节点选择）**
3. **TableSelection（表格选择）**
4. **null（空选择）**

所有的选择类型都实现了 `BaseSelection` 接口，虽然不推荐，但理论上你也可以实现自己的选择类型。

### 1. RangeSelection（范围选择）

这是最常见的选择类型，是对浏览器原生 DOM Selection 和 Range API 的规范化封装。RangeSelection 由三个主要属性组成：

- `anchor`：表示选择的起始点
- `focus`：表示选择的结束点
- `format`：表示活动文本格式的数字位标志

`anchor` 和 `focus` 点都指向一个代表编辑器特定部分的对象。RangeSelection 点的主要属性包括：

- `key`：所选 Lexical 节点的 `NodeKey`
- `offset`：在所选 Lexical 节点内的位置。对于 `text` 类型，这是字符位置；对于 `element` 类型，这是 `ElementNode` 内的子索引
- `type`：表示 `element` 或 `text` 类型

RangeSelection 通常用于：
- 普通的文本选择
- 光标定位
- 文本编辑操作

### 2. NodeSelection（节点选择）

NodeSelection 表示对多个任意节点的选择。例如，同时选择编辑器中的三个图像。

主要特性：
- 使用 `Set<NodeKey>` 存储被选中的节点键
- 通过 `getNodes()` 方法返回包含所选 LexicalNodes 的数组

NodeSelection 通常用于：
- 对多个非连续节点的操作
- 对整个节点（而非内部文本）的操作
- 复杂对象的选择和操作

### 3. TableSelection（表格选择）

TableSelection 表示表格等网格状结构中的选择。它存储了选择发生的父节点键以及起始和结束点。TableSelection 由三个主要属性组成：

- `tableKey`：表示选择发生的父节点键
- `anchor`：表示 TableSelection 的起始点
- `focus`：表示 TableSelection 的结束点

例如，选择从第1行第1列到第2行第2列的表格区域可以表示为：
- `tableKey = 2`：表格键
- `anchor = 4`：起始表格单元格（键可能会变）
- `focus = 10`：结束表格单元格（键可能会变）

注意，`anchor` 和 `focus` 点的工作方式与 `RangeSelection` 相同。

TableSelection 通常用于：
- 表格中的单元格选择
- 表格行列的批量操作
- 结构化网格数据的编辑

### 4. null（空选择）

当编辑器没有任何活动选择时，选择类型为 null。这在以下情况下很常见：

- 编辑器失去焦点（blur）
- 选择移动到页面上的另一个编辑器
- 尝试选择编辑器空间内的非可编辑组件

## 如何使用选择

可以使用 Lexical 包中导出的 `$getSelection()` 辅助函数获取选择。该函数可以在更新、读取或命令监听器中使用。

```tsx
import { $getSelection, $isRangeSelection, $isNodeSelection } from 'lexical';

// 在编辑器的 update 或 read 函数内部
const selection = $getSelection();

// 检查选择类型
if ($isRangeSelection(selection)) {
  // 处理范围选择...
  const anchor = selection.anchor;
  const focus = selection.focus;
  
  // 检查是否是折叠的选择（光标）
  if (selection.isCollapsed()) {
    // 处理光标...
  } else {
    // 处理文本选择...
  }
} else if ($isNodeSelection(selection)) {
  // 处理节点选择...
  const nodes = selection.getNodes();
  // 对节点执行操作...
} else if (selection === null) {
  // 处理无选择状态...
}
```

## 选择类型的应用实例

以下是一个实际例子，展示了如何在处理 @ 提及功能时，区分不同的选择类型：

```tsx
// 检测键盘@符号输入，在满足条件时触发提及功能
const selection = $getSelection();

// 只处理范围选择（光标选择）的情况
if (!$isRangeSelection(selection)) {
  // 非范围选择，如节点选择或表格选择时，跳过处理
  return;
}

// 继续处理 @ 提及逻辑...
const anchor = selection.anchor;
const anchorNode = anchor.getNode();
const offset = anchor.offset;

// 后续逻辑...
```

在上面的例子中，我们只希望在用户正在输入文本（RangeSelection）时触发 @ 提及功能，而不是在选择了整个节点或表格时。

## 总结

Lexical 框架的选择系统设计灵活而强大，能够满足不同类型编辑需求：

- **RangeSelection**：处理常规文本选择和光标定位
- **NodeSelection**：处理对整个节点的选择
- **TableSelection**：处理表格中的网格状选择
- **null**：表示无选择状态

理解这些选择类型对于开发高级编辑功能至关重要，能够让你的编辑器插件在正确的上下文中触发，提供更精准的用户体验。 