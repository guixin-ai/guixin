import { Outlet, NavLink } from 'react-router-dom';
import { MessageCircle, Users, Settings } from 'lucide-react';

export const ChatLayout = () => {
  return (
    <div data-testid="chat-layout" className="flex h-screen bg-gray-100 overflow-hidden">
      {/* 侧边栏 */}
      <div className="w-16 bg-gray-800 flex flex-col items-center py-4">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white mb-8">
          我
        </div>
        <NavLink
          to="/chat/chats"
          className={({ isActive }: { isActive: boolean }) =>
            `w-10 h-10 rounded-full flex items-center justify-center mb-4 cursor-pointer ${
              isActive ? 'bg-white' : 'bg-gray-700'
            }`
          }
        >
          {({ isActive }: { isActive: boolean }) => (
            <MessageCircle className={isActive ? 'text-gray-800' : 'text-gray-300'} size={20} />
          )}
        </NavLink>
        <NavLink
          data-testid="contacts-link"
          to="/chat/contacts"
          className={({ isActive }: { isActive: boolean }) =>
            `w-10 h-10 rounded-full flex items-center justify-center mb-4 cursor-pointer ${
              isActive ? 'bg-white' : 'bg-gray-700'
            }`
          }
        >
          {({ isActive }: { isActive: boolean }) => (
            <Users className={isActive ? 'text-gray-800' : 'text-gray-300'} size={20} />
          )}
        </NavLink>
        <NavLink
          to="/chat/settings"
          className={({ isActive }: { isActive: boolean }) =>
            `w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
              isActive ? 'bg-white' : 'bg-gray-700'
            }`
          }
        >
          {({ isActive }: { isActive: boolean }) => (
            <Settings className={isActive ? 'text-gray-800' : 'text-gray-300'} size={20} />
          )}
        </NavLink>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default ChatLayout;
