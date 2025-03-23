# 聊天输入组件

一个基于Lexical编辑器的聊天输入组件，支持@提及功能。

## 主要功能

- **基本文本输入**
  - 支持普通文本输入和编辑
  - 自动换行和滚动
  - 光标定位和选择

- **@提及联系人功能**
  - 输入@触发联系人列表
  - 实时过滤匹配联系人
  - 键盘导航和鼠标选择
  - 提及节点整体删除
  - 提及节点内容序列化
  - 焦点管理和无障碍支持

- **编辑器控制**
  - 自动聚焦控制
  - 内容变更事件
  - 初始内容设置
  - 编辑器实例引用

- **界面定制**
  - 占位文本设置
  - 自定义容器样式
  - 高度自适应

## 插件结构

组件使用模块化的插件结构，特别是@提及功能已被拆分为多个细粒度插件，每个插件负责特定功能：

### 提及功能插件协调图

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#242424', 'primaryTextColor': '#fff', 'primaryBorderColor': '#888', 'lineColor': '#d3d3d3', 'secondaryColor': '#2b2b2b', 'tertiaryColor': '#353535'}}}%%
flowchart TD
    MentionTriggerPlugin[MentionTriggerPlugin\n监听@符号输入] -- "触发@命令和位置信息" --> MentionListPlugin[MentionListPlugin\n显示联系人列表]
    
    MentionListPlugin -- "过滤请求" --> MentionFilterPlugin[MentionFilterPlugin\n过滤联系人]
    MentionListPlugin -- "键盘导航请求" --> MentionKeyboardNavigationPlugin[MentionKeyboardNavigationPlugin\n键盘导航]
    
    MentionKeyboardNavigationPlugin -- "选择联系人命令" --> MentionNodeTransformerPlugin[MentionNodeTransformerPlugin\n创建提及节点]
    MentionNodeTransformerPlugin -- "创建提及节点" --> MentionNodeRenderPlugin[MentionNodeRenderPlugin\n渲染节点]
    MentionNodeTransformerPlugin --> MentionClickHandler[MentionClickHandler\n点击处理]
    
    MentionNodeRenderPlugin <--> MentionNodeDeletionPlugin[MentionNodeDeletionPlugin\n删除处理]
    
    MentionNodeRenderPlugin -- "渲染提及节点" --> MentionSerializationPlugin[MentionSerializationPlugin\n序列化处理]
    MentionSerializationPlugin <--> MentionHistoryPlugin[MentionHistoryPlugin\n历史记录]
    MentionHistoryPlugin <--> MentionEventsPlugin[MentionEventsPlugin\n事件通知]
    
    MentionSerializationPlugin & MentionHistoryPlugin & MentionEventsPlugin --> MentionFocusPlugin[MentionFocusPlugin\n焦点管理]
    MentionSerializationPlugin & MentionHistoryPlugin & MentionEventsPlugin --> MentionAccessibilityPlugin[MentionAccessibilityPlugin\n无障碍支持]
    
    MentionFocusPlugin --> MentionDebugPlugin[MentionDebugPlugin\n调试工具]
    
    classDef functionality fill:#4682b4,stroke:#fff,stroke-width:1px,color:#fff
    classDef utility fill:#2e8b57,stroke:#fff,stroke-width:1px,color:#fff
    
    class MentionTriggerPlugin,MentionListPlugin,MentionFilterPlugin,MentionKeyboardNavigationPlugin,MentionNodeTransformerPlugin,MentionClickHandler,MentionNodeRenderPlugin,MentionNodeDeletionPlugin functionality
    class MentionSerializationPlugin,MentionHistoryPlugin,MentionEventsPlugin,MentionFocusPlugin,MentionAccessibilityPlugin,MentionDebugPlugin utility
```

### 插件详细说明

#### @提及功能子插件

1. `MentionTriggerPlugin`: 
   - 监听@符号输入
   - 检测触发条件并获取位置
   - 发送命令通知其他插件

2. `MentionListPlugin`: 
   - 显示联系人列表
   - 处理选择
   - 提供列表UI组件和定位逻辑

3. `MentionFilterPlugin`:
   - 处理输入文本的过滤逻辑
   - 实时匹配联系人数据
   - 返回过滤后的联系人列表

4. `MentionKeyboardNavigationPlugin`:
   - 专门处理键盘导航逻辑
   - 响应上下键移动选择
   - 管理回车、Tab和Esc键的行为

5. `MentionClickHandler`:
   - 处理鼠标点击选择联系人
   - 管理悬停效果和交互反馈

6. `MentionNodeTransformerPlugin`:
   - 创建提及节点并替换文本
   - 确保节点的正确位置和结构
   - 处理内容插入后的光标位置

7. `MentionNodeDeletionPlugin`:
   - 专门处理提及节点的删除操作
   - 确保整体删除行为
   - 处理退格和删除键的特殊逻辑

8. `MentionNodeRenderPlugin`:
   - 负责提及节点的视觉渲染
   - 提供节点的DOM元素
   - 处理不同环境下的显示

9. `MentionSerializationPlugin`:
   - 处理节点的序列化和反序列化
   - 确保提及信息在保存后可恢复
   - 提供数据转换格式接口

10. `MentionHistoryPlugin`:
    - 记录与提及相关的历史操作
    - 确保撤销/重做正确处理提及节点
    - 维护编辑状态的一致性

11. `MentionEventsPlugin`:
    - 对外暴露提及相关的事件
    - 提供选择、创建、删除提及的回调
    - 允许外部组件响应提及操作

12. `MentionFocusPlugin`:
    - 管理提及节点的焦点状态
    - 处理点击提及节点的特殊反馈
    - 提供悬停和选中状态

13. `MentionDebugPlugin`:
    - 开发调试工具
    - 记录提及相关的状态变化
    - 提供日志和错误处理

14. `MentionAccessibilityPlugin`:
    - 提供无障碍支持
    - 添加适当的ARIA属性
    - 确保键盘可访问性

### 辅助插件

- `EditorRefPlugin`: 提供对编辑器实例的引用
- `OnChangePlugin`: 处理内容变更事件
- `TreeViewPlugin`: 调试工具，显示编辑器节点树

## 自定义节点

- `MentionNode`: 表示提及的自定义节点类型

## @提及功能演示

1. 在输入框中输入@符号，会自动弹出联系人列表
2. 继续输入文字，联系人列表会根据输入内容进行过滤
3. 使用上/下方向键导航列表，回车或点击选择联系人
4. 选中后，@文本会转换为带特殊样式的提及节点
5. 删除提及时会整体删除该节点

## API

### 组件使用

```tsx
<ChatInput
  contacts={contacts}
  onChange={handleChange}
  initialContent="初始内容"
  placeholder="输入消息..."
  autoFocus={true}
/>
```

### 必要属性

- `contacts`: 联系人列表，必须提供
  - 类型: `ChatContact[]`
  - 示例: `[{ id: '1', name: '用户名', isAI: false }]`

### 可选属性

- `onChange`: 内容变化回调
  - 类型: `(value: string) => void`
  - 默认值: `undefined`

- `initialContent`: 初始内容
  - 类型: `string`
  - 默认值: `''`

- `placeholder`: 占位文本
  - 类型: `string`
  - 默认值: `'输入消息...'`

- `className`: 自定义类名
  - 类型: `string`
  - 默认值: `''`

- `autoFocus`: 是否自动聚焦
  - 类型: `boolean`
  - 默认值: `true`

- `children`: 自定义子插件
  - 类型: `React.ReactNode`
  - 默认值: `undefined`