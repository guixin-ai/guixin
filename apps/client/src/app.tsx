import { ReactNode, useEffect } from 'react';
import { Toaster } from 'sonner';
import { useUserStore } from './models/user.model';
import { useOllamaStore } from './models/routes/chat-settings-ollama.model';

// 定义 App 组件的属性类型
interface AppProps {
  children: ReactNode;
}

function App({ children }: AppProps) {
  const { currentUser, loading: userLoading, error: userError, fetchCurrentUser } = useUserStore();
  const { loadModels } = useOllamaStore();

  // 应用启动时获取当前用户信息并初始化Ollama状态
  useEffect(() => {
    // 获取当前用户信息
    fetchCurrentUser();

    // 检查Ollama服务状态并加载模型
    loadModels().catch(err => {
      console.error('加载Ollama模型失败:', err);
    });
  }, [fetchCurrentUser, loadModels]);

  // 如果正在加载，显示加载状态
  if (!currentUser || userLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 如果发生错误，显示错误信息
  if (userError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center flex-col gap-4">
        <div className="text-red-500 text-xl">应用初始化失败</div>
        <div className="text-gray-500">{userError}</div>
        <div className="text-sm text-gray-400">请检查应用状态或联系管理员</div>
      </div>
    );
  }

  // 用户已加载且无错误，渲染应用内容
  return (
    <>
      <Toaster richColors />
      {children}
    </>
  );
}

export default App;
