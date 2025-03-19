import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

/**
 * 联系人搜索栏组件的引用接口
 * @interface ContactSearchBarRef
 */
export interface ContactSearchBarRef {
  /** 获取当前搜索文本 */
  getSearchText: () => string;
  /** 清空搜索框 */
  clearSearch: () => void;
  /** 设置搜索框的值 */
  setSearchText: (text: string) => void;
  /** 聚焦搜索框 */
  focus: () => void;
}

/**
 * 联系人搜索栏组件的属性
 * @interface ContactSearchBarProps
 */
export interface ContactSearchBarProps {
  /** 搜索值变化时的回调函数 */
  onSearch?: (value: string) => void;
  /** 添加按钮点击时的回调函数 */
  onAddClick?: () => void;
  /** 搜索框占位符文本 */
  placeholder?: string;
  /** 添加按钮的文本 */
  addButtonText?: string;
  /** 初始搜索文本 */
  initialSearchText?: string;
  /** 是否禁用添加按钮 */
  disableAddButton?: boolean;
  /** 添加按钮的类名 */
  addButtonClassName?: string;
  /** 组件容器的类名 */
  className?: string;
}

/**
 * 联系人搜索栏组件
 *
 * 用于在联系人列表顶部提供搜索功能和添加联系人入口。负责：
 * - 提供搜索输入框和添加按钮
 * - 维护搜索文本的内部状态
 * - 触发搜索和添加按钮的回调
 *
 * 不负责：
 * - 执行实际的搜索逻辑
 * - 处理添加联系人的业务逻辑
 */
export const ContactSearchBar = forwardRef<ContactSearchBarRef, ContactSearchBarProps>(
  (
    {
      onSearch,
      onAddClick,
      placeholder = '搜索联系人',
      addButtonText = '添加',
      initialSearchText = '',
      disableAddButton = false,
      addButtonClassName = '',
      className = '',
    },
    ref
  ) => {
    const [searchText, setSearchText] = useState(initialSearchText);
    const inputRef = useRef<HTMLInputElement>(null);

    // 暴露组件方法给父组件
    useImperativeHandle(ref, () => ({
      getSearchText: () => searchText,
      clearSearch: () => {
        setSearchText('');
        if (onSearch) onSearch('');
      },
      setSearchText: (text: string) => {
        setSearchText(text);
        if (onSearch) onSearch(text);
      },
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchText(value);
      if (onSearch) onSearch(value);
    };

    return (
      <div className={`w-full flex space-x-2 ${className}`}>
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className="w-full pl-9"
            value={searchText}
            onChange={handleInputChange}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
        <Button
          data-testid="add-contact-button"
          variant="outline"
          size="icon"
          onClick={onAddClick}
          disabled={disableAddButton}
          className={`rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 ${addButtonClassName}`}
          title="添加新联系人"
        >
          <Plus size={18} />
        </Button>
      </div>
    );
  }
);

ContactSearchBar.displayName = 'ContactSearchBar';

export default ContactSearchBar;
