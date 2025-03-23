/**
 * 日期工具函数 - 封装date-fns功能
 */
import { format, isThisWeek, isThisYear, isToday, isYesterday } from 'date-fns';

/**
 * 智能日期格式化函数
 * 根据时间距离当前的远近和详细程度，返回不同的格式
 * 
 * 基本模式 (详细=false)：
 * - 1分钟内：刚刚
 * - 1小时内：X分钟前
 * - 今天内：HH:mm
 * - 昨天：昨天 HH:mm
 * - 本周内：周X HH:mm
 * - 本年内：MM-DD
 * - 更早：YYYY-MM-DD
 * 
 * 详细模式 (详细=true)：
 * - 1分钟内：刚刚
 * - 1小时内：X分钟前
 * - 今天内：HH:mm
 * - 昨天：昨天 HH:mm
 * - 本年内：MM-DD HH:mm
 * - 更早：YYYY-MM-DD HH:mm
 *
 * @param date 日期对象或ISO日期字符串
 * @param detailed 是否显示详细时间（包含时分）
 * @returns 格式化后的友好时间字符串
 */
export function formatDate(date: Date | string | null | undefined, detailed: boolean = false): string {
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
  if (isThisWeek(dateObj, { weekStartsOn: 1 }) && !detailed) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${weekDays[dateObj.getDay()]} ${time}`;
  }
  
  // 本年内: 根据详细程度决定格式
  if (isThisYear(dateObj)) {
    return detailed ? 
      format(dateObj, 'MM-dd HH:mm') : 
      format(dateObj, 'MM-dd');
  }
  
  // 更早: 根据详细程度决定格式
  return detailed ? 
    format(dateObj, 'yyyy-MM-dd HH:mm') : 
    format(dateObj, 'yyyy-MM-dd');
}
