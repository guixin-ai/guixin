import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import App from './app';
import router from './routes';
import { enableMapSet } from 'immer';
// 启用 MapSet 支持 Set 数据结构
enableMapSet();

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

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App>
      <RouterProvider router={router} />
    </App>
  </React.StrictMode>
);
