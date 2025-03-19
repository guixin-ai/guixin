// Agent相关类型定义

// Agent接口
export interface Agent {
  id: string;
  name: string;
  model_name: string;
  system_prompt: string;
  temperature: number;
  max_tokens?: number;
  top_p?: number;
  avatar_url?: string;
  description?: string;
  is_streaming: boolean;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

// 创建Agent请求接口
export interface CreateAgentRequest {
  name: string;
  model_name: string;
  system_prompt: string;
  temperature: number;
  max_tokens?: number;
  top_p?: number;
  avatar_url?: string;
  description?: string;
  is_streaming: boolean;
  user_id?: string;
}

// 更新Agent请求接口
export interface UpdateAgentRequest {
  id: string;
  name: string;
  model_name: string;
  system_prompt: string;
  temperature: number;
  max_tokens?: number;
  top_p?: number;
  avatar_url?: string;
  description?: string;
  is_streaming: boolean;
  user_id?: string;
}
