import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GroupedVirtuoso } from './grouped-virtuoso';

// 定义 Meta
const meta = {
  component: GroupedVirtuoso,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GroupedVirtuoso>;

export default meta;

// 分组数据
const generateGroupedData = () => {
  const groups = ['A', 'B', 'C', 'D', 'E'];
  const groupCounts = [10, 20, 15, 7, 13];

  return {
    groups: groups,
    items: groups.flatMap((group, groupIndex) => {
      return Array.from({ length: groupCounts[groupIndex] }).map((_, itemIndex) => ({
        id: `${group}-${itemIndex}`,
        group: group,
        text: `${group} 组项目 ${itemIndex + 1}`,
      }));
    }),
  };
};

// GroupedVirtuoso 示例
export const Basic = () => {
  const { groups, items } = generateGroupedData();

  return (
    <div style={{ height: '400px', width: '300px' }}>
      <GroupedVirtuoso
        style={{ height: '100%', width: '100%' }}
        groupCounts={groups.map(group => items.filter(item => item.group === group).length)}
        groupContent={index => (
          <div
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '0.5rem 1rem',
              fontWeight: 'bold',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            {groups[index]}
          </div>
        )}
        itemContent={index => {
          const item = items[index];
          return (
            <div
              style={{
                padding: '1rem',
                borderBottom: '1px solid #eee',
                backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
              }}
            >
              {item.text}
            </div>
          );
        }}
      />
    </div>
  );
};

// 自定义样式示例
export const CustomStyles = () => {
  const { groups, items } = generateGroupedData();

  return (
    <div style={{ height: '400px', width: '300px' }}>
      <GroupedVirtuoso
        style={{ height: '100%', width: '100%' }}
        groupCounts={groups.map(group => items.filter(item => item.group === group).length)}
        groupContent={index => (
          <div
            style={{
              backgroundColor: '#2c3e50',
              color: 'white',
              padding: '0.75rem 1rem',
              fontWeight: 'bold',
              position: 'sticky',
              top: 0,
              zIndex: 1,
              borderLeft: '4px solid #e74c3c',
            }}
          >
            分组：{groups[index]} ({items.filter(item => item.group === groups[index]).length} 项)
          </div>
        )}
        itemContent={index => {
          const item = items[index];
          return (
            <div
              style={{
                padding: '1rem',
                borderBottom: '1px solid #eee',
                backgroundColor: index % 2 === 0 ? '#f7f9fa' : 'white',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: `hsl(${item.group.charCodeAt(0) * 40}, 70%, 60%)`,
                  marginRight: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                {item.group}
              </div>
              <span>{item.text}</span>
            </div>
          );
        }}
      />
    </div>
  );
};
