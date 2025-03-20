import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import DelayedLoading from './components/delayed-loading';
import { useAppStore } from './models/app.model';

// 定义 App 组件的属性类型
interface AppProps {
  children: ReactNode;
}

function App({ children }: AppProps) {
  const { initialize } = useAppStore();
  const [loading, setLoading] = useState(true);

  // 在应用加载时初始化基础数据
  useEffect(() => {
    const initializeAppData = async () => {
      try {
        setLoading(true);

        // 初始化应用
        await initialize();

        console.log('应用基础数据初始化完成');
        setLoading(false);
      } catch (error) {
        console.error('应用基础数据初始化失败:', error);
        setLoading(false);
      }
    };

    initializeAppData();
  }, [initialize]);

  // 使用DelayedLoading组件来处理加载状态，避免闪烁
  return (
    <>
      <Toaster richColors />
      <DelayedLoading
        loading={loading}
        delay={300} // 300毫秒的延迟，可根据需要调整
      >
        {children}
      </DelayedLoading>
    </>
  );
}

export default App;
