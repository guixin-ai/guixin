import React, { forwardRef, useImperativeHandle } from 'react';
import {
  VirtuosoMessageList,
  VirtuosoMessageListProps,
  VirtuosoMessageListMethods,
  VirtuosoMessageListLicense,
} from '@virtuoso.dev/message-list';

// 导出原始类型，方便使用
export type {
  VirtuosoMessageListProps,
  VirtuosoMessageListMethods,
  ItemContent,
  DataMethods,
  ScrollBehavior,
  ItemLocation,
  AutoscrollToBottom,
} from '@virtuoso.dev/message-list';

// 组件属性类型
export interface VirtuosoMessageProps<Data, Context>
  extends Omit<VirtuosoMessageListProps<Data, Context>, 'licenseKey'> {
  licenseKey?: string;
}

// 创建一个通用的 VirtuosoMessage 组件
function VirtuosoMessageComponent<Data, Context>(
  props: VirtuosoMessageProps<Data, Context>,
  ref: React.ForwardedRef<VirtuosoMessageListMethods<Data>>
) {
  const { licenseKey = '', ...restProps } = props;
  const virtuosoRef = React.useRef<VirtuosoMessageListMethods<Data>>(null);

  // 将内部 ref 暴露给外部
  useImperativeHandle(ref, () => {
    return virtuosoRef.current!;
  }, [virtuosoRef]);

  return (
    <VirtuosoMessageListLicense licenseKey={licenseKey}>
      <VirtuosoMessageList<Data, Context> ref={virtuosoRef} {...restProps} />
    </VirtuosoMessageListLicense>
  );
}

// 使用 forwardRef 创建组件，以便可以传递 ref
export const VirtuosoMessage = forwardRef(VirtuosoMessageComponent) as <Data, Context>(
  props: VirtuosoMessageProps<Data, Context> & {
    ref?: React.ForwardedRef<VirtuosoMessageListMethods<Data>>;
  }
) => React.ReactElement;

export default VirtuosoMessage;
