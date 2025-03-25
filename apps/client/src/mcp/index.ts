import { mcpServer } from './server';

// 定义工具调用结果的接口
interface ToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

// 定义资源内容的接口
interface ResourceContent {
  contents: Array<{ uri: string; text: string }>;
}

/**
 * MCP服务接口，提供对MCP服务器功能的访问
 */
class McpService {
  constructor() {
    // 服务器实例已经在server.ts中创建
  }

  /**
   * 获取服务器信息
   */
  getInfo() {
    return {
      name: "本地MCP服务",
      version: "1.0.0",
      capabilities: {
        resources: {},
        tools: {},
        prompts: {}
      }
    };
  }

  /**
   * 调用工具
   * @param name 工具名称
   * @param args 工具参数
   */
  async callTool(name: string, args: Record<string, any>): Promise<ToolResult> {
    // 模拟工具调用过程
    switch (name) {
      case "calculator":
        if (!args.a || !args.b || !args.operation) {
          return {
            content: [{ type: "text", text: "错误：缺少必要参数" }],
            isError: true
          };
        }
        break;
      case "search":
        if (!args.query) {
          return {
            content: [{ type: "text", text: "错误：缺少查询参数" }],
            isError: true
          };
        }
        break;
      default:
        return {
          content: [{ type: "text", text: `错误：未知工具 "${name}"` }],
          isError: true
        };
    }

    try {
      // 实际调用mcpServer中的工具
      return {
        content: [{ 
          type: "text", 
          text: `模拟工具[${name}]调用结果，参数: ${JSON.stringify(args)}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `工具调用错误: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true
      };
    }
  }

  /**
   * 获取资源内容
   * @param uri 资源URI
   */
  async getResource(uri: string): Promise<ResourceContent> {
    // 解析URI
    if (uri.startsWith("notes://")) {
      const id = uri.replace("notes://", "");
      return {
        contents: [{
          uri,
          text: `模拟笔记内容 - ID: ${id}`
        }]
      };
    } else if (uri.startsWith("config://")) {
      return {
        contents: [{
          uri,
          text: JSON.stringify({
            theme: "light",
            language: "zh-CN",
            features: ["notes", "chat", "tools"]
          }, null, 2)
        }]
      };
    } else {
      return {
        contents: [{
          uri,
          text: `资源未找到: ${uri}`
        }]
      };
    }
  }

  /**
   * 获取可用工具列表
   */
  getAvailableTools(): string[] {
    return ["calculator", "search"];
  }

  /**
   * 获取可用资源列表
   */
  getAvailableResources(): string[] {
    return ["notes://", "config://app"];
  }
}

// 导出单例实例
export const mcpService = new McpService(); 