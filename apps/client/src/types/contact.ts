// 联系人相关类型定义

// 联系人接口
export interface Contact {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  group_id: string;
  user_link_id: string;
  owner_id: string;
}

// 联系人分组接口
export interface ContactGroup {
  id: string;
  name: string;
  description?: string;
}

// 联系人与分组信息接口
export interface ContactWithGroup {
  contact: Contact;
  group: ContactGroup;
}

// 创建联系人请求接口
export interface CreateContactRequest {
  name: string;
  description?: string | null;
  group_id: string;
  user_link_id: string;
  owner_id: string;
}

// 创建联系人分组请求接口
export interface CreateContactGroupRequest {
  name: string;
  description?: string | null;
}

// 创建AI联系人请求接口
export interface CreateAIContactRequest {
  // Agent参数
  name: string;
  model_name: string;
  system_prompt: string;
  temperature: number;
  max_tokens?: number;
  top_p?: number;
  avatar_url?: string;
  description?: string | null;
  is_streaming: boolean;

  // 联系人参数
  group_id: string;
  owner_user_id: string; // 拥有者用户ID
}

// 更新联系人请求接口
export interface UpdateContactRequest {
  id: string;
  name: string;
  description?: string | null;
  group_id: string;
}
