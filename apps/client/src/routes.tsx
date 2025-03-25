import React from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import GuiChatLayout from './pages/home/layout';
import GuiChatChats from './pages/home/chats';
import GuiChatContacts from './pages/home/contacts';
import GuiChatResources from './pages/home/resources';
import GuiChatResourceDetail from './pages/resources/[resourceId]';
import NewTextResourcePage from './pages/resources/new-text';
import GuiChatChat from './pages/chats/[chatId]/page';
import ChatInfoPage from './pages/chats/[chatId]/info';
import NewChatPage from './pages/chats/new';
import NewContactPage from './pages/contacts/new';
import ContactDetailPage from './pages/contacts/[contactId]';
import NotFoundPage from './pages/not-found';
import RouteErrorBoundary from './components/route-error-boundary';
// 导入 loaders
import { 
  resourcesLoader, 
  resourceDetailLoader,
  contactsLoader,
  contactDetailLoader,
  newChatLoader,
  chatDetailLoader,
  chatsLoader
} from './loaders';
// 导入 actions
import { 
  createTextResourceAction, 
  uploadImageResourceAction,
  deleteResourceAction 
} from './actions/resource.actions';
import {
  createContactAction,
  deleteContactAction
} from './actions/contact.actions';
import {
  createGroupChatAction,
  sendChatMessageAction
} from './actions/chat.actions';

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
            loader: chatsLoader,
          },
          {
            // 聊天列表页，显示所有聊天会话
            path: 'chats',
            element: <GuiChatChats />,
            loader: chatsLoader,
          },
          {
            // 联系人列表页，显示所有联系人
            path: 'contacts',
            element: <GuiChatContacts />,
            // 使用loader加载联系人数据
            loader: contactsLoader,
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
        // 添加联系人页面
        path: 'contacts/new',
        element: <NewContactPage />,
      },
      {
        // 联系人详情页面
        path: 'contacts/:contactId',
        element: <ContactDetailPage />,
        loader: contactDetailLoader,
      },
      {
        // 添加文本资源页面 - 不再包含action，改用API路由处理
        path: 'resources/new-text',
        element: <NewTextResourcePage />,
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
        loader: chatDetailLoader,
      },
      {
        // 聊天详情信息页面
        path: 'chats/:chatId/info',
        element: <ChatInfoPage />,
        loader: chatDetailLoader,
      },
      {
        // 新建聊天页面
        path: 'chats/new',
        element: <NewChatPage />,
        loader: newChatLoader,
      },
      // API路由 - 用于处理资源相关操作
      {
        path: 'api/resources',
        children: [
          {
            path: 'create-text',
            action: createTextResourceAction,
          },
          {
            path: 'upload-image',
            action: uploadImageResourceAction,
          },
          {
            path: 'delete',
            action: deleteResourceAction,
          },
        ],
      },
      // API路由 - 用于处理联系人相关操作
      {
        path: 'api/contacts',
        children: [
          {
            path: 'create',
            action: createContactAction,
          },
          {
            path: 'delete',
            action: deleteContactAction,
          },
        ],
      },
      // API路由 - 用于处理聊天相关操作
      {
        path: 'api/chats',
        children: [
          {
            path: 'create-group',
            action: createGroupChatAction,
          },
          {
            path: 'send-message',
            action: sendChatMessageAction,
          },
        ],
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
