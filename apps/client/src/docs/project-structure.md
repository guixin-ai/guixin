# 项目文件夹结构约定

## 概述

本文档描述了我们项目采用的文件夹结构和命名约定，特别是关于路由和组件的组织方式。这些约定参考了Next.js的App Router结构，并进行了适当的调整以适应我们的项目需求。

## 基本目录结构

```
/apps
  /client
    /src
      /pages        # 路由页面组件（等同于Next.js的app目录）
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

我们的路由系统基于`pages`目录，与URL路径一一对应，结构参考了Next.js的App Router。

### 路由文件命名规则

1. **特殊文件命名**

   | 文件名 | 描述 |
   |--------|------|
   | `page.tsx` | 定义路由的主页面组件 |
   | `layout.tsx` | 定义路由及其子路由的共享布局 |
   | `loading.tsx` | 可选，提供路由的加载状态 |
   | `error.tsx` | 可选，提供路由的错误处理 |
   | `not-found.tsx` | 可选，提供404页面 |

2. **路由参数**:
   - 对于包含URL参数的路由，使用方括号`[]`包裹参数名称的目录
   - 例如：`/pages/chats/[chatId]/page.tsx`对应URL `/chats/123`

3. **目录结构**:
   - 每个URL路径段对应一个目录
   - 目录内的`page.tsx`文件代表该路径的页面内容
   - 嵌套目录表示嵌套路由

### 路由结构示例

```
/pages
  /page.tsx                 # 根路由 /
  /layout.tsx               # 全局布局
  /not-found.tsx            # 全局404页面
  /chats
    /page.tsx               # /chats
    /layout.tsx             # /chats及子路由的共享布局
    /new
      /page.tsx             # /chats/new
    /[chatId]
      /page.tsx             # /chats/:chatId
      /info
        /page.tsx           # /chats/:chatId/info
  /contacts
    /page.tsx               # /contacts
    /new
      /page.tsx             # /contacts/new
    /[contactId]
      /page.tsx             # /contacts/:contactId
  /home
    /page.tsx               # /home
    /layout.tsx             # /home及子路由的共享布局
    /chats
      /page.tsx             # /home/chats
    /contacts
      /page.tsx             # /home/contacts
    /resources
      /page.tsx             # /home/resources
```

### 页面与布局组件

1. **页面组件 (`page.tsx`)**:
   - 每个路由的主要内容组件
   - 只负责渲染该路由的内容，不包含共享布局

   ```tsx
   // /pages/home/chats/page.tsx
   const ChatsPage = () => {
     return (
       <div>
         <h1>聊天列表</h1>
         {/* 聊天列表内容 */}
       </div>
     );
   };

   export default ChatsPage;
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

### 组件存放位置

1. **共置组件**:
   - 仅在特定路由中使用的组件可以放在该路由目录下的`_components`文件夹中
   - 文件夹以下划线开头表示非路由目录

   ```
   /pages
     /chats
       /_components       # 聊天相关组件
         /chat-bubble.tsx
         /message-input.tsx
       /page.tsx
   ```

2. **共享组件**:
   - 在多个路由中使用的组件应放在全局`/components`目录下
   - 可以按功能或模块进行子目录组织

## 项目组织原则

1. **关注点分离**：
   - 页面组件放在`pages`目录下的相应路由位置
   - 可复用UI组件放在`components`目录下
   - 状态管理逻辑放在`models`目录下
   - API调用相关逻辑放在`commands`目录下
   - 业务逻辑放在`services`目录下

2. **页面组件职责**：
   - 组织和布局UI
   - 连接状态管理和服务层
   - 处理用户交互
   - 管理组件局部状态

3. **布局组件职责**：
   - 提供共享UI结构
   - 管理导航和过渡
   - 维护路由间的状态持久性

## 一致性规则

为保持项目一致性，请遵循以下规则：

1. **特殊文件命名**：使用`page.tsx`、`layout.tsx`等特定文件名定义路由组件
2. **目录命名**：使用小写中划线命名法（kebab-case），例如`new-chat`
3. **参数目录**：使用方括号包围参数名，例如`[chatId]`
4. **组件文件命名**：使用小写中划线命名法（kebab-case），例如`chat-bubble.tsx`
5. **非路由目录**：以下划线开头，例如`_components`、`_utils`
6. **后端（Tauri）命名**：使用Rust风格的小写下划线命名法（snake_case）

## 依赖管理

我们使用pnpm作为包管理工具，项目组织为monorepo结构，这允许我们在保持代码分离的同时共享依赖和工具。 