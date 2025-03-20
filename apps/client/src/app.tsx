import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useUser } from './models/user.model';
import { useApp } from './models/app.model';

// 定义 App 组件的属性类型
interface AppProps {
  children: ReactNode;
}

function App({ children }: AppProps) {
  const { fetchCurrentUser } = useUser();
  const { initialize } = useApp();
  const [loading, setLoading] = useState(true);
  
  // 在应用加载时初始化基础数据
  useEffect(() => {
    const initializeAppData = async () => {
      try {
        setLoading(true);
        
        // 初始化应用
        await initialize();
        
        // 获取当前用户
        await fetchCurrentUser();
        
        console.log('应用基础数据初始化完成');
        setLoading(false);
      } catch (error) {
        console.error('应用基础数据初始化失败:', error);
        setLoading(false);
      }
    };
    
    initializeAppData();
  }, [initialize, fetchCurrentUser]);
  
  // 如果正在加载，显示加载界面
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">应用加载中...</p>
        </div>
      </div>
    );
  }
  
  // 数据加载完成，渲染应用内容
  return (
    <>
      <Toaster richColors />
      {children}
    </>
  );
}

export default App;
