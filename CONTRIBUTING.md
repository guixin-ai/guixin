# 贡献指南

感谢您对我们项目的关注！本文档将帮助您了解如何为本项目做出贡献。

## Commit 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 规范来标准化提交信息。每个提交信息应该遵循以下格式：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

### 类型（Type）

提交类型必须是以下之一：

- **feat**: 新功能（feature）
- **fix**: 修复 bug
- **docs**: 文档更新
- **style**: 代码风格修改（不影响代码运行的变动，如空格、格式化、缺少分号等）
- **refactor**: 重构（既不是新增功能，也不是修改 bug 的代码变动）
- **perf**: 性能优化
- **test**: 测试相关
- **build**: 构建系统或外部依赖项修改
- **ci**: CI 配置文件和脚本修改
- **chore**: 其他杂项修改
- **revert**: 回退之前的提交

### 作用域（Scope）

作用域是可选的，用于说明提交影响的范围。它应该是名词，例如：

- 组件名称（如 `button`, `dialog`）
- 文件名（如 `package.json`）
- 功能区域（如 `auth`, `api`）

### 描述（Description）

描述是必须的，简明扼要地描述本次提交的内容。

- 使用祈使句，现在时态（如："change"，而不是"changed"或"changes"）
- 首字母不要大写
- 结尾不加句号

### 示例

```
feat(auth): 添加用户登录功能

实现了基于 JWT 的用户登录认证系统，包括：
- 登录表单
- 令牌验证
- 会话管理

修复了 #123 问题
```

```
fix(api): 修复用户数据获取超时问题
```

```
docs(readme): 更新安装指南
```

```
style: 规范代码缩进
```

## 开发流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 代码风格

- JavaScript/TypeScript 代码使用 ESLint 和 Prettier 进行格式化
- Rust 代码使用 Clippy 和 rustfmt 进行格式化

在提交代码前，请确保：
- 所有测试通过 (`pnpm test`)
- 代码符合项目的代码风格 (`pnpm lint`)

## 提交 Pull Request

1. 确保您的 PR 标题也遵循 Conventional Commits 规范
2. 在 PR 描述中清晰说明您的更改
3. 链接到相关的 Issue（如有）
4. 如果是 UI 更改，请附上屏幕截图

## 许可证

通过为本项目做出贡献，您同意您的贡献将根据项目许可证授权。 