import { ReactNode } from 'react';
import { Toaster } from 'sonner';

// 定义 App 组件的属性类型
interface AppProps {
  children: ReactNode;
}

function App({ children }: AppProps) {
  // 用户已加载且无错误，渲染应用内容
  return (
    <>
      <Toaster richColors />
      {children}
    </>
  );
}

export default App;
