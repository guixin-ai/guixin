# 开发文档

::: warning 注意
此部分文档仅在开发环境下可见，包含项目开发计划、技术规范和实现细节等信息。
:::

## 开发计划

### 进行中

- [Ollama 本地模型管理](/development/ollama-todo)
  - 配置管理界面开发
  - 性能优化功能
  - 服务管理功能

### 待开发

- 知识库功能增强
- 工作流编排系统
- 插件系统

## 技术栈

- 前端框架：React + TypeScript
- UI 组件：TailwindCSS
- 桌面端：Tauri
- 文档工具：VitePress
- 状态管理：Zustand

## 开发规范

### 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

### 命名规范

- 文件名：小写中划线（kebab-case）
- 组件名：大驼峰（PascalCase）
- 变量/函数：小驼峰（camelCase）
- 常量：大写下划线（UPPER_SNAKE_CASE）

### Git 提交规范

- feat: 新功能
- fix: 修复问题
- docs: 文档变更
- style: 代码格式
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 文档编写指南

### 文档结构

- 用户文档：面向最终用户，位于相应功能目录下
- 开发文档：面向开发者，位于 `/development` 目录下
- API 文档：面向集成开发，使用 TypeDoc 生成

### Markdown 规范

- 使用中文标点符号
- 中英文之间添加空格
- 代码块指定语言
- 使用 VitePress 内置组件增强展示效果

## 调试指南

### 开发环境启动

```bash
# 启动前端开发服务器
pnpm dev

# 启动文档服务器
pnpm docs:dev
```

### 常用调试工具

- Tauri 开发者工具
- React 开发者工具
- VS Code 调试配置

## 发布流程

1. 版本号更新
2. 更新日志编写
3. 代码审查
4. 测试验证
5. 打包发布

## 相关资源

- [项目 GitHub 仓库](https://github.com/硅信项目地址)
- [开发环境搭建指南](/development/setup)
- [架构设计文档](/development/architecture)
- [API 文档](/development/api)
