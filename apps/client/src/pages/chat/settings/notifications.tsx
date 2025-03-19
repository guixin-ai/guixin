import useSettingsStore from '../../../models/routes/chat-settings.model';

const NotificationsPage = () => {
  const {
    enableNotifications,
    notificationSound,
    notificationPreview,
    toggleNotifications,
    toggleNotificationSound,
    toggleNotificationPreview,
  } = useSettingsStore();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">新消息通知</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white">接收新消息通知</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={enableNotifications}
                onChange={e => toggleNotifications(e.target.checked)}
              />
              <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>

        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white">通知声音</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationSound}
                onChange={e => toggleNotificationSound(e.target.checked)}
                disabled={!enableNotifications}
              />
              <div
                className={`w-12 h-6 ${!enableNotifications ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500`}
              ></div>
            </label>
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white">通知预览</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">在通知中显示消息内容</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationPreview}
                onChange={e => toggleNotificationPreview(e.target.checked)}
                disabled={!enableNotifications}
              />
              <div
                className={`w-12 h-6 ${!enableNotifications ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500`}
              ></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
