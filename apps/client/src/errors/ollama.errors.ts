/**
 * Ollama服务相关的异常定义
 */

// 基础Ollama异常类
export class OllamaBaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OllamaBaseError';
  }
}

// Ollama API调用异常
export class OllamaApiError extends OllamaBaseError {
  readonly status: number;
  readonly endpoint: string;
  readonly details: string;
  readonly originalResponse?: unknown;

  constructor(status: number, endpoint: string, message: string, originalResponse?: unknown) {
    super(`Ollama API 错误 [${endpoint}]: ${message}`);
    this.name = 'OllamaApiError';
    this.status = status;
    this.endpoint = endpoint;
    this.details = message;
    this.originalResponse = originalResponse;
  }
}

// Ollama 连接异常
export class OllamaConnectionError extends OllamaBaseError {
  readonly originalError?: unknown;
  
  constructor(message: string, originalError?: unknown) {
    super(`Ollama 连接错误: ${message}`);
    this.name = 'OllamaConnectionError';
    this.originalError = originalError;
  }
}

// Ollama 服务未启动异常
export class OllamaServiceUnavailableError extends OllamaConnectionError {
  constructor(originalError?: unknown) {
    super('Ollama 服务不可用或未启动', originalError);
    this.name = 'OllamaServiceUnavailableError';
  }
}

// Ollama 模型加载异常
export class OllamaModelLoadError extends OllamaApiError {
  readonly modelName: string;
  
  constructor(modelName: string, status: number, message: string, originalResponse?: unknown) {
    super(status, '/api/chat', `模型 ${modelName} 加载失败: ${message}`, originalResponse);
    this.name = 'OllamaModelLoadError';
    this.modelName = modelName;
  }
}

// Ollama 聊天流异常
export class OllamaChatStreamError extends OllamaApiError {
  readonly aborted: boolean;
  
  constructor(status: number, message: string, aborted: boolean = false, originalResponse?: unknown) {
    super(status, '/api/chat', message, originalResponse);
    this.name = 'OllamaChatStreamError';
    this.aborted = aborted;
  }
}

// Ollama 流被用户中断异常
export class OllamaStreamAbortedError extends OllamaBaseError {
  constructor(message: string = '流式生成被用户中断') {
    super(message);
    this.name = 'OllamaStreamAbortedError';
  }
}

// Ollama 响应解析异常
export class OllamaResponseParseError extends OllamaBaseError {
  readonly rawResponse: string;
  readonly originalError?: unknown;
  
  constructor(rawResponse: string, originalError?: unknown) {
    super('解析 Ollama 响应失败');
    this.name = 'OllamaResponseParseError';
    this.rawResponse = rawResponse;
    this.originalError = originalError;
  }
}

// Ollama 模型不存在异常
export class OllamaModelNotFoundError extends OllamaApiError {
  readonly modelName: string;
  
  constructor(modelName: string, status: number, message: string, originalResponse?: unknown) {
    super(status, '/api/chat', `模型 ${modelName} 不存在: ${message}`, originalResponse);
    this.name = 'OllamaModelNotFoundError';
    this.modelName = modelName;
  }
}

// Ollama 请求超时异常
export class OllamaTimeoutError extends OllamaConnectionError {
  readonly timeoutMs: number;
  
  constructor(timeoutMs: number, originalError?: unknown) {
    super(`Ollama 请求超时 (${timeoutMs}ms)`, originalError);
    this.name = 'OllamaTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

// Ollama 未知错误异常
export class OllamaUnknownError extends OllamaBaseError {
  readonly originalError?: unknown;
  
  constructor(message: string, originalError?: unknown) {
    super(`Ollama 未知错误: ${message}`);
    this.name = 'OllamaUnknownError';
    this.originalError = originalError;
  }
} 