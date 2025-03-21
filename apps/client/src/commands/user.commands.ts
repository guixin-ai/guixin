import { invoke } from '@tauri-apps/api/core';
import { UserInfo } from '@/types/user';

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (): Promise<UserInfo> => {
  return await invoke('get_current_user') as UserInfo;
};

/**
 * 根据ID获取用户
 */
export const getUser = async (id: string): Promise<UserInfo> => {
  return await invoke('get_user', { id }) as UserInfo;
}; 