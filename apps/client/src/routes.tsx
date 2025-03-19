import { createBrowserRouter, Navigate } from 'react-router-dom';
import GuiChatLayout from './pages/guichat';
import GuiChatChats from './pages/guichat/chats';
import GuiChatContacts from './pages/guichat/contacts';
import GuiChatChat from './pages/chat';
import GuiChatNewChat from './pages/new-chat';
import GuiChatCreateFriend from './pages/create-friend';
import GuiChatContactDetail from './pages/contact-detail';
import NotFoundPage from './pages/not-found';

export const router = createBrowserRouter([
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
    ],
  },
  {
    // 聊天详情页，显示与特定联系人的聊天记录
    path: '/chat/:chatId',
    element: <GuiChatChat />,
  },
  {
    // 新建聊天页，用于选择联系人开始新聊天
    path: '/new-chat',
    element: <GuiChatNewChat />,
  },
  {
    // 创建AI朋友页，用于创建新的AI联系人
    path: '/create-friend',
    element: <GuiChatCreateFriend />,
  },
  {
    // 联系人详情页，显示联系人资料
    path: '/contact/:contactId',
    element: <GuiChatContactDetail />,
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
]);

export default router;
