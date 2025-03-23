// 工具和辅助插件
export * from './editor-ref-plugin';
export * from './on-change-plugin';
export * from './tree-view-plugin';

// 提及相关插件
export * from './mention-trigger-plugin';
export * from './mention-list-plugin';
export * from './mention-keyboard-plugin';
export * from './mention-transforms-plugin';
export * from './mention-node-plugin';
export * from './mention-content-tracker-plugin';
export * from './mention-cancellation-plugin';

// 注意: 提及相关插件结构
// - mention-trigger-plugin：监控@输入并触发提及功能
// - mention-list-plugin：管理联系人列表显示
// - mention-keyboard-plugin：处理键盘导航
// - mention-transforms-plugin：转换文本为提及节点
// - mention-node-plugin：提及节点的特殊行为
// - mention/mention-content-tracker-plugin：追踪@后的内容变化
// - mention/mention-cancellation-plugin：处理取消提及的情况