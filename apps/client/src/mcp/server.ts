import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// 创建MCP服务器实例
export const createMcpServer = () => {
  const server = new McpServer({
    name: "本地MCP服务",
    version: "1.0.0"
  });

  // 注册静态资源
  server.resource(
    "app-config",
    "config://app",
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          theme: "light",
          language: "zh-CN",
          features: ["notes", "chat", "tools"]
        }, null, 2)
      }]
    })
  );

  // 注册动态资源 - 笔记
  server.resource(
    "notes",
    new ResourceTemplate("notes://{id}", { list: undefined }),
    async (uri, { id }) => {
      // 模拟笔记数据（实际应用中可以从数据库或其他存储获取）
      const notesData: Record<string, string> = {
        "123": "这是笔记123的内容",
        "456": "这是笔记456的内容",
        "789": "这是笔记789的内容"
      };

      const content = notesData[id] || `未找到ID为${id}的笔记`;
      
      return {
        contents: [{
          uri: uri.href,
          text: content
        }]
      };
    }
  );

  // 注册工具 - 计算器
  server.tool(
    "calculator",
    {
      a: z.number(),
      b: z.number(),
      operation: z.enum(["add", "subtract", "multiply", "divide"])
    },
    async ({ a, b, operation }) => {
      let result: number;
      
      switch (operation) {
        case "add":
          result = a + b;
          break;
        case "subtract":
          result = a - b;
          break;
        case "multiply":
          result = a * b;
          break;
        case "divide":
          if (b === 0) {
            return {
              content: [{ type: "text", text: "错误：除数不能为零" }],
              isError: true
            };
          }
          result = a / b;
          break;
      }
      
      return {
        content: [{ type: "text", text: String(result) }]
      };
    }
  );

  // 注册工具 - 搜索
  server.tool(
    "search",
    { query: z.string() },
    async ({ query }) => {
      // 模拟搜索结果
      const searchResults = [
        { title: "搜索结果1", snippet: "这是与查询相关的第一个结果。" },
        { title: "搜索结果2", snippet: "这是另一个相关结果。" },
        { title: "搜索结果3", snippet: "这是第三个结果。" }
      ];
      
      return {
        content: [{ 
          type: "text", 
          text: `搜索"${query}"的结果:\n\n` + 
                searchResults.map(r => `- ${r.title}: ${r.snippet}`).join("\n")
        }]
      };
    }
  );

  // 注册提示 - 文本分析
  server.prompt(
    "analyze-text",
    { text: z.string() },
    ({ text }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `请分析以下文本，提供关键点和摘要：\n\n${text}`
        }
      }]
    })
  );

  return server;
};

// 创建默认的MCP服务器实例
export const mcpServer = createMcpServer(); 