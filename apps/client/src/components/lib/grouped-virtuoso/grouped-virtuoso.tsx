import React, { forwardRef, useImperativeHandle } from 'react';
import {
  GroupedVirtuoso as ReactGroupedVirtuoso,
  GroupedVirtuosoProps,
  VirtuosoHandle,
} from 'react-virtuoso';

// 导出原始类型，方便使用
export type {
  GroupedVirtuosoProps,
  VirtuosoHandle,
  ListRange,
  ScrollIntoViewLocation,
  ScrollSeekConfiguration,
  GroupItemContent,
  GroupContent,
  FollowOutput,
} from 'react-virtuoso';

// GroupedVirtuoso 组件封装
function GroupedVirtuosoComponent<D = any, G = any>(
  props: GroupedVirtuosoProps<D, G>,
  ref: React.ForwardedRef<VirtuosoHandle>
) {
  const virtuosoRef = React.useRef<VirtuosoHandle>(null);

  // 将内部 ref 暴露给外部
  useImperativeHandle(ref, () => {
    return virtuosoRef.current!;
  }, [virtuosoRef]);

  return <ReactGroupedVirtuoso ref={virtuosoRef} {...props} />;
}

// 使用 forwardRef 创建组件，以便可以传递 ref
export const GroupedVirtuoso = forwardRef(GroupedVirtuosoComponent) as <D = any, G = any>(
  props: GroupedVirtuosoProps<D, G> & { ref?: React.ForwardedRef<VirtuosoHandle> }
) => React.ReactElement;

export default GroupedVirtuoso;
