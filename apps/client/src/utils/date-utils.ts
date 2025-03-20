/**
 * 日期工具函数 - 封装date-fns功能
 */
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 微信风格的时间格式化函数
 * 根据时间距离当前的远近，返回不同的格式：
 * - 今天内：时:分，如 12:30
 * - 昨天：昨天 时:分，如 昨天 20:30
 * - 本周内：周几 时:分，如 周一 08:00
 * - 本年内：月-日 时:分，如 05-20 09:15
 * - 更早：年-月-日 时:分，如 2022-01-01 10:30
 *
 * @param date 日期对象或ISO日期字符串
 * @returns 格式化后的友好时间字符串
 */
export function formatChatTime(date: Date | string | null | undefined): string {
  if (!date) return '';

  // 转换输入为Date对象
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    console.warn('无效的日期格式', date);
    return '';
  }

  const now = new Date();
  
  // 时间差（毫秒）
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  
  // 时间格式
  const timeFormat = 'HH:mm';
  const time = format(dateObj, timeFormat);

  // 1分钟内: 刚刚
  if (diffMin < 1) {
    return '刚刚';
  }
  
  // 1小时内: X分钟前
  if (diffMin < 60) {
    return `${diffMin}分钟前`;
  }
  
  // 今天内: 时:分
  if (isToday(dateObj)) {
    return time;
  }
  
  // 昨天: 昨天 时:分
  if (isYesterday(dateObj)) {
    return `昨天 ${time}`;
  }
  
  // 本周内: 周几 时:分
  if (isThisWeek(dateObj, { weekStartsOn: 1 })) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${weekDays[dateObj.getDay()]} ${time}`;
  }
  
  // 本年内: MM-DD 
  if (isThisYear(dateObj)) {
    return format(dateObj, 'MM-dd');
  }
  
  // 更早: YYYY-MM-DD
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * 获取更详细的聊天时间，用于聊天详情页
 * 在聊天详情中显示的时间比列表中更详细
 * 
 * @param date 日期对象或ISO日期字符串
 * @returns 格式化后的详细时间字符串
 */
export function formatDetailedChatTime(date: Date | string | null | undefined): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.warn('无效的日期格式', date);
    return '';
  }
  
  const now = new Date();
  
  // 今天内: 时:分
  if (isToday(dateObj)) {
    return format(dateObj, 'HH:mm');
  }
  
  // 昨天: 昨天 时:分
  if (isYesterday(dateObj)) {
    return `昨天 ${format(dateObj, 'HH:mm')}`;
  }
  
  // 本年内: MM-DD HH:mm
  if (isThisYear(dateObj)) {
    return format(dateObj, 'MM-dd HH:mm');
  }
  
  // 更早: YYYY-MM-DD HH:mm
  return format(dateObj, 'yyyy-MM-dd HH:mm');
}
