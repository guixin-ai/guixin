import useSettingsStore from '../../../models/routes/chat-settings.model';

const AboutPage = () => {
  const { resetSettings } = useSettingsStore();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">关于</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 mb-6">此处显示应用信息</p>
        <button
          onClick={resetSettings}
          className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:shadow-md transition-all"
        >
          重置所有设置
        </button>
      </div>
    </div>
  );
};

export default AboutPage;
