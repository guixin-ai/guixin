/**
 * 处理配置资源请求
 */
export async function handleConfigResource(uri: string) {
  // 应用配置信息
  const appConfig = {
    theme: "light",
    language: "zh-CN",
    features: ["notes", "chat", "tools"]
  };

  return {
    contents: [{
      uri,
      text: JSON.stringify(appConfig, null, 2)
    }]
  };
} 