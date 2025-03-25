# Loader数据格式规范

## 概述

本文档规定了项目中所有路由加载器（Route Loader）应遵循的统一数据返回格式规范。统一的数据结构有助于提高前端页面组件复用性，简化错误处理，并保持项目整体一致性。

## 基本数据结构

所有Loader返回的数据必须遵循以下基本结构：

```typescript
interface LoaderBaseResponse {
  success: boolean;              // 操作是否成功
  error?: string;                // 错误信息（仅在success为false时存在）
  [dataKey: string]: any;        // 业务数据（如：chats, resources, contacts等）
}
```

## 返回格式规范

### 成功响应格式

使用React Router的`data`函数包装成功响应数据：

```typescript
import { data } from 'react-router-dom';

// 成功响应示例
return data({
  success: true,
  [dataKey]: dataValue            // 例如: chats: chatItems
}, { status: 200 });              // HTTP状态码
```

### 错误响应格式

错误响应也必须使用`data`函数包装，并包含错误信息：

```typescript
// 错误响应示例
return data({
  success: false,
  error: errorMessage,            // 描述错误的文本信息
  [dataKey]: []                   // 提供空数据作为默认值
}, { status: errorStatusCode });  // 相应的HTTP错误状态码
```

## 常见错误状态码

- `400` - 请求参数错误（如ID缺失）
- `404` - 资源不存在
- `500` - 服务器内部错误（如API调用失败）

## 错误处理规范

1. **详细错误信息**: 错误信息应具体、明确，便于调试
2. **默认空数据**: 即使发生错误，也应返回预期数据结构的空值（如`[]`或`null`）
3. **错误类型转换**: 始终将错误对象转换为字符串信息：
   ```typescript
   error: `操作失败: ${error instanceof Error ? error.message : String(error)}`
   ```

## 前端使用示例

组件中使用Loader数据的标准方式：

```typescript
// 类型定义
interface SomeLoaderData {
  success: boolean;
  error?: string;
  items: Item[];
}

// 在组件中使用
const data = useLoaderData<SomeLoaderData>();

// 从loader数据中提取
const items = data.success ? data.items : [];
const hasError = !data.success;
const errorMessage = data.error;

// 错误处理UI
{hasError && (
  <div className="error-container">
    <p>{errorMessage || '操作失败'}</p>
  </div>
)}
```

## 示例实现

以下是一个典型的Loader实现示例：

```typescript
import { data } from 'react-router-dom';
import { someCommands } from '../commands/some.commands';

export const someLoader = async ({ params }) => {
  const { id } = params;

  // 参数验证
  if (!id) {
    return data({
      success: false,
      error: 'ID不能为空',
      items: []
    }, { status: 400 });
  }

  try {
    // 调用指令层获取数据
    const response = await someCommands.getSomeItems(id);
    
    // 数据转换
    const items = response.map(item => ({
      // 转换逻辑
    }));

    // 返回成功响应
    return data({ 
      success: true,
      items
    }, { status: 200 });
  } catch (error) {
    // 错误处理
    console.error('操作失败:', error);
    
    // 返回错误响应
    return data({
      success: false,
      error: `操作失败: ${error instanceof Error ? error.message : String(error)}`,
      items: [] // 提供空数据作为默认值
    }, { status: 500 });
  }
};
```

## 特殊情况处理

### 多数据类型返回

某些加载器可能需要返回多种数据结构：

```typescript
// 定义类型联合
export type ComplexLoaderData = 
  | SuccessResponse 
  | ErrorTypeAResponse 
  | ErrorTypeBResponse;

// 使用类型断言保证类型安全
return data({
  success: true,
  mainData: data,
  additionalData: extra
} satisfies SuccessResponse, { status: 200 });
```

### 条件数据加载

当需要加载多个相关数据时，保持优雅的错误处理：

```typescript
// 主数据加载成功，但附加数据加载失败
return data({
  success: true,          // 主操作仍视为成功
  mainData: mainData,
  secondaryError: `加载次要数据失败: ${errorMessage}`
}, { status: 200 });
```

## 结语

遵循统一的Loader数据格式规范可以大幅提升代码质量和开发效率。在实现新的路由加载器时，应当严格遵循本文档中定义的格式规范，确保前端页面能够一致地处理各种数据和错误情况。 