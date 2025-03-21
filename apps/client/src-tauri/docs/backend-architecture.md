# 后端架构分层设计文档

## 概述

本文档描述了我们项目中采用的后端架构分层设计，明确每一层的职责范围、应该做什么和不应该做什么，以便团队成员在开发过程中能够遵循一致的架构原则。

## 分层架构图

```
+------------------------+
|       指令层           |  处理请求、参数验证、权限检查
|   (Command Layer)      |
+------------------------+
           |
           v
+------------------------+
|       服务层           |  业务逻辑、事务管理、领域规则
|   (Service Layer)      |
+------------------------+
           |
           v
+------------------------+
|       仓储层           |  数据访问、查询实现、持久化
|  (Repository Layer)    |
+------------------------+
           |
           v
+------------------------+
|       数据库           |
|      (Database)        |
+------------------------+
```

## 详细分层说明

### 1. 指令层 (Command Layer)

#### 职责：
- 接收并解析前端/UI请求
- 参数验证和处理
- 用户身份验证和权限检查
- 获取当前用户上下文（如用户ID）
- 调用相应的服务层方法
- 异常处理和响应格式化
- 日志记录

#### 应该做的：
- 检查请求参数的合法性
- 提取当前用户信息并传递给服务层
- 对请求结果进行适当的格式化
- 封装错误处理和异常响应

#### 不应该做的：
- 不应包含业务逻辑
- 不应直接访问数据库或仓储层
- 不应处理复杂的数据转换
- 不应实现事务控制

#### 示例代码：
```rust
// 指令层示例
pub async fn create_chat(
    state: State<'_, AppState>,
    user_id: String,
    request: ChatCreateRequest,
) -> Result<ChatResponse> {
    // 参数验证
    if request.name.is_empty() {
        return Err(ErrorKind::InvalidInput("聊天名称不能为空").into());
    }
    
    // 调用服务层
    let chat = state.chat_service.create_chat(user_id, request.name, request.participants)?;
    
    // 响应转换
    Ok(ChatResponse::from(chat))
}
```

### 2. 服务层 (Service Layer)

#### 职责：
- 实现核心业务逻辑
- 协调多个仓储操作
- 实现事务管理和原子性操作
- 业务规则验证
- 领域模型的转换和处理
- 确保数据一致性

#### 应该做的：
- 实现完整的业务流程
- 通过事务确保多个操作的原子性
- 处理复杂的业务规则和限制
- 组合多个仓储方法实现完整功能
- 转换数据结构以适应业务需求

#### 不应该做的：
- 不应直接处理HTTP请求和响应
- 不应包含SQL查询或直接数据库操作
- 不应关注用户界面或前端展示逻辑
- 不应处理认证逻辑（但可以处理授权逻辑）

#### 示例代码：
```rust
// 服务层示例
pub fn create_chat(&self, user_id: String, name: String, participant_ids: Vec<String>) -> Result<Chat> {
    // 业务规则验证
    if participant_ids.len() > 100 {
        return Err(ErrorKind::BusinessRule("聊天参与者不能超过100人").into());
    }
    
    // 使用事务确保原子性
    self.db.transaction(|conn| {
        // 创建聊天
        let chat = self.chat_repository.create(conn, &name)?;
        
        // 添加参与者
        for participant_id in participant_ids {
            self.participant_repository.add_to_chat(conn, &chat.id, &participant_id)?;
        }
        
        // 添加创建者自己
        self.participant_repository.add_to_chat(conn, &chat.id, &user_id)?;
        
        Ok(chat)
    })
}
```

### 3. 仓储层 (Repository Layer)

#### 职责：
- 封装所有数据库访问逻辑
- 实现CRUD基本操作
- 执行复杂查询（包括联表查询）
- 数据映射和ORM操作
- 提供持久化机制

#### 应该做的：
- 实现所有数据库操作，包括复杂的联表查询
- 处理数据库实体到领域模型的映射
- 优化查询性能
- 处理数据库特定的异常

#### 不应该做的：
- 不应包含业务逻辑
- 不应实现事务控制（应由服务层控制）
- 不应处理用户权限或身份验证
- 不应依赖于其他仓储实现

#### 示例代码：
```rust
// 仓储层示例
pub fn get_chat_with_participants(&self, conn: &mut DbConn, chat_id: &str) -> Result<(Chat, Vec<Participant>)> {
    // 基本查询
    let chat = self.get_by_id(conn, chat_id)?;
    
    // 联表查询获取参与者
    let participants = chat_participants::table
        .inner_join(users::table)
        .filter(chat_participants::chat_id.eq(chat_id))
        .select((
            chat_participants::all_columns,
            users::all_columns,
        ))
        .load::<(ChatParticipant, User)>(conn)?
        .into_iter()
        .map(|(participant, user)| Participant::from_entities(participant, user))
        .collect();
    
    Ok((chat, participants))
}
```

## 跨层通信原则

1. **单向依赖**：上层可以依赖下层，但下层不能依赖上层
2. **接口分离**：各层之间通过清晰的接口进行通信
3. **数据转换**：每一层可以有自己的数据模型，在层与层之间进行转换
4. **错误处理**：每一层应该处理自己范围内的错误，并以适当方式向上传递

## 最佳实践

1. **保持层次清晰**：避免跨层调用，如从指令层直接调用仓储层
2. **单一职责**：每个组件只负责一个功能或一组相关功能
3. **测试友好**：设计时考虑单元测试的便利性，避免复杂依赖
4. **依赖注入**：使用依赖注入来降低组件间耦合
5. **避免巨石服务**：将大型服务拆分为多个专注的小服务
6. **文档化**：为重要接口和组件编写文档

## 结论

遵循这种分层架构设计，可以使我们的代码更加模块化、可测试和可维护。虽然在某些场景下可能需要灵活处理，但总体上应该尊重这些分层原则，使系统保持良好的结构和清晰的责任划分。 