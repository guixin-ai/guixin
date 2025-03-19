import { createBrowserRouter, Navigate } from 'react-router-dom';
import ChatLayout from './pages/chat';
import ChatPage from './pages/chat/chats';
import ContactsPage from './pages/chat/contacts';
import SettingsLayout from './pages/chat/settings';
import SettingsIndex from './pages/chat/settings/default';
import AppearancePage from './pages/chat/settings/appearance';
import NotificationsPage from './pages/chat/settings/notifications';
import PrivacyPage from './pages/chat/settings/privacy';
import ChatSettingsPage from './pages/chat/settings/chat';
import AccountPage from './pages/chat/settings/account';
import StoragePage from './pages/chat/settings/storage';
import HelpPage from './pages/chat/settings/help';
import AboutPage from './pages/chat/settings/about';
import OllamaPage from './pages/chat/settings/ollama';
import CreateContactPage from './pages/chat-contacts/create';
import NotFoundPage from './pages/not-found';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/chat" replace />,
  },
  {
    path: '/chat-contacts/create',
    element: <CreateContactPage />,
  },
  {
    path: '/chat',
    element: <ChatLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/chat/chats" replace />,
      },
      {
        path: 'chats',
        element: <ChatPage />,
      },
      {
        path: 'contacts',
        element: <ContactsPage />,
      },
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          {
            index: true,
            element: <SettingsIndex />,
          },
          {
            path: 'appearance',
            element: <AppearancePage />,
          },
          {
            path: 'notifications',
            element: <NotificationsPage />,
          },
          {
            path: 'privacy',
            element: <PrivacyPage />,
          },
          {
            path: 'chat',
            element: <ChatSettingsPage />,
          },
          {
            path: 'account',
            element: <AccountPage />,
          },
          {
            path: 'storage',
            element: <StoragePage />,
          },
          {
            path: 'help',
            element: <HelpPage />,
          },
          {
            path: 'about',
            element: <AboutPage />,
          },
          {
            path: 'ollama',
            element: <OllamaPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
