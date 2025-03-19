import {
  User,
  Bell,
  Shield,
  MessageSquare,
  HardDrive,
  Palette,
  HelpCircle,
  Info,
  Server,
} from 'lucide-react';
import useSettingsStore, { settingsCategories } from '../../../models/routes/chat-settings.model';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const SettingsLayout = () => {
  const { activeCategory, setActiveCategory } = useSettingsStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 根据当前URL路径设置活动分类
  useEffect(() => {
    const path = location.pathname;
    const categoryId = path.split('/').pop();

    // 检查路径是否有效并对应于设置分类
    if (categoryId && settingsCategories.some(cat => cat.id === categoryId)) {
      setActiveCategory(categoryId);
    }
  }, [location.pathname, setActiveCategory]);

  // 设置分类图标映射
  const categoryIcons = {
    account: <User size={20} />,
    notifications: <Bell size={20} />,
    privacy: <Shield size={20} />,
    chat: <MessageSquare size={20} />,
    storage: <HardDrive size={20} />,
    appearance: <Palette size={20} />,
    help: <HelpCircle size={20} />,
    about: <Info size={20} />,
    ollama: <Server size={20} />,
  };

  // 处理分类选择，同时导航到对应路由
  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    navigate(`/chat/settings/${categoryId}`);
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* 设置分类列表 */}
      <div className="w-72 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-100 dark:border-gray-700 shadow-sm">
        {settingsCategories.map(category => (
          <div
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`flex items-center p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${activeCategory === category.id ? 'bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500' : ''}`}
          >
            <div
              className={`mr-3 ${activeCategory === category.id ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {categoryIcons[category.id as keyof typeof categoryIcons]}
            </div>
            <span
              className={`font-medium ${activeCategory === category.id ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}
            >
              {category.name}
            </span>
          </div>
        ))}
      </div>

      {/* 设置详情 - 使用 Outlet 渲染子路由 */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsLayout;
