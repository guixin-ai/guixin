// 工具和辅助插件
export * from './editor-ref-plugin';
export * from './on-change-plugin';
export * from './tree-view-plugin';

// 提及相关插件
export * from './mention-trigger-plugin';
export * from './mention-transforms-plugin';
export * from './mention-list-plugin';
export * from './mention-keyboard-plugin';
export * from './mention-node-plugin';

// 注意: 所有提及相关插件已重构，放置在独立模块中
// - mention-trigger-plugin：监控@输入并触发提及功能
// - mention/mention-list-plugin：管理联系人列表显示
// - mention/mention-keyboard-plugin：处理键盘导航
// - mention/mention-transforms-plugin：转换文本为提及节点
// - mention/mention-node-plugin：提及节点的特殊行为