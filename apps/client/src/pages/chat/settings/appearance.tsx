import { Sun, Moon, ChevronRight } from 'lucide-react';
import useSettingsStore from '../../../models/routes/chat-settings.model';

const AppearancePage = () => {
  const { theme, fontSize, chatBg, setTheme, setFontSize, setChatBg } = useSettingsStore();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">外观</h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white">主题</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">当前: {theme}</p>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setTheme('浅色')}
                className={`p-3 rounded-full mr-3 transition-all ${theme === '浅色' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Sun size={22} />
              </button>
              <button
                onClick={() => setTheme('深色')}
                className={`p-3 rounded-full transition-all ${theme === '深色' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Moon size={22} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-medium text-gray-800 dark:text-white mb-4">字体大小</h3>
          <div className="flex">
            {['小', '中', '大'].map(size => (
              <button
                key={size}
                onClick={() => setFontSize(size as any)}
                className={`px-5 py-2 rounded-full mr-3 transition-all ${
                  fontSize === size
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-medium text-gray-800 dark:text-white mb-4">聊天背景</h3>
          <div className="grid grid-cols-3 gap-4">
            {['默认', '纯色', '自定义图片'].map(bg => (
              <div
                key={bg}
                onClick={() => setChatBg(bg as any)}
                className={`p-4 rounded-xl text-center cursor-pointer transition-all ${
                  chatBg === bg
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {bg}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white">消息气泡样式</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">自定义聊天气泡的外观</p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white">界面语言</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">当前: 简体中文</p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearancePage;
