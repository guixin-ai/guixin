import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// 笔记资源模板
export const notesTemplate = new ResourceTemplate(
  "notes://{id}", 
  { list: undefined }
);

// 模拟笔记数据
const notesData: Record<string, string> = {
  "123": "这是笔记123的内容 - 关于项目计划",
  "456": "这是笔记456的内容 - 会议纪要",
  "789": "这是笔记789的内容 - 技术研究"
};

/**
 * 处理笔记资源请求
 */
export async function handleNotesResource(uri, { id }) {
  const content = notesData[id] || `未找到ID为${id}的笔记`;
  
  return {
    contents: [{
      uri: uri.href,
      text: content
    }]
  };
} 