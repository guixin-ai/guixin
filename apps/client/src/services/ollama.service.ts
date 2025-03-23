/**
 * Ollama 服务 - 提供与 Ollama API 交互的方法
 * 使用 fetch 直接调用 Ollama API
 */

import {
  OllamaApiError,
  OllamaBaseError,
  OllamaConnectionError,
  OllamaModelLoadError,
  OllamaModelNotFoundError,
  OllamaResponseParseError,
  OllamaServiceUnavailableError,
  OllamaStreamAbortedError,
  OllamaTimeoutError,
  OllamaChatStreamError,
  OllamaUnknownError
} from '@/errors/ollama.errors';

// Ollama API 基础 URL
const OLLAMA_API_BASE_URL = 'http://localhost:11434/api';

// Ollama 聊天请求参数接口
export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: OllamaOptions;
  format?: string | Record<string, any>;
  template?: string;
  keep_alive?: string;
}

// Ollama 消息接口
export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | OllamaContent[];
}

// Ollama 消息内容接口
export interface OllamaContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: string;
}

// Ollama 聊天响应接口
export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
  error?: string;
}

// Ollama 生成请求参数接口
export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  template?: string;
  context?: number[];
  stream?: boolean;
  raw?: boolean;
  format?: string | Record<string, any>;
  options?: OllamaOptions;
  keep_alive?: string;
  images?: string[];
  suffix?: string;
}

// Ollama 生成响应接口
export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
  error?: string;
}

// Ollama 模型选项接口
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

// Ollama 模型信息接口
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

// Ollama 运行中模型接口
export interface OllamaRunningModel extends OllamaModel {
  model: string;
  expires_at: string;
  size_vram: number;
}

// Ollama 模型列表响应
export interface OllamaModelListResponse {
  models: OllamaModel[];
}

// Ollama 运行中模型列表响应
export interface OllamaRunningModelListResponse {
  models: OllamaRunningModel[];
}

// Ollama 嵌入请求参数接口
export interface OllamaEmbedRequest {
  model: string;
  input: string | string[];
  truncate?: boolean;
  options?: OllamaOptions;
  keep_alive?: string;
}

// Ollama 嵌入响应接口
export interface OllamaEmbedResponse {
  model: string;
  embeddings: number[][];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  error?: string;
}

// Ollama 旧版嵌入请求参数接口
export interface OllamaEmbeddingsRequest {
  model: string;
  prompt: string;
  options?: OllamaOptions;
  keep_alive?: string;
}

// Ollama 旧版嵌入响应接口
export interface OllamaEmbeddingsResponse {
  embedding: number[];
  error?: string;
}

// Ollama 创建模型请求参数接口
export interface OllamaCreateRequest {
  name: string;
  modelfile: string;
  stream?: boolean;
  path?: string;
}

// Ollama 显示模型信息请求参数接口
export interface OllamaShowRequest {
  name: string;
  verbose?: boolean;
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

// Ollama 复制模型请求参数接口
export interface OllamaCopyRequest {
  source: string;
  destination: string;
}

// Ollama 删除模型请求参数接口
export interface OllamaDeleteRequest {
  model: string;
}

// Ollama 拉取模型请求参数接口
export interface OllamaPullRequest {
  model: string;
  insecure?: boolean;
  stream?: boolean;
}

// Ollama 推送模型请求参数接口
export interface OllamaPushRequest {
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

// Ollama 版本响应接口
export interface OllamaVersionResponse {
  version: string;
}

// Ollama 添加可取消的聊天流方法
export interface ChatStreamOptions {
  signal?: AbortSignal;
}

// 添加流式聊天结果接口
export interface OllamaChatStreamResult {
  fullResponse: OllamaMessage;
  chunks: OllamaChatResponse[];
}

/**
 * 辅助函数：解析响应错误
 * @param response HTTP响应对象
 * @param endpoint API端点
 * @param modelName 可选的模型名称，用于特定错误
 * @returns 解析后的错误文本和消息
 * @throws 抛出适当的异常
 */
async function parseResponseError(response: Response, endpoint: string, modelName?: string): Promise<never> {
  const errorText = await response.text();
  let errorMessage = `状态码: ${response.status}`;

  try {
    // 尝试解析错误响应为JSON
    const errorJson = JSON.parse(errorText);
    if (errorJson.error) {
      errorMessage = errorJson.error;
    }
  } catch {
    // 如果不是JSON，使用原始错误文本
    errorMessage = `${errorMessage}, ${errorText}`;
  }

  // 根据状态码和错误信息选择合适的异常类型
  if (response.status === 404) {
    if (modelName) {
      throw new OllamaModelNotFoundError(modelName, response.status, errorMessage, errorText);
    }
  } else if (response.status === 500 && errorMessage.includes("failed to load model")) {
    if (modelName) {
      throw new OllamaModelLoadError(modelName, response.status, errorMessage, errorText);
    }
  }

  // 默认API错误
  throw new OllamaApiError(response.status, endpoint, errorMessage, errorText);
}

/**
 * 辅助函数：处理公共错误逻辑
 * @param error 捕获到的错误
 * @throws 转换后的异常
 */
function handleCommonErrors(error: unknown): never {
  // 如果是已知的Ollama异常，直接抛出
  if (error instanceof OllamaBaseError) {
    throw error;
  }
  
  // 网络错误
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new OllamaConnectionError(error.message, error);
  }
  
  // 中断错误
  if (error instanceof DOMException && error.name === 'AbortError') {
    throw new OllamaTimeoutError(0, error);
  }
  
  // 未知错误 - 使用专门的OllamaUnknownError
  throw new OllamaUnknownError(
    error instanceof Error ? error.message : String(error),
    error
  );
}

/**
 * Ollama 服务类
 */
class OllamaService {
  /**
   * 与 Ollama 模型对话（使用 /api/chat 端点）
   * @param request 对话请求参数
   * @returns 对话响应
   */
  async chat(request: OllamaChatRequest): Promise<OllamaChatResponse> {
    try {
      const response = await fetch(`${OLLAMA_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          stream: request.stream ?? false,
          options: request.options || {},
          format: request.format,
          template: request.template,
          keep_alive: request.keep_alive,
        }),
      });

      if (!response.ok) {
        await parseResponseError(response, '/chat', request.model);
      }

      return response.json() as Promise<OllamaChatResponse>;
    } catch (error) {
      handleCommonErrors(error);
    }
  }

  /**
   * 使用 for await 循环的流式聊天
   * @param request 聊天请求
   * @param options 附加选项，包含 AbortSignal
   * @returns 异步迭代器，可用于 for await...of 循环
   */
  async *chatStream(
    request: OllamaChatRequest,
    options: ChatStreamOptions = {}
  ): AsyncGenerator<OllamaChatResponse, OllamaMessage, undefined> {
    // 确保流模式开启
    request.stream = true;

    const response = await fetch(`${OLLAMA_API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: options.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `状态码: ${response.status}`;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        errorMessage = `${errorMessage}, ${errorText}`;
      }

      if (response.status === 404) {
        throw new OllamaModelNotFoundError(request.model, response.status, errorMessage, errorText);
      } else if (response.status === 500 && errorMessage.includes("failed to load model")) {
        throw new OllamaModelLoadError(request.model, response.status, errorMessage, errorText);
      } else {
        throw new OllamaChatStreamError(response.status, errorMessage, false, errorText);
      }
    }

    if (!response.body) {
      throw new OllamaChatStreamError(0, '响应没有可读取的内容');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const jsonChunk = JSON.parse(line) as OllamaChatResponse;
            
            if (jsonChunk.message?.content && typeof jsonChunk.message.content === 'string') {
              fullContent += jsonChunk.message.content;
            }
            
            // 使用yield返回每个块
            yield jsonChunk;
          } catch (e) {
            console.warn('解析 JSON 响应失败:', line, e);
          }
        }
      }

      // 处理缓冲区中的最后一个不完整行
      if (buffer.trim()) {
        try {
          const jsonChunk = JSON.parse(buffer) as OllamaChatResponse;
          
          if (jsonChunk.message?.content && typeof jsonChunk.message.content === 'string') {
            fullContent += jsonChunk.message.content;
          }
          
          yield jsonChunk;
        } catch (e) {
          console.warn('解析最终 JSON 响应失败:', buffer, e);
        }
      }

      // 迭代结束后返回完整响应
      return {
        role: 'assistant',
        content: fullContent,
      };
    } catch (error: any) {
      // 处理中断错误
      if (error.name === 'AbortError') {
        console.log('流式生成被用户中断');
        throw new OllamaStreamAbortedError();
      }
      
      // 处理其他错误
      let handledError: Error;
      
      if (error instanceof OllamaBaseError) {
        handledError = error;
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        handledError = new OllamaConnectionError(error.message, error);
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        handledError = new OllamaTimeoutError(0, error);
      } else {
        handledError = new OllamaUnknownError(
          error instanceof Error ? error.message : String(error),
          error
        );
      }
      
      throw handledError;
    }
  }

  /**
   * 生成文本补全（使用 /api/generate 端点）
   * @param request 生成请求参数
   * @returns 生成响应
   */
  async generate(request: OllamaGenerateRequest): Promise<OllamaGenerateResponse> {
    try {
      const response = await fetch(`${OLLAMA_API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          prompt: request.prompt,
          system: request.system,
          template: request.template,
          context: request.context,
          stream: request.stream ?? false,
          raw: request.raw,
          format: request.format,
          options: request.options || {},
          keep_alive: request.keep_alive,
          images: request.images,
          suffix: request.suffix,
        }),
      });

      if (!response.ok) {
        await parseResponseError(response, '/generate', request.model);
      }

      return response.json() as Promise<OllamaGenerateResponse>;
    } catch (error) {
      handleCommonErrors(error);
    }
  }

  /**
   * 获取所有可用的 Ollama 模型列表（使用 /api/tags 端点）
   * @returns 模型列表
   */
  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${OLLAMA_API_BASE_URL}/tags`);

      if (!response.ok) {
        await parseResponseError(response, '/tags');
      }

      const data = await response.json() as OllamaModelListResponse;
      return data.models || [];
    } catch (error) {
      handleCommonErrors(error);
    }
  }

  /**
   * 获取当前运行中的 Ollama 模型列表（使用 /api/ps 端点）
   * @returns 运行中的模型列表
   */
  async listRunningModels(): Promise<OllamaRunningModel[]> {
    try {
      const response = await fetch(`${OLLAMA_API_BASE_URL}/ps`);

      if (!response.ok) {
        await parseResponseError(response, '/ps');
      }

      const data = await response.json() as OllamaRunningModelListResponse;
      return data.models || [];
    } catch (error) {
      handleCommonErrors(error);
    }
  }

  /**
   * 显示模型详细信息（使用 /api/show 端点）
   * @param request 显示模型信息请求参数
   * @returns 模型详细信息
   */
  async showModel(request: OllamaShowRequest): Promise<OllamaShowResponse> {
    try {
      const response = await fetch(`${OLLAMA_API_BASE_URL}/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: request.name,
          verbose: request.verbose,
        }),
      });

      if (!response.ok) {
        await parseResponseError(response, '/show', request.name);
      }

      return response.json() as Promise<OllamaShowResponse>;
    } catch (error) {
      handleCommonErrors(error);
    }
  }

  /**
   * 获取 Ollama 版本信息
   * @returns 版本信息
   */
  async getVersion(): Promise<string> {
    try {
      const response = await fetch(`${OLLAMA_API_BASE_URL}/version`);

      if (!response.ok) {
        await parseResponseError(response, '/version');
      }

      const data = await response.json() as OllamaVersionResponse;
      return data.version;
    } catch (error) {
      handleCommonErrors(error);
    }
  }

  /**
   * 检查 Ollama 服务是否可用
   * @returns 如果服务可用返回 true，否则返回 false
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${OLLAMA_API_BASE_URL}/tags`, {
        method: 'GET',
        // 设置较短的超时时间
        signal: AbortSignal.timeout(2000),
      });
      return response.ok;
    } catch (error) {
      // 仅返回false，不抛出异常
      return false;
    }
  }
}

// 导出单例实例
export const ollamaService = new OllamaService();
