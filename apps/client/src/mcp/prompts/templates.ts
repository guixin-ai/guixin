import { z } from "zod";

// 文本分析提示模板
export const analyzeTextSchema = {
  text: z.string()
};

/**
 * 生成文本分析提示
 */
export function generateAnalyzeTextPrompt({ text }: { text: string }) {
  return {
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `请分析以下文本，提供关键点和摘要：\n\n${text}`
      }
    }]
  };
}

// 文档总结提示模板
export const summarizeDocumentSchema = {
  document: z.string(),
  maxLength: z.number().optional()
};

/**
 * 生成文档总结提示
 */
export function generateSummarizeDocumentPrompt(
  { document, maxLength = 200 }: { document: string; maxLength?: number }
) {
  return {
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `请总结以下文档内容，总结长度不超过${maxLength}字：\n\n${document}`
      }
    }]
  };
} 