import { useUser } from '../models/app.model';
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
  const { currentUser } = useUser();

  // 如果用户不存在，直接抛出异常
  if (!currentUser) {
    throw new Error('当前用户不存在，请检查应用状态或重启应用');
  }

  // 如果用户存在，直接返回用户对象
  return currentUser;
}
