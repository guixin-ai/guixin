import React from 'react';
import { createBrowserRouter, Navigate, RouteObject, Outlet } from 'react-router-dom';
import GuiChatLayout from './pages/guichat';
import GuiChatChats from './pages/guichat/chats';
import GuiChatContacts from './pages/guichat/contacts';
import GuiChatResources from './pages/guichat/resources';
import GuiChatChat from './pages/chat';
import NotFoundPage from './pages/not-found';
import ErrorBoundary from './components/error-boundary';
import { ErrorHandler, LogLevel } from './utils/error-handler';

/**
 * 错误边界布局组件
 * 
 * 使用Outlet在一个错误边界内渲染子路由
 */
const ErrorBoundaryLayout = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 使用错误处理工具记录路由错误
        ErrorHandler.getInstance().handleError(error, {
          component: 'RouteErrorBoundary',
          details: errorInfo.componentStack
        }, LogLevel.ERROR);
      }}
    >
      <Outlet />
    </ErrorBoundary>
  );
};

// 创建路由配置
const routes: RouteObject[] = [
  {
    // 错误边界布局路由
    element: <ErrorBoundaryLayout />,
    children: [
      {
        // guichat主路由，包含底部导航栏和子路由
        path: '/guichat',
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
          },
        ],
      },
      {
        // 聊天详情页，显示与特定联系人的聊天记录
        path: '/chat/:chatId',
        element: <GuiChatChat />,
      },
      {
        // 根路径重定向到/guichat
        path: '/',
        element: <Navigate to="/guichat" replace />,
      },
      {
        // 处理所有未匹配的路径，重定向到主布局
        path: '*',
        element: <NotFoundPage />,
      },
    ]
  }
];

// 创建路由器
export const router = createBrowserRouter(routes);

export default router;
