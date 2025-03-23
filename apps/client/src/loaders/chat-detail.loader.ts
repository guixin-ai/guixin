import { data } from 'react-router-dom';
import { chatCommands } from '@/commands';
import { ChatDetail, ChatMessage } from '@/types/chat';

/**
 * 聊天详情页面的数据加载器
 * 根据聊天ID获取详细信息和聊天消息
 */
export const chatDetailLoader = async ({ params }: { params: { chatId?: string } }) => {
  const { chatId } = params;

  if (!chatId) {
    return data({
      success: false,
      error: '聊天ID不能为空',
      chat: null,
      messages: []
    }, { status: 400 });
  }

  try {
    // 获取聊天列表
    const chatListResponse = await chatCommands.getCurrentUserChatList();
    // 从列表中查找指定ID的聊天
    const chatItem = chatListResponse.chats.find(chat => chat.id === chatId);
    
    if (!chatItem) {
      return data({
        success: false,
        error: `聊天 ${chatId} 不存在`,
        chat: null,
        messages: []
      }, { status: 404 });
    }

    // 暂时没有获取聊天消息的接口，返回空数组
    const messages: ChatMessage[] = [];
    
    // 创建聊天详情对象
    const chatDetail: ChatDetail = {
      id: chatItem.id,
      name: chatItem.name,
      avatar: [chatItem.avatar], // 确保avatar是数组格式
      isAI: true, // 假设所有聊天都是AI
      members: [
        {
          id: 'current-user',
          name: '我',
          avatar: '我',
          username: '@自如'
        },
        {
          id: chatItem.id,
          name: chatItem.name,
          avatar: chatItem.avatar,
          isAI: true,
          username: '@自如'
        }
      ]
    };

    // 返回成功响应
    return data({
      success: true,
      chat: chatDetail,
      messages
    }, { status: 200 });
  } catch (error) {
    console.error(`加载聊天详情失败 (ID: ${chatId}):`, error);
    
    return data({
      success: false,
      error: `加载聊天详情失败: ${error instanceof Error ? error.message : String(error)}`,
      chat: null,
      messages: []
    }, { status: 500 });
  }
}; 