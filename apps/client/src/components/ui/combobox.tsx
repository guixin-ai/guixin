'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

/**
 * 下拉选择框选项接口
 */
export interface ComboboxOption {
  /** 选项的值，用于内部识别和处理 */
  value: string;
  /** 选项的显示标签 */
  label: string;
}

/**
 * 下拉选择框组件接口
 */
interface ComboboxProps {
  /** 可选选项列表 */
  options: ComboboxOption[];
  /** 当前选中的值 */
  value: string;
  /** 值变化时的回调函数 */
  onChange: (value: string) => void;
  /** 未选择时的占位文本 */
  placeholder?: string;
  /** 搜索框的占位文本 */
  searchPlaceholder?: string;
  /** 未找到匹配项时显示的消息 */
  emptyMessage?: string;
  /** 自定义类名 */
  className?: string;
  /** 是否禁用组件 */
  disabled?: boolean;
}

/**
 * 下拉选择框组件
 *
 * 提供可搜索的下拉选择功能，支持自定义占位符、空状态消息和禁用状态。
 *
 * @example
 * ```tsx
 * const options = [
 *   { value: "apple", label: "苹果" },
 *   { value: "banana", label: "香蕉" }
 * ];
 *
 * const [value, setValue] = useState("");
 *
 * <Combobox
 *   options={options}
 *   value={value}
 *   onChange={setValue}
 *   placeholder="选择水果..."
 * />
 * ```
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = '选择选项...',
  searchPlaceholder = '搜索...',
  emptyMessage = '未找到匹配项',
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-fit justify-between', className)}
          disabled={disabled}
        >
          {value ? options.find(option => option.value === value)?.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[8rem] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-9"
            onValueChange={setSearchValue}
            value={searchValue}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={currentValue => {
                    onChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
