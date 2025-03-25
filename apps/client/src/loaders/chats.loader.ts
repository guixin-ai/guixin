import { data } from 'react-router-dom';
import { chatCommands, ChatListItemResponse } from '../commands/chat.commands';
import { ChatItem } from '@/types/chat';

/**
 * 聊天列表页面的数据加载器
 * 获取所有聊天会话
 */
export const chatsLoader = async () => {
  try {
    // 获取聊天列表
    const chatListResponse = await chatCommands.getCurrentUserChatList();

    // 转换为前端模型
    const chats: ChatItem[] = chatListResponse.chats.map((chat: ChatListItemResponse) => ({
      id: chat.id,
      name: chat.name,
      avatar: [chat.avatar || chat.name.charAt(0)], // 使用名称首字符作为默认头像，注意这里应该是数组
      lastMessage: chat.last_message || '',
      timestamp: chat.timestamp || chat.created_at || new Date().toISOString(),
      unread: chat.unread || 0
    }));

    // 使用data包裹成功响应
    return data({ 
      success: true,
      chats
    }, { status: 200 });
  } catch (error) {
    // 捕获并处理错误
    console.error('加载聊天列表失败:', error);
    
    // 返回错误响应
    return data({
      success: false,
      error: `加载聊天列表失败: ${error instanceof Error ? error.message : String(error)}`,
      chats: [] // 提供空聊天列表作为默认值
    }, { status: 500 });
  }
}; 