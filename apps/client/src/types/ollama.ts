// Ollama相关类型定义

// Ollama模型信息接口
export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

// Ollama 显示模型信息响应接口
export interface OllamaShowResponse {
  license?: string;
  modelfile?: string;
  parameters?: Record<string, any>;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
  tokenizer?: {
    model?: string;
    [key: string]: any;
  };
  error?: string;
}

// Ollama 拉取模型请求参数接口
export interface OllamaPullRequest {
  model: string;
  insecure?: boolean;
  stream?: boolean;
}

// Ollama 拉取/推送模型进度响应接口
export interface OllamaProgressResponse {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
  error?: string;
}

// Ollama 删除模型请求参数接口
export interface OllamaDeleteRequest {
  model: string;
}

// Ollama聊天请求参数接口
export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: OllamaOptions;
  format?: string | Record<string, any>;
  template?: string;
  keep_alive?: string;
}

// Ollama消息接口
export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | OllamaContent[];
}

// Ollama消息内容接口
export interface OllamaContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: string;
}

// Ollama模型选项接口
export interface OllamaOptions {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  num_predict?: number;
  stop?: string[];
  repeat_penalty?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  tfs_z?: number;
  mirostat?: number;
  mirostat_tau?: number;
  mirostat_eta?: number;
  seed?: number;
}
