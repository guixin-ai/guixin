# 创建联系人分组的流程图

本文档描述了创建联系人分组的完整流程，从前端到后端的数据流向和处理步骤。

## 整体流程

```mermaid
flowchart TD
    A[用户界面] -->|创建分组请求| B[Tauri 命令处理层]
    B -->|调用服务| C[联系人分组服务层]
    C -->|执行数据库操作| D[联系人分组仓库层]
    D -->|数据库事务| E[(SQLite 数据库)]
    D -->|返回创建的分组| C
    C -->|返回分组数据| B
    B -->|返回分组结果| A
```

## 详细流程

```mermaid
sequenceDiagram
    participant User as 用户界面
    participant Commands as Tauri命令层<br>contact_group_commands.rs
    participant Service as 服务层<br>contact_group_service.rs
    participant Repo as 仓库层<br>contact_group_repository.rs
    participant DB as 数据库<br>SQLite

    User->>Commands: 调用create_contact_group<br>名称, 描述(可选)
    Commands->>Service: 调用ContactGroupService.create_group
    Service->>Repo: 检查是否存在同名分组
    Repo->>DB: 查询同名分组
    DB-->>Repo: 返回查询结果

    alt 存在同名分组
        Service-->>Commands: 返回错误(分组名已存在)
        Commands-->>User: 返回错误信息
    else 不存在同名分组
        Service->>Repo: 调用create_with_defaults<br>创建新分组
        Repo->>DB: 生成UUID
        Repo->>DB: 插入新分组记录
        DB-->>Repo: 返回创建结果
        Repo->>DB: 查询创建的分组
        DB-->>Repo: 返回分组数据
        Repo-->>Service: 返回创建的分组
        Service-->>Commands: 返回分组数据
        Commands-->>User: 返回创建结果
    end
```

## 数据流图

```mermaid
flowchart TB
    subgraph 前端
        A[用户界面] --> B[分组表单]
        B --> C[Tauri API调用]
    end

    subgraph 后端 - Tauri命令层
        C --> D[contact_group_commands.rs]
        D --> E[参数验证与处理]
    end

    subgraph 后端 - 服务层
        E --> F[ContactGroupService实例]
        F --> G[业务逻辑处理]
        G --> H[数据验证]
    end

    subgraph 后端 - 仓库层
        H --> I[ContactGroupRepository实例]
        I --> J[数据库操作]
    end

    J --> K[SQLite数据库]
    K --> L[返回数据库结果]
    L --> M[处理数据库结果]
    M --> N[返回给服务层]
    N --> O[返回给命令层]
    O --> P[返回给前端]
    P --> Q[更新UI显示]
```

## 注意事项

1. 创建分组时需要验证分组名称是否已存在，避免重复
2. 分组ID使用UUID自动生成，确保唯一性
3. 分组描述是可选的，可以为null

## 关键代码解析

### 1. 前端调用

用户在前端调用Tauri命令创建分组：

```javascript
// 前端示例代码
await invoke('create_contact_group', {
  request: {
    name: '工作',
    description: '工作相关的联系人',
  },
});
```

### 2. Tauri命令处理 (contact_group_commands.rs)

```rust
#[command]
pub fn create_contact_group(
    state: State<AppState>,
    request: CreateGroupRequest,
) -> Result<ContactGroup, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = ContactGroupService::new(pool.clone());

    service.create_group(request.name, request.description)
        .map_err(|e| format!("创建联系人组失败: {}", e))
}
```

### 3. 服务层处理 (contact_group_service.rs)

```rust
pub fn create_group(&self, name: String, description: Option<String>) -> RepositoryResult<ContactGroup> {
    // 检查是否已存在同名分组
    let existing_groups = self.repository.find_by_name(&name)?;
    if !existing_groups.is_empty() {
        return Err(RepositoryError::AlreadyExists(format!("联系人组名称 '{}' 已存在", name)));
    }

    self.repository.create_with_defaults(name, description)
}
```

### 4. 仓库层处理 (contact_group_repository.rs)

```rust
pub fn create_with_defaults(&self, name: String, description: Option<String>) -> RepositoryResult<ContactGroup> {
    let new_group = NewContactGroup {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        description,
    };

    self.create(new_group)
}

pub fn create(&self, new_group: NewContactGroup) -> RepositoryResult<ContactGroup> {
    let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

    diesel::insert_into(contact_groups::table)
        .values(&new_group)
        .execute(&mut conn)
        .map_err(RepositoryError::DatabaseError)?;

    contact_groups::table
        .filter(contact_groups::id.eq(&new_group.id))
        .first(&mut conn)
        .map_err(RepositoryError::DatabaseError)
}
```
