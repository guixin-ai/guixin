import useSettingsStore from '../../../models/routes/chat-settings.model';

const HelpPage = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">帮助与反馈</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">此处显示帮助与反馈选项</p>
      </div>
    </div>
  );
};

export default HelpPage;
