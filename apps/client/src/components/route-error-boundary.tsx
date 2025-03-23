import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

/**
 * 路由错误边界组件
 * 
 * 专门用于处理React Router路由错误，使用useRouteError获取错误信息
 */
const RouteErrorBoundary = () => {
  // 使用路由错误hook获取错误信息
  const error = useRouteError();
  const navigate = useNavigate();

  // 返回上一页
  const handleGoBack = () => {
    navigate(-1);
  };

  // 刷新页面
  const handleRefresh = () => {
    window.location.reload();
  };

  // 解析错误信息
  let errorTitle = '出现错误';
  let errorMessage = '应用程序发生了未知错误，请尝试刷新页面或返回上一级页面。';
  let errorDetails = '';

  // 处理路由错误响应
  if (isRouteErrorResponse(error)) {
    // 处理路由错误响应（如404、500等）
    errorTitle = `错误 ${error.status}`;
    errorMessage = error.statusText || errorMessage;
    if (error.data) {
      if (typeof error.data === 'string') {
        errorDetails = error.data;
      } else {
        try {
          errorDetails = JSON.stringify(error.data, null, 2);
        } catch {
          errorDetails = '无法显示错误详情';
        }
      }
    }
  } else if (error instanceof Error) {
    // 处理一般JavaScript错误
    errorTitle = error.name || '错误';
    errorMessage = error.message || errorMessage;
    errorDetails = error.stack || '';
  } else if (typeof error === 'string') {
    // 处理字符串错误
    errorMessage = error;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex items-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            {errorTitle}
          </h2>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {errorMessage}
        </p>
        
        {errorDetails && (
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-auto max-h-60 mb-4">
            <p className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {errorDetails}
            </p>
          </div>
        )}
        
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={handleGoBack} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回上一页
          </Button>
          <Button onClick={handleRefresh} className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新页面
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorBoundary; 