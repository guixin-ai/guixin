import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import { ContactSearchBar, ContactSearchBarRef } from './contact-search-bar';
import { Button } from '../ui/button';

/**
 * ContactSearchBar 组件故事
 *
 * 该组件提供联系人搜索输入框和添加按钮
 */
const meta = {
  component: ContactSearchBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '联系人搜索栏组件，提供搜索输入框和添加按钮，维护内部搜索状态并提供引用接口进行控制。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSearch: { action: '搜索' },
    onAddClick: { action: '添加按钮点击' },
  },
} satisfies Meta<typeof ContactSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 默认展示状态
 */
export const 默认视图: Story = {
  args: {
    placeholder: '搜索联系人',
    addButtonText: '添加',
    initialSearchText: '',
    disableAddButton: false,
  },
};

/**
 * 带有初始搜索文本
 */
export const 带初始搜索文本: Story = {
  args: {
    ...默认视图.args,
    initialSearchText: '张三',
  },
};

/**
 * 禁用添加按钮
 */
export const 禁用添加按钮: Story = {
  args: {
    ...默认视图.args,
    disableAddButton: true,
  },
};

/**
 * 自定义按钮样式
 */
export const 自定义样式: Story = {
  args: {
    ...默认视图.args,
    addButtonClassName: 'bg-blue-500 hover:bg-blue-600 text-white',
    className: 'p-2 bg-gray-100 dark:bg-gray-800 rounded-lg',
  },
};

/**
 * 引用API示例
 *
 * 这个故事展示了如何使用组件的引用API
 *
 * ```ts
 * // 引用接口示例
 * interface ContactSearchBarRef {
 *   // 获取当前搜索文本
 *   getSearchText: () => string;
 *   // 清空搜索框
 *   clearSearch: () => void;
 *   // 设置搜索框的值
 *   setSearchText: (text: string) => void;
 *   // 聚焦搜索框
 *   focus: () => void;
 * }
 * ```
 */
export const 引用API示例: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const searchBarRef = useRef<ContactSearchBarRef>(null);

    const handleGetSearch = () => {
      if (searchBarRef.current) {
        alert(`当前搜索文本: ${searchBarRef.current.getSearchText()}`);
      }
    };

    const handleClearSearch = () => {
      if (searchBarRef.current) {
        searchBarRef.current.clearSearch();
      }
    };

    const handleSetSearch = () => {
      if (searchBarRef.current) {
        searchBarRef.current.setSearchText('新设置的搜索文本');
      }
    };

    const handleFocus = () => {
      if (searchBarRef.current) {
        searchBarRef.current.focus();
      }
    };

    return (
      <div className="space-y-4">
        <ContactSearchBar
          ref={searchBarRef}
          onSearch={value => console.log('搜索:', value)}
          onAddClick={() => console.log('添加按钮点击')}
        />
        <div className="flex space-x-2">
          <Button size="sm" onClick={handleGetSearch}>
            获取搜索文本
          </Button>
          <Button size="sm" onClick={handleClearSearch}>
            清空搜索
          </Button>
          <Button size="sm" onClick={handleSetSearch}>
            设置搜索文本
          </Button>
          <Button size="sm" onClick={handleFocus}>
            聚焦搜索框
          </Button>
        </div>
      </div>
    );
  },
};
