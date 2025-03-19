import useSettingsStore from '../../../models/routes/chat-settings.model';

const StoragePage = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">存储</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">此处显示存储设置</p>
      </div>
    </div>
  );
};

export default StoragePage;
