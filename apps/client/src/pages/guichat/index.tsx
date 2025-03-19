import { Outlet, NavLink } from 'react-router-dom';
import { MessageCircle, Users } from 'lucide-react';

const GuiChatLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      
      {/* 底部导航 */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-around">
        <NavLink
          to="/guichat/chats"
          className={({ isActive }) => `w-1/2 py-3 flex flex-col items-center justify-center ${
            isActive ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <MessageCircle size={24} />
          <span className="text-xs mt-1">微信</span>
        </NavLink>
        
        <NavLink
          to="/guichat/contacts"
          className={({ isActive }) => `w-1/2 py-3 flex flex-col items-center justify-center ${
            isActive ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Users size={24} />
          <span className="text-xs mt-1">通讯录</span>
        </NavLink>
      </div>
    </div>
  );
};

export default GuiChatLayout; 