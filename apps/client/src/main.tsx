import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import App from './app';
import router from './routes';
import { initGlobalErrorHandlers } from './utils/error-handler';
import ErrorBoundary from './components/error-boundary';

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
