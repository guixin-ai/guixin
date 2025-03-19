# Tauri 应用后端

## 环境准备

### 1. 安装 Rust 工具链

```bash
rustup update
```

### 2. 安装 SQLite 开发工具

```bash
cargo install diesel_cli --no-default-features --features "sqlite-bundled"
```

### 3. 安装项目依赖

```bash
cargo build
```

## 项目结构

```
src-tauri/
├── src/            # Rust 源代码
├── Cargo.toml      # Rust 项目配置
├── tauri.conf.json # Tauri 配置文件
└── README.md       # 项目说明文档
```

## 数据库管理

### 创建迁移

```bash
diesel migration generate <migration_name>
```

### 运行迁移

```bash
diesel migration run --database-url=file:./database.sqlite
```

### 生成 Rust Schema 代码

```bash
diesel print-schema > src/schema.rs
```

### 更新特定表的 Schema 代码

```bash
diesel print-schema -t users -t contacts -t agents -t contact_groups > src/schema.rs
```

### 回滚迁移

```bash
diesel migration revert --database-url=file:./database.sqlite
```

## 开发说明

1. 确保已安装所有必要的依赖
2. 使用 `cargo tauri dev` 启动开发服务器
3. 使用 `cargo tauri build` 构建生产版本

## 注意事项

- 确保 SQLite 数据库文件路径正确配置
- 在修改数据库结构后需要创建并运行迁移
- 保持数据库迁移文件的版本控制
