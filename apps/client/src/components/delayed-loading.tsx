import React, { ReactNode, useEffect, useState } from 'react';

interface DelayedLoadingProps {
  /**
   * 是否处于加载状态
   */
  loading: boolean;

  /**
   * 延迟显示加载状态的时间（毫秒）
   * 只有当加载状态持续超过此时间才会显示加载UI
   */
  delay?: number;

  /**
   * 子组件，当不处于加载状态时显示
   */
  children: ReactNode;
}

/**
 * 延迟显示加载状态的组件
 *
 * 当loading变为true时，不会立即显示加载状态，而是等待指定的延迟时间
 * 如果在延迟时间内loading变为false，则不会显示加载状态，避免闪烁
 */
const DelayedLoading: React.FC<DelayedLoadingProps> = ({ loading, delay = 300, children }) => {
  // 是否显示加载状态UI
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (loading) {
      // 如果进入加载状态，设置延迟计时器
      timer = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    } else {
      // 如果退出加载状态，立即隐藏加载UI
      setShowLoading(false);
    }

    // 清理函数，在组件卸载或依赖变化时清除计时器
    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [loading, delay]);

  // 默认的加载组件
  const defaultLoadingComponent = (
    <div className="flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">加载中...</p>
    </div>
  );

  return (
    <>
      {children}
      {/* 加载指示器 */}
      {loading && showLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/10">
          {defaultLoadingComponent}
        </div>
      )}
    </>
  );
};

export default DelayedLoading;
