import { create } from 'zustand';
import { createLogger } from '../utils/logger';

const logger = createLogger('提及状态模型');

/**
 * 提及功能状态接口
 */
interface MentionState {
  // 提及下拉框显示状态
  isDropdownOpen: boolean;
  
  // 打开提及下拉框
  openDropdown: () => void;
  
  // 关闭提及下拉框
  closeDropdown: () => void;
}

/**
 * 创建提及状态管理
 * 使用zustand管理全局的提及相关状态
 */
export const useMentionState = create<MentionState>((set) => ({
  // 初始状态: 下拉框关闭
  isDropdownOpen: false,
  
  // 打开下拉框方法
  openDropdown: () => {
    logger.debug('打开提及下拉框');
    set({ isDropdownOpen: true });
  },
  
  // 关闭下拉框方法
  closeDropdown: () => {
    logger.debug('关闭提及下拉框');
    set({ isDropdownOpen: false });
  },
})); 