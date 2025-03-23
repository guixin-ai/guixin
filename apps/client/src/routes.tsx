import React from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import GuiChatLayout from './pages/home';
import GuiChatChats from './pages/home/chats';
import GuiChatContacts from './pages/home/contacts';
import GuiChatResources from './pages/home/resources';
import GuiChatResourceDetail from './pages/resources/[resourceId]';
import GuiChatChat from './pages/chats/[chatId]';
import NotFoundPage from './pages/not-found';
import RouteErrorBoundary from './components/route-error-boundary';
// 导入 loaders
import { resourcesLoader, resourceDetailLoader } from './loaders';

// 创建路由配置
const routes: RouteObject[] = [
  {
    // 根路由
    path: '/',
    // 为根路由设置错误边界，捕获所有子路由的错误
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        // 主路由，包含底部导航栏和子路由
        path: 'home',
        element: <GuiChatLayout />,
        children: [
          {
            // 默认显示聊天列表页
            index: true,
            element: <GuiChatChats />,
          },
          {
            // 聊天列表页，显示所有聊天会话
            path: 'chats',
            element: <GuiChatChats />,
          },
          {
            // 联系人列表页，显示所有联系人
            path: 'contacts',
            element: <GuiChatContacts />,
          },
          {
            // 资源库页面，显示所有资源
            path: 'resources',
            element: <GuiChatResources />,
            // 使用loader加载资源数据
            loader: resourcesLoader,
          },
        ],
      },
      {
        // 资源详情页面
        path: 'resources/:resourceId',
        element: <GuiChatResourceDetail />,
        loader: resourceDetailLoader,
      },
      {
        // 聊天详情页，显示与特定联系人的聊天记录
        path: 'chats/:chatId',
        element: <GuiChatChat />,
      },
      {
        // 处理所有未匹配的路径
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

// 创建路由器
export const router = createBrowserRouter(routes);

export default router;
