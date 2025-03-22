/**
 * 用户数据转换器 - 提供各种用户数据类型之间的转换函数
 */
import { User } from '@/types/user';
import { UserInfoValidated } from '@/commands/user.commands';

/**
 * 将UserInfo转换为User
 * 
 * @param userInfo 从命令层获取的用户信息（经过Zod验证）
 * @returns 符合模型层要求的用户对象
 */
export function convertUserInfoToUser(userInfo: UserInfoValidated): User {
  return {
    id: userInfo.id,
    name: userInfo.name,
    description: userInfo.description || undefined, // 将null转为undefined
    isAi: userInfo.is_ai
  };
} 