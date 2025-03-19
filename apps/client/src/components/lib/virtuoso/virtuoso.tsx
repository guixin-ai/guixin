import React, { forwardRef, useImperativeHandle } from 'react';
import { Virtuoso as ReactVirtuoso, VirtuosoProps, VirtuosoHandle } from 'react-virtuoso';

// 导出原始类型，方便使用
export type {
  VirtuosoProps,
  VirtuosoHandle,
  ListRange,
  ScrollIntoViewLocation,
  ScrollSeekConfiguration,
  ItemContent,
  FollowOutput,
} from 'react-virtuoso';

// Virtuoso 组件封装
function VirtuosoComponent<T = any, C = any>(
  props: VirtuosoProps<T, C>,
  ref: React.ForwardedRef<VirtuosoHandle>
) {
  const virtuosoRef = React.useRef<VirtuosoHandle>(null);

  // 将内部 ref 暴露给外部
  useImperativeHandle(ref, () => {
    return virtuosoRef.current!;
  }, [virtuosoRef]);

  return <ReactVirtuoso ref={virtuosoRef} {...props} />;
}

// 使用 forwardRef 创建组件，以便可以传递 ref
export const Virtuoso = forwardRef(VirtuosoComponent) as <T = any, C = any>(
  props: VirtuosoProps<T, C> & { ref?: React.ForwardedRef<VirtuosoHandle> }
) => React.ReactElement;

export default Virtuoso;
