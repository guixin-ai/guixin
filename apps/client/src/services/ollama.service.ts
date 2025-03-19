/**
 * Ollama 服务 - 提供与 Ollama API 交互的方法
 * 使用 fetch 直接调用 Ollama API
 */

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

// Ollama API 错误类
export class OllamaError extends Error {
  status: number;
  endpoint: string;
  details: string;

  constructor(status: number, endpoint: string, message: string) {
    super(`Ollama API 错误 [${endpoint}]: ${message}`);
    this.name = 'OllamaError';
    this.status = status;
    this.endpoint = endpoint;
    this.details = message;
  }
}

/**
 * 泛型 JSON 请求函数
 * @param url 请求 URL
 * @param options fetch 选项
 * @returns 解析后的 JSON 数据，类型为 T
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const endpoint = url.replace(OLLAMA_API_BASE_URL, '');

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
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

      throw new OllamaError(response.status, endpoint, errorMessage);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof OllamaError) {
      throw error;
    }

    // 网络错误或其他非HTTP错误
    throw new OllamaError(0, endpoint, error instanceof Error ? error.message : String(error));
  }
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
    return fetchJson<OllamaChatResponse>(`${OLLAMA_API_BASE_URL}/chat`, {
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
  }

  /**
   * 与 Ollama 模型进行流式对话（使用 /api/chat 端点）
   * @param request 对话请求参数
   * @param onChunk 处理每个响应块的回调函数
   * @param onComplete 对话完成时的回调函数
   */
  async chatStream(
    request: OllamaChatRequest,
    onChunk: (chunk: OllamaChatResponse) => void,
    onComplete?: (fullResponse: OllamaMessage) => void
  ): Promise<void> {
    const response = await fetch(`${OLLAMA_API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: true,
        options: request.options || {},
        format: request.format,
        template: request.template,
        keep_alive: request.keep_alive,
      }),
    });

    if (!response.ok) {
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

      throw new OllamaError(response.status, '/chat', errorMessage);
    }

    if (!response.body) {
      throw new OllamaError(0, '/chat', '响应没有可读取的内容');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // 解码二进制数据为文本
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // 处理可能包含多个或不完整的 JSON 对象的响应
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留最后一行，可能是不完整的

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const jsonChunk = JSON.parse(line) as OllamaChatResponse;
          onChunk(jsonChunk);

          if (jsonChunk.message?.content && typeof jsonChunk.message.content === 'string') {
            fullContent += jsonChunk.message.content;
          }
        } catch (e) {
          console.warn('解析 JSON 响应失败:', line, e);
        }
      }
    }

    // 处理缓冲区中的最后一个不完整行
    if (buffer.trim()) {
      try {
        const jsonChunk = JSON.parse(buffer) as OllamaChatResponse;
        onChunk(jsonChunk);

        if (jsonChunk.message?.content && typeof jsonChunk.message.content === 'string') {
          fullContent += jsonChunk.message.content;
        }
      } catch (e) {
        console.warn('解析最终 JSON 响应失败:', buffer, e);
      }
    }

    if (onComplete) {
      onComplete({
        role: 'assistant',
        content: fullContent,
      });
    }
  }

  /**
   * 生成文本补全（使用 /api/generate 端点）
   * @param request 生成请求参数
   * @returns 生成响应
   */
  async generate(request: OllamaGenerateRequest): Promise<OllamaGenerateResponse> {
    return fetchJson<OllamaGenerateResponse>(`${OLLAMA_API_BASE_URL}/generate`, {
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
  }

  /**
   * 流式生成文本补全（使用 /api/generate 端点）
   * @param request 生成请求参数
   * @param onChunk 处理每个响应块的回调函数
   * @param onComplete 生成完成时的回调函数
   */
  async generateStream(
    request: OllamaGenerateRequest,
    onChunk: (chunk: OllamaGenerateResponse) => void,
    onComplete?: (fullResponse: string) => void
  ): Promise<void> {
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
        stream: true,
        raw: request.raw,
        format: request.format,
        options: request.options || {},
        keep_alive: request.keep_alive,
        images: request.images,
        suffix: request.suffix,
      }),
    });

    if (!response.ok) {
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

      throw new OllamaError(response.status, '/generate', errorMessage);
    }

    if (!response.body) {
      throw new OllamaError(0, '/generate', '响应没有可读取的内容');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // 解码二进制数据为文本
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // 处理可能包含多个或不完整的 JSON 对象的响应
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留最后一行，可能是不完整的

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const jsonChunk = JSON.parse(line) as OllamaGenerateResponse;
          onChunk(jsonChunk);

          if (jsonChunk.response) {
            fullResponse += jsonChunk.response;
          }
        } catch (e) {
          console.warn('解析 JSON 响应失败:', line, e);
        }
      }
    }

    // 处理缓冲区中的最后一个不完整行
    if (buffer.trim()) {
      try {
        const jsonChunk = JSON.parse(buffer) as OllamaGenerateResponse;
        onChunk(jsonChunk);

        if (jsonChunk.response) {
          fullResponse += jsonChunk.response;
        }
      } catch (e) {
        console.warn('解析最终 JSON 响应失败:', buffer, e);
      }
    }

    if (onComplete) {
      onComplete(fullResponse);
    }
  }

  /**
   * 获取所有可用的 Ollama 模型列表（使用 /api/tags 端点）
   * @returns 模型列表
   */
  async listModels(): Promise<OllamaModel[]> {
    const data = await fetchJson<OllamaModelListResponse>(`${OLLAMA_API_BASE_URL}/tags`);
    return data.models || [];
  }

  /**
   * 获取当前运行中的 Ollama 模型列表（使用 /api/ps 端点）
   * @returns 运行中的模型列表
   */
  async listRunningModels(): Promise<OllamaRunningModel[]> {
    const data = await fetchJson<OllamaRunningModelListResponse>(`${OLLAMA_API_BASE_URL}/ps`);
    return data.models || [];
  }

  /**
   * 显示模型详细信息（使用 /api/show 端点）
   * @param request 显示模型信息请求参数
   * @returns 模型详细信息
   */
  async showModel(request: OllamaShowRequest): Promise<OllamaShowResponse> {
    return fetchJson<OllamaShowResponse>(`${OLLAMA_API_BASE_URL}/show`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: request.name,
        verbose: request.verbose,
      }),
    });
  }

  /**
   * 创建模型（使用 /api/create 端点）
   * @param request 创建模型请求参数
   * @param onProgress 进度回调函数
   * @returns 成功返回 true，失败返回 false
   */
  async createModel(
    request: OllamaCreateRequest,
    onProgress?: (status: string) => void
  ): Promise<boolean> {
    const response = await fetch(`${OLLAMA_API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: request.name,
        modelfile: request.modelfile,
        stream: request.stream ?? !!onProgress,
        path: request.path,
      }),
    });

    if (!response.ok || !response.body) {
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

      throw new OllamaError(response.status, '/create', errorMessage);
    }

    // 如果需要跟踪进度
    if (onProgress && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (typeof data === 'object' && data !== null && data.status) {
              onProgress(data.status);
            }
          } catch (e) {
            console.warn('解析 JSON 响应失败:', line, e);
          }
        }
      }
    }

    return true;
  }

  /**
   * 复制模型（使用 /api/copy 端点）
   * @param request 复制模型请求参数
   * @returns 成功返回 true，失败抛出异常
   */
  async copyModel(request: OllamaCopyRequest): Promise<boolean> {
    const response = await fetch(`${OLLAMA_API_BASE_URL}/copy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: request.source,
        destination: request.destination,
      }),
    });

    if (!response.ok) {
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

      throw new OllamaError(response.status, '/copy', errorMessage);
    }

    return true;
  }

  /**
   * 删除模型（使用 /api/delete 端点）
   * @param request 删除模型请求参数
   * @returns 成功返回 true，失败抛出异常
   */
  async deleteModel(request: OllamaDeleteRequest): Promise<boolean> {
    const response = await fetch(`${OLLAMA_API_BASE_URL}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
      }),
    });

    if (!response.ok) {
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

      throw new OllamaError(response.status, '/delete', errorMessage);
    }

    return true;
  }

  /**
   * 拉取/下载一个模型（使用 /api/pull 端点）
   * @param request 拉取模型请求参数
   * @param onProgress 进度回调函数
   * @returns 成功返回 true，失败返回 false
   */
  async pullModel(
    request: OllamaPullRequest,
    onProgress?: (progress: OllamaProgressResponse) => void
  ): Promise<boolean> {
    const response = await fetch(`${OLLAMA_API_BASE_URL}/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        stream: request.stream ?? !!onProgress,
        insecure: request.insecure,
      }),
    });

    if (!response.ok || !response.body) {
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

      throw new OllamaError(response.status, '/pull', errorMessage);
    }

    // 如果需要跟踪进度
    if (onProgress && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (typeof data === 'object' && data !== null && data.status) {
              onProgress(data as OllamaProgressResponse);
            }
          } catch (e) {
            console.warn('解析 JSON 响应失败:', line, e);
          }
        }
      }
    }

    return true;
  }

  /**
   * 推送模型到库（使用 /api/push 端点）
   * @param request 推送模型请求参数
   * @param onProgress 进度回调函数
   * @returns 成功返回 true，失败抛出异常
   */
  async pushModel(
    request: OllamaPushRequest,
    onProgress?: (progress: OllamaProgressResponse) => void
  ): Promise<boolean> {
    const response = await fetch(`${OLLAMA_API_BASE_URL}/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        insecure: request.insecure,
        stream: request.stream ?? !!onProgress,
      }),
    });

    if (!response.ok || !response.body) {
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

      throw new OllamaError(response.status, '/push', errorMessage);
    }

    // 如果需要跟踪进度
    if (onProgress && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line) as OllamaProgressResponse;
            onProgress(data);
          } catch (e) {
            console.warn('解析 JSON 响应失败:', line, e);
          }
        }
      }
    }

    return true;
  }

  /**
   * 生成嵌入向量（使用 /api/embed 端点）
   * @param request 嵌入请求参数
   * @returns 嵌入向量响应
   */
  async embed(request: OllamaEmbedRequest): Promise<OllamaEmbedResponse> {
    return fetchJson<OllamaEmbedResponse>(`${OLLAMA_API_BASE_URL}/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        input: request.input,
        truncate: request.truncate,
        options: request.options || {},
        keep_alive: request.keep_alive,
      }),
    });
  }

  /**
   * 生成嵌入向量（使用旧版 /api/embeddings 端点）
   * @param request 嵌入请求参数
   * @returns 嵌入向量响应
   */
  async embeddings(request: OllamaEmbeddingsRequest): Promise<OllamaEmbeddingsResponse> {
    return fetchJson<OllamaEmbeddingsResponse>(`${OLLAMA_API_BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        prompt: request.prompt,
        options: request.options || {},
        keep_alive: request.keep_alive,
      }),
    });
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

  /**
   * 获取 Ollama 版本信息
   * @returns 版本信息
   */
  async getVersion(): Promise<string> {
    try {
      const response = await fetchJson<OllamaVersionResponse>(`${OLLAMA_API_BASE_URL}/version`);
      return response.version;
    } catch (error) {
      if (error instanceof OllamaError) {
        throw error;
      }
      throw new OllamaError(0, '/version', error instanceof Error ? error.message : String(error));
    }
  }
}

// 导出单例实例
export const ollamaService = new OllamaService();
