import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorHandler, LogLevel } from '../utils/error-handler';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 应用级错误边界组件
 * 
 * 用于捕获整个应用中的 JavaScript 错误，并显示备用 UI，防止整个应用崩溃
 * 作为应用的最后一道防线，确保即使是路由系统本身的错误也能被捕获和处理
 * 内部使用ErrorHandler统一处理错误日志记录
 */
class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    // 更新 state，下次渲染时显示备用 UI
    return { 
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 使用统一的错误处理器记录错误信息
    ErrorHandler.handleError(error, {
      component: 'AppErrorBoundary',
      method: 'componentDidCatch',
      details: {
        componentStack: errorInfo.componentStack,
        message: '应用根组件捕获到未处理的错误'
      }
    }, LogLevel.FATAL);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // 显示默认的错误UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              应用出现严重错误
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              抱歉，应用遇到了意外问题，无法继续运行。请尝试刷新页面或联系支持团队。
            </p>
            {this.state.error && (
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-auto max-h-40">
                <p className="text-sm font-mono text-gray-800 dark:text-gray-200">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary; 