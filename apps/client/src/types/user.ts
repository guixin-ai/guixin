// 用户相关类型定义

// 用户接口
export interface User {
  id: string;
  name: string;
  description?: string;
  isAi?: boolean;
}

// 从后端API获取的用户信息
export interface UserInfo {
  id: string;
  name: string;
  description: string | null;
  is_ai: boolean;
  created_at: string;
  updated_at: string;
}

// 创建用户请求接口
export interface CreateUserRequest {
  name: string;
  email?: string;
}

// 更新用户请求接口
export interface UpdateUserRequest {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  description?: string;
  is_ai: boolean;
  cloud_id?: string;
  sync_enabled: boolean;
  theme: string;
  language: string;
  font_size: number;
  custom_settings?: string;
}
