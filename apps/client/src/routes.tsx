import React from 'react';
import { createBrowserRouter, Navigate, RouteObject, Outlet } from 'react-router-dom';
import GuiChatLayout from './pages/home';
import GuiChatChats from './pages/home/chats';
import GuiChatContacts from './pages/home/contacts';
import GuiChatResources from './pages/home/resources';
import GuiChatResourceDetail from './pages/resources/[resourceId]';
import GuiChatChat from './pages/chats/[chatId]';
import NotFoundPage from './pages/not-found';
import ErrorBoundary from './components/error-boundary';
import { ErrorHandler, LogLevel } from './utils/error-handler';
import { resourceService } from './services/resource.service';
import { convertFileSrc } from '@tauri-apps/api/core';
import { appDataDir, join } from '@tauri-apps/api/path';

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
        ErrorHandler.getInstance().handleError(
          error,
          {
            component: 'RouteErrorBoundary',
            details: errorInfo.componentStack,
          },
          LogLevel.ERROR
        );
      }}
    >
      <Outlet />
    </ErrorBoundary>
  );
};

// 资源页面的数据加载器
const resourcesLoader = async () => {
  try {
    // 获取资源列表
    const response = await resourceService.getResources();

    // 处理URL拼接
    const processedResources = await Promise.all(
      response.resources.map(async resource => {
        // 获取应用数据目录
        const appData = await appDataDir();
        // 构建完整路径（appData目录 + 相对路径）
        const fullPath = await join(appData, resource.url);
        // 转换为asset协议URL
        const assetUrl = convertFileSrc(fullPath);

        // 返回处理后的资源
        return {
          ...resource,
          url: assetUrl,
        };
      })
    );

    return { resources: processedResources };
  } catch (error) {
    console.error('加载资源列表失败:', error);
    return { resources: [], error: '加载资源失败' };
  }
};

// 资源详情加载器
const resourceDetailLoader = async ({ params }: { params: { resourceId?: string } }) => {
  const { resourceId } = params;

  if (!resourceId) {
    return { resource: null, error: '资源ID不能为空' };
  }

  try {
    const resource = await resourceService.getResourceDetails(resourceId);

    // 处理URL拼接
    const appData = await appDataDir();
    const fullPath = await join(appData, resource.url);
    const assetUrl = convertFileSrc(fullPath);

    return {
      resource: {
        ...resource,
        url: assetUrl,
      },
    };
  } catch (error) {
    console.error('获取资源详情失败:', error);
    return { resource: null, error: '获取资源详情失败' };
  }
};

// 创建路由配置
const routes: RouteObject[] = [
  {
    // 错误边界布局路由
    element: <ErrorBoundaryLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/home" replace />,
      },
      {
        // guichat主路由，包含底部导航栏和子路由
        path: '/home',
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
        path: '/resources/:resourceId',
        element: <GuiChatResourceDetail />,
        loader: resourceDetailLoader,
      },
      {
        // 聊天详情页，显示与特定联系人的聊天记录
        path: '/chats/:chatId',
        element: <GuiChatChat />,
      },
      {
        // 处理所有未匹配的路径，重定向到主布局
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

// 创建路由器
export const router = createBrowserRouter(routes);

export default router;
