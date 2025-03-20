# 错误处理工具 (ErrorHandler)

ErrorHandler 是一个统一的错误处理工具，用于简化应用程序中的错误管理和日志记录。它采用单例模式设计，提供了全局一致的错误处理机制。

## 功能特点

- 统一的错误处理和日志记录
- 多级别日志支持 (INFO, WARN, ERROR, FATAL)
- Promise 错误处理简化
- 详细的错误上下文信息
- 全局未捕获错误监听

## 安装与初始化

在应用程序启动时初始化全局错误处理器：

```typescript
import { initGlobalErrorHandlers } from '@/utils/error-handler';

// 在应用入口点调用
initGlobalErrorHandlers();
```

## 使用指南

### 基本错误处理

```typescript
import { ErrorHandler, LogLevel } from '@/utils/error-handler';

try {
  // 可能引发错误的代码
  doSomethingRisky();
} catch (error) {
  // 处理错误
  ErrorHandler.handleError(
    error,
    {
      component: '组件名称',
      method: '方法名称',
      details: { /* 任何相关信息 */ }
    },
    LogLevel.ERROR  // 可选，默认为 ERROR
  );
}
```

### 异步错误处理

```typescript
import { ErrorHandler } from '@/utils/error-handler';

async function fetchUserData(userId: string) {
  const [userData, error] = await ErrorHandler.handlePromise(
    api.fetchUser(userId),
    {
      component: 'UserService',
      method: 'fetchUserData',
      details: { userId }
    }
  );

  if (error) {
    // 处理错误情况
    return null;
  }

  // 正常处理数据
  return userData;
}
```

### 日志级别

ErrorHandler 支持四种日志级别：

- `LogLevel.INFO`: 信息性消息，不影响功能
- `LogLevel.WARN`: 警告消息，可能存在潜在问题
- `LogLevel.ERROR`: 错误消息，影响部分功能
- `LogLevel.FATAL`: 致命错误，可能导致应用崩溃

```typescript
// 记录警告日志
ErrorHandler.handleError(
  new Error('配置项缺失'),
  { component: 'ConfigService' },
  LogLevel.WARN
);

// 记录致命错误
ErrorHandler.handleError(
  new Error('数据库连接失败'),
  { component: 'DatabaseService' },
  LogLevel.FATAL
);
```

## 实例方法 vs 静态方法

ErrorHandler 同时提供实例方法和静态方法，功能完全相同：

```typescript
// 实例方法
const errorHandler = ErrorHandler.getInstance();
errorHandler.handleError(error, context);

// 静态方法 (推荐，更简洁)
ErrorHandler.handleError(error, context);
```

## 错误上下文

提供详细的错误上下文可以帮助更快地定位和解决问题：

```typescript
ErrorHandler.handleError(error, {
  component: 'UserProfileComponent', // 组件名称
  method: 'updateProfile',           // 方法名称
  details: {                         // 任何相关的详细信息
    userId: '123',
    attemptedAction: 'update',
    formData: { /* ... */ }
  }
});
```

## 最佳实践

1. 始终提供错误上下文，特别是组件和方法名称
2. 根据错误的严重性选择适当的日志级别
3. 对于异步操作，优先使用 `handlePromise` 方法
4. 在应用入口点调用 `initGlobalErrorHandlers()` 确保捕获未处理的错误
5. 对于已知可能发生的错误，预先定义自定义错误类型 