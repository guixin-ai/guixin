/**
 * 日期工具函数 - 封装date-fns功能
 */
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化相对时间，以友好的方式显示
 * @param timestamp 时间戳或Date对象
 * @returns 格式化后的相对时间字符串
 */
export function formatRelativeTime(timestamp: number | Date | null): string {
  if (!timestamp) return '尚未检查';

  try {
    const ts = typeof timestamp === 'number' ? timestamp : timestamp.getTime();
    const now = Date.now();
    const diffMs = now - ts;

    // 少于10秒显示"刚刚"
    if (diffMs < 10 * 1000) {
      return '刚刚';
    }

    // 不到1小时的相对时间
    if (diffMs < 60 * 60 * 1000) {
      return formatDistanceToNow(ts, {
        locale: zhCN,
        addSuffix: true,
        includeSeconds: true,
      });
    }

    // 判断是否是同一天
    const today = new Date();
    const targetDate = new Date(ts);
    const isToday =
      today.getDate() === targetDate.getDate() &&
      today.getMonth() === targetDate.getMonth() &&
      today.getFullYear() === targetDate.getFullYear();

    if (isToday) {
      // 同一天显示"今天 HH:mm"
      return `今天 ${format(ts, 'HH:mm', { locale: zhCN })}`;
    }

    // 超过1天但小于7天显示星期几和时间
    if (diffMs < 7 * 24 * 60 * 60 * 1000) {
      return format(ts, 'EEEE HH:mm', { locale: zhCN });
    }

    // 超过7天显示完整日期
    return format(ts, 'yyyy-MM-dd HH:mm', { locale: zhCN });
  } catch (err) {
    // 如果date-fns出错，使用原始时间格式作为后备方案
    return new Date(timestamp).toLocaleString();
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节大小
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取指定日期的格式化字符串
 * @param date 日期对象或时间戳
 * @param formatStr 格式字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
  try {
    return format(date, formatStr, { locale: zhCN });
  } catch (err) {
    return new Date(date).toLocaleString();
  }
}

/**
 * 获取指定日期的时间部分
 * @param date 日期对象或时间戳
 * @returns 格式化后的时间字符串 (HH:mm:ss)
 */
export function formatTime(date: Date | number): string {
  return formatDate(date, 'HH:mm:ss');
}
