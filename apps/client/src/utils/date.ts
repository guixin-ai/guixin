/**
 * 日期工具函数
 */

/**
 * 格式化相对时间
 * 将日期转换为相对时间格式，例如"刚刚"、"5分钟前"、"昨天"、"2天前"等
 * 
 * @param date 要格式化的日期对象
 * @returns 格式化后的相对时间字符串
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  // 今天的日期
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // 昨天的日期
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  // 本周第一天（星期日）
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - today.getDay());
  
  // 格式化时间为 HH:MM
  const formatTime = (d: Date) => {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // 格式化日期为 MM-DD
  const formatDate = (d: Date) => {
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };
  
  // 判断是否是同一天
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
  };
  
  // 判断是否是昨天
  const isYesterday = (d: Date) => {
    return isSameDay(d, yesterday);
  };
  
  // 判断是否是本周内（但不是今天或昨天）
  const isThisWeek = (d: Date) => {
    return d >= thisWeekStart && !isSameDay(d, today) && !isYesterday(d);
  };
  
  // 判断是否是今年
  const isThisYear = (d: Date) => {
    return d.getFullYear() === now.getFullYear();
  };
  
  if (diffSec < 60) {
    return '刚刚';
  } else if (diffMin < 60) {
    return `${diffMin}分钟前`;
  } else if (diffHour < 24) {
    return `${diffHour}小时前`;
  } else if (isSameDay(date, today)) {
    return formatTime(date);
  } else if (isYesterday(date)) {
    return `昨天 ${formatTime(date)}`;
  } else if (isThisWeek(date)) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${weekDays[date.getDay()]} ${formatTime(date)}`;
  } else if (isThisYear(date)) {
    return formatDate(date);
  } else {
    return `${date.getFullYear()}-${formatDate(date)}`;
  }
} 