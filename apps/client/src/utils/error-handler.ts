/**
 * 错误处理工具 - 提供统一的错误处理方法
 */

// 日志级别
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// 错误上下文
export interface ErrorContext {
  component?: string;
  method?: string;
  details?: any;
}

// 错误日志结构
export interface ErrorLog {
  timestamp: string;
  level: LogLevel;
  name: string;
  message: string;
  stack?: string;
  context: ErrorContext;
}

/**
 * 全局错误处理器（单例模式）
 */
export class ErrorHandler {
  private static instance: ErrorHandler;

  /**
   * 获取ErrorHandler实例
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @param context 错误上下文
   * @param level 日志级别
   */
  public handleError(error: unknown, context?: ErrorContext, level: LogLevel = LogLevel.ERROR): void {
    // 获取错误消息
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
    
    // 获取错误名称
    const errorName = error instanceof Error 
      ? error.name 
      : 'UnknownError';
    
    // 获取错误栈
    const errorStack = error instanceof Error 
      ? error.stack 
      : '';
    
    // 构建错误日志
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level,
      name: errorName,
      message: errorMessage,
      stack: errorStack,
      context: context || {},
    };
    
    // 输出到控制台
    this.logError(errorLog);
    
    // 这里可以添加错误上报逻辑，如发送到服务器或第三方监控平台
    
    // 如果是致命错误，可以显示全局错误页面
    if (level === LogLevel.FATAL) {
      // 显示全局错误页面的逻辑
      this.handleFatalError(errorLog);
    }
  }
  
  /**
   * 记录错误日志到控制台
   * @param errorLog 错误日志对象
   */
  private logError(errorLog: ErrorLog): void {
    const { level } = errorLog;
    
    switch (level) {
      case LogLevel.INFO:
        console.info('[ErrorHandler]', errorLog);
        break;
      case LogLevel.WARN:
        console.warn('[ErrorHandler]', errorLog);
        break;
      case LogLevel.ERROR:
        console.error('[ErrorHandler]', errorLog);
        break;
      case LogLevel.FATAL:
        console.error('[ErrorHandler] FATAL:', errorLog);
        break;
    }
  }
  
  /**
   * 处理致命错误
   * @param errorLog 错误日志对象
   */
  private handleFatalError(errorLog: ErrorLog): void {
    // 处理致命错误的特殊逻辑
    // 例如显示全局错误页面、重置应用状态等
    console.error('处理致命错误:', errorLog);
  }
  
  /**
   * 捕获并处理Promise错误
   * @param promise 要执行的Promise
   * @param context 错误上下文
   * @returns 包含结果和错误的元组 [data, error]
   */
  public async handlePromise<T>(
    promise: Promise<T>,
    context?: ErrorContext
  ): Promise<[T | null, Error | null]> {
    try {
      const data = await promise;
      return [data, null];
    } catch (error) {
      this.handleError(error, context);
      return [null, error instanceof Error ? error : new Error(String(error))];
    }
  }

  /**
   * 静态方法 - 处理错误（便捷方法）
   */
  public static handleError(error: unknown, context?: ErrorContext, level: LogLevel = LogLevel.ERROR): void {
    ErrorHandler.getInstance().handleError(error, context, level);
  }

  /**
   * 静态方法 - 捕获并处理Promise错误（便捷方法）
   */
  public static async handlePromise<T>(
    promise: Promise<T>,
    context?: ErrorContext
  ): Promise<[T | null, Error | null]> {
    return await ErrorHandler.getInstance().handlePromise(promise, context);
  }
}

/**
 * 初始化全局错误处理
 */
export function initGlobalErrorHandlers(): void {
  const errorHandler = ErrorHandler.getInstance();
  
  // 捕获未处理的错误
  window.addEventListener('error', (event) => {
    errorHandler.handleError(event.error, {
      component: 'GlobalErrorHandler',
      method: 'window.onerror',
    }, LogLevel.ERROR);
  });
  
  // 捕获未处理的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(event.reason, {
      component: 'GlobalErrorHandler',
      method: 'unhandledrejection',
    }, LogLevel.ERROR);
  });
  
  console.info('全局错误处理已初始化');
} 