# 项目文件夹结构约定

## 概述

本文档描述了我们项目采用的文件夹结构和命名约定，特别是关于路由和组件的组织方式。这些约定部分参考了Next.js的App Router结构，并根据我们项目的实际需求进行了调整。

## 基本目录结构

```
/apps
  /client
    /src
      /pages        # 路由页面组件
      /components   # 可复用组件
      /models       # 状态管理
      /services     # 服务层
      /commands     # API调用
      /utils        # 工具函数
      /hooks        # 自定义钩子
      /types        # TypeScript类型
      /styles       # 样式文件
      /assets       # 静态资源
      /constants    # 常量定义
      /converters   # 数据转换函数
      /docs         # 项目文档
```

## 路由约定

我们的路由系统基于`pages`目录，与URL路径一一对应。路由配置在`routes.tsx`文件中定义。

### 路由文件命名规则

1. **特殊文件命名**

   | 文件名 | 描述 |
   |--------|------|
   | `page.tsx` | 定义路由的主页面组件，必须使用在参数目录内 |
   | `layout.tsx` | 定义路由及其子路由的共享布局 |
   | `[param].tsx` | 表示包含参数的路由 |

2. **路由参数命名**:
   - 对于包含URL参数的路由，我们有两种方式：
     - 方式一：使用方括号`[]`包裹参数名称的目录，内部使用`page.tsx`（注意：不能使用`index.tsx`）
       - 例如：`/pages/chats/[chatId]/page.tsx`
     - 方式二：直接使用方括号命名文件
       - 例如：`/pages/resources/[resourceId].tsx`

3. **文件结构**:
   - 可以使用文件夹对应URL路径段，文件夹内使用`page.tsx`
   - 也可以直接使用描述性文件名如`new.tsx`对应路由`/new`

### 当前项目的路由结构

```
/pages
  /not-found.tsx           # 全局404页面 (*路径)
  /home
    /layout.tsx            # /home及子路由的共享布局
    /chats.tsx             # /home/chats
    /contacts.tsx          # /home/contacts
    /resources.tsx         # /home/resources
  /chats
    /[chatId]
      /page.tsx            # /chats/:chatId
      /info.tsx            # /chats/:chatId/info
    /new.tsx               # /chats/new
  /contacts
    /[contactId].tsx       # /contacts/:contactId
    /new.tsx               # /contacts/new
  /resources
    /[resourceId].tsx      # /resources/:resourceId
    /new-text.tsx          # /resources/new-text
```

### 路由配置示例

在`routes.tsx`中，我们使用React Router来定义路由映射：

```tsx
const routes: RouteObject[] = [
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: <GuiChatLayout />,  // 使用layout.tsx作为布局组件
        children: [
          {
            index: true,
            element: <GuiChatChats />,
          },
          {
            path: 'chats',
            element: <GuiChatChats />,
          },
          // 其他子路由...
        ],
      },
      {
        path: 'chats/:chatId',
        element: <GuiChatChat />,    // 使用page.tsx作为页面组件
        loader: chatDetailLoader,
      },
      // 其他路由配置...
    ],
  },
];
```

### 页面与布局组件

1. **页面组件 (`page.tsx` 或同级的路由文件)**:
   - 每个路由的主要内容组件
   - 专注于渲染该路由的内容

   ```tsx
   // /pages/chats/[chatId]/page.tsx
   const ChatPage = () => {
     return (
       <div>
         <h1>聊天详情</h1>
         {/* 聊天内容 */}
       </div>
     );
   };

   export default ChatPage;
   ```

2. **布局组件 (`layout.tsx`)**:
   - 定义该路由及其所有子路由的共享布局
   - 使用`<Outlet />`作为子组件渲染位置

   ```tsx
   // /pages/home/layout.tsx
   import { Outlet } from 'react-router-dom';
   import BottomNavigation from '@/components/bottom-navigation';

   function HomeLayout() {
     return (
       <div className="flex flex-col h-full">
         <main className="flex-1 overflow-y-auto">
           <Outlet /> {/* 子路由内容渲染在这里 */}
         </main>
         <BottomNavigation />
       </div>
     );
   }

   export default HomeLayout;
   ```

## 灵活性与一致性

我们的项目结构提供了灵活性，同时保持一致的组织方式：

1. **文件命名要求**:
   - 参数目录内必须使用`page.tsx`，不能使用`index.tsx`
   - 对于单个页面，可以直接使用描述性名称（如`new.tsx`）
   - 参数路由可以用目录+内部页面的方式，也可以直接用参数文件名

2. **结构一致性**:
   - 尽管命名灵活，但应保持结构的一致性
   - 特定类型的路由应使用统一的命名方式
   - 布局组件应始终命名为`layout.tsx`

## 项目组织原则

1. **关注点分离**:
   - 页面组件放在`pages`目录下的相应路由位置
   - 可复用UI组件放在`components`目录下
   - 状态管理逻辑放在`models`目录下
   - API调用相关逻辑放在`commands`目录下
   - 业务逻辑放在`services`目录下

2. **页面组件职责**:
   - 组织和布局UI
   - 连接状态管理和服务层
   - 处理用户交互
   - 管理组件局部状态

3. **布局组件职责**:
   - 提供共享UI结构
   - 管理导航和过渡
   - 维护路由间的状态持久性

## 目录划分建议

1. **特定功能相关组件**:
   - 可以在特定路由目录下创建`_components`文件夹
   - 以下划线开头表示非路由目录

   ```
   /pages
     /chats
       /_components       # 聊天相关组件
         /chat-bubble.tsx
         /message-input.tsx
   ```

2. **共享组件**:
   - 在多个路由中使用的组件应放在全局`/components`目录下
   - 可以按功能或模块进行子目录组织

## 一致性规则

为保持项目一致性，请遵循以下规则：

1. **文件命名**:
   - 使用小写中划线命名法（kebab-case），例如`new-text.tsx`
   - 参数文件或目录使用方括号包围，例如`[chatId]`
   - 布局组件统一使用`layout.tsx`命名
   - 参数目录中的页面组件必须使用`page.tsx`命名

2. **路由组织**:
   - 普通目录下的主页面可以使用描述性名称（如`new.tsx`）
   - 同类型的路由页面应使用一致的命名方式
   - 参数路由在同一应用中应保持一致的组织方式

3. **后端命名**:
   - 后端（Tauri）使用Rust风格的小写下划线命名法（snake_case）

## 依赖管理

我们使用pnpm作为包管理工具，项目组织为monorepo结构，这允许我们在保持代码分离的同时共享依赖和工具。 