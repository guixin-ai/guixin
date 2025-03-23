import React from 'react';

// 简易错误边界组件
export function SimpleErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 