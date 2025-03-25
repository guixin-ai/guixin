/**
 * 解析资源URI
 * @param uri 资源URI字符串
 * @returns 解析后的资源信息
 */
export function parseResourceUri(uri: string): { scheme: string; path: string; params: Record<string, string> } {
  try {
    // 提取scheme
    const schemeMatch = uri.match(/^([a-z]+):\/\//);
    if (!schemeMatch) {
      throw new Error(`无效的URI格式: ${uri}`);
    }
    
    const scheme = schemeMatch[1];
    const path = uri.slice(schemeMatch[0].length);
    
    // 解析查询参数
    const [basePath, queryStr] = path.split('?');
    const params: Record<string, string> = {};
    
    if (queryStr) {
      queryStr.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      });
    }
    
    return { scheme, path: basePath, params };
  } catch (error) {
    console.error('解析URI出错:', error);
    return { scheme: '', path: '', params: {} };
  }
}

/**
 * 格式化日期
 * @param date 日期对象
 * @returns 格式化的日期字符串
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 深度合并对象
 * @param target 目标对象
 * @param source 来源对象
 * @returns 合并后的对象
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key as keyof typeof source])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key as keyof typeof source] });
        } else {
          (output as any)[key] = deepMerge(
            target[key as keyof typeof target] as any,
            source[key as keyof typeof source] as any
          );
        }
      } else {
        Object.assign(output, { [key]: source[key as keyof typeof source] });
      }
    });
  }
  
  return output;
}

/**
 * 检查值是否为对象
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
} 