import { z } from "zod";

// 计算器工具参数的schema
export const calculatorSchema = {
  a: z.number(),
  b: z.number(),
  operation: z.enum(["add", "subtract", "multiply", "divide"])
};

/**
 * 处理计算器工具调用
 */
export async function handleCalculator(
  { a, b, operation }: { a: number; b: number; operation: "add" | "subtract" | "multiply" | "divide" }
) {
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