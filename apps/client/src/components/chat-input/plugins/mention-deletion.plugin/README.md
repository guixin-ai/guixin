# 提及删除插件 (mention-deletion.plugin)

提及删除插件是一个组合插件，包含两个子插件，负责处理提及节点的删除和相关特殊情况。

## 插件组成

1. **MentionDeletionPlugin** - 主插件，组合了所有子插件
   - 文件: `mention-deletion.plugin.tsx`

2. **MentionNodeDeletionPlugin** - 负责提及节点删除的子插件
   - 文件: `mention-node-deletion.plugin.tsx`
   - 功能: 当光标在提及节点后的空格节点开始位置按退格键时，删除提及节点

3. **MentionAdjacentTextBackspacePlugin** - 负责提及节点相邻文本退格处理的子插件
   - 文件: `mention-adjacent-text-backspace.plugin.tsx`
   - 功能: 处理与提及节点相邻的文本节点在退格键按下时的特殊情况
   - 新增功能: 当删除文本节点最后一个字符且与提及节点相邻时，将其转换为零宽字符节点

## 使用方法

在编辑器中添加主插件即可:

```tsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { MentionDeletionPlugin } from '../plugins/mention-deletion.plugin';

function Editor() {
  return (
    <LexicalComposer initialConfig={...}>
      {/* 其他插件 */}
      <MentionDeletionPlugin />
    </LexicalComposer>
  );
}
```

主插件会自动组合所有子插件，确保提及节点的删除行为正常工作。

## 详细文档

- 关于插件整体的工作原理和流程，请参考 `mention-deletion.plugin.md` 文档
- 关于提及节点相邻文本退格处理的详细说明，请参考 `mention-adjacent-text-backspace.plugin.md` 文档 