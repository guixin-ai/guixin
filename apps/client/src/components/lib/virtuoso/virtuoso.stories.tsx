import React, { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Virtuoso, VirtuosoHandle } from './virtuoso';

// 定义 Meta
const meta = {
  component: Virtuoso,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Virtuoso>;

export default meta;

// 简单列表项数据
interface SimpleItem {
  id: number;
  text: string;
}

// 创建模拟数据
const generateItems = (count: number): SimpleItem[] => {
  return Array.from({ length: count }).map((_, index) => ({
    id: index,
    text: `项目 ${index + 1}`,
  }));
};

// Virtuoso 基础示例
export const Basic = () => {
  const items = generateItems(1000);

  return (
    <div style={{ height: '400px', width: '300px' }}>
      <Virtuoso
        style={{ height: '100%', width: '100%' }}
        totalCount={items.length}
        itemContent={index => (
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid #eee',
              backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
            }}
          >
            {items[index].text}
          </div>
        )}
      />
    </div>
  );
};

// 带引用示例
export const WithRef = () => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const items = generateItems(1000);

  const scrollToRandomItem = () => {
    if (virtuosoRef.current) {
      const randomIndex = Math.floor(Math.random() * items.length);
      virtuosoRef.current.scrollToIndex({
        index: randomIndex,
        align: 'center',
      });
    }
  };

  return (
    <div style={{ height: '400px', width: '300px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={scrollToRandomItem}>滚动到随机项</button>
      </div>
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: '100%', width: '100%' }}
        totalCount={items.length}
        itemContent={index => (
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid #eee',
              backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
            }}
          >
            {items[index].text}
          </div>
        )}
      />
    </div>
  );
};
