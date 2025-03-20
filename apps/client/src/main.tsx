import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import App from './app';
import router from './routes';
import { enableMapSet } from 'immer';
import { initGlobalErrorHandlers } from './utils/error-handler';
import ErrorBoundary from './components/error-boundary';

// 启用 MapSet 支持 Set 数据结构
enableMapSet();

// 初始化全局错误处理
initGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('应用根组件错误:', error, errorInfo);
      }}
    >
      <App>
        <RouterProvider router={router} />
      </App>
    </ErrorBoundary>
  </React.StrictMode>
);
