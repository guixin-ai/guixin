import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import App from './app';
import './index.css';
import { ErrorBoundary } from './components/error-boundary';

// 添加全局错误处理
// 捕获未处理的错误
window.addEventListener('error', event => {
  console.error('全局未捕获错误:', event.error);
  // 可以在这里添加错误上报逻辑
});

// 捕获未处理的Promise拒绝
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的Promise拒绝:', event.reason);
  // 可以在这里添加错误上报逻辑
});

// 错误回退UI组件
const ErrorFallbackUI = ({ error }: { error: Error; resetError: () => void }) => {
  // 刷新页面的函数
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col gap-4">
      <div className="text-red-500 text-xl">应用出错了</div>
      <div className="text-gray-500">{error.message}</div>
      <div className="mt-4">
        <button
          onClick={refreshPage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          刷新
        </button>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary
      fallback={(error, resetError) => <ErrorFallbackUI error={error} resetError={resetError} />}
    >
      <App>
        <RouterProvider router={router} />
      </App>
    </ErrorBoundary>
  </React.StrictMode>
);
