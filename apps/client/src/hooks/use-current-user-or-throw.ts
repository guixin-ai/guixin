import { useUserStore } from '../models/user.model';
import { User } from '../types';
/**
 * 自定义Hook - 获取当前用户
 *
 * 如果用户不存在，会抛出异常
 * 使用示例:
 * ```
 * const user = useCurrentUser();
 * ```
 */
export function useCurrentUserOrThrow(): User {
  const { currentUser, loading, error } = useUserStore();

  // 如果用户不存在且不在加载中，直接抛出异常
  if (!loading && !currentUser) {
    throw new Error('当前用户不存在，请检查应用状态或重启应用');
  }

  // 如果用户存在，直接返回用户对象
  // 如果正在加载中，也返回null，由调用方处理
  return currentUser as User;
}
