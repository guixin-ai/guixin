# Git Submodules 使用指南

Git Submodules 是一个允许你将一个 Git 仓库作为另一个 Git 仓库的子目录的功能。它能让你将另一个仓库克隆到自己的项目中，同时还保持提交的独立性。

## 基本概念

- **主仓库**：包含子模块的 Git 仓库
- **子模块**：被主仓库引用的其他 Git 仓库
- **子模块引用**：主仓库中记录的子模块特定提交的引用

## 常用命令

### 添加子模块

```bash
# 添加子模块
git submodule add <repository-url> <path>

# 例如
git submodule add https://github.com/username/repo.git external/repo
```

### 克隆包含子模块的仓库

```bash
# 克隆主仓库（包含子模块）
git clone --recursive <repository-url>

# 或者分两步
git clone <repository-url>
git submodule init
git submodule update
```

### 更新子模块

```bash
# 更新所有子模块
git submodule update --remote

# 更新特定子模块
git submodule update --remote <submodule-name>
```

### 查看子模块状态

```bash
# 查看子模块状态
git submodule status

# 查看子模块详细信息
git submodule foreach git status
```

## 最佳实践

1. **子模块命名**
   - 使用有意义的名称
   - 建议放在 `external/` 或 `vendor/` 目录下

2. **提交管理**
   - 在主仓库中提交时，确保子模块引用是最新的
   - 使用 `git submodule update --remote` 定期更新子模块

3. **分支管理**
   - 建议在子模块中使用稳定的分支（如 main 或 master）
   - 避免使用 HEAD 引用，而是使用具体的提交哈希

4. **权限管理**
   - 确保团队成员有适当的子模块仓库访问权限
   - 考虑使用 SSH 密钥进行认证

## 常见问题

1. **子模块更新失败**
   ```bash
   # 清理子模块状态
   git submodule deinit -f <submodule-name>
   git rm -f <submodule-name>
   git submodule add <repository-url> <path>
   ```

2. **子模块冲突**
   ```bash
   # 进入子模块目录
   cd <submodule-path>
   # 解决冲突
   git checkout main
   git pull
   # 返回主仓库
   cd ..
   git add <submodule-path>
   git commit -m "Update submodule"
   ```

## 注意事项

1. 子模块会增加仓库的复杂性，使用前请确保真的需要
2. 定期更新子模块以获取最新的功能和修复
3. 在团队协作时，确保所有成员都了解子模块的使用方式
4. 考虑使用 Git LFS 处理大型子模块

## 参考资料

- [Git Submodules 官方文档](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Git Submodules 最佳实践](https://git-scm.com/book/en/v2/Git-Tools-Submodules#_submodule_tips) 