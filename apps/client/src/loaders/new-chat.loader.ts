import { data } from 'react-router-dom';
import { contactService } from '@/services/contact.service';
import { Contact } from '@/types/contact';

/**
 * 新建聊天页面的数据加载器
 * 获取所有联系人作为可选的聊天成员
 */
export const newChatLoader = async () => {
  try {
    // 获取联系人列表
    const contactsResponse = await contactService.getContacts();
    const contacts: Contact[] = contactsResponse.contacts || [];

    // 返回成功响应
    return data({ 
      success: true,
      contacts 
    }, { status: 200 });
  } catch (error) {
    // 捕获并处理错误
    console.error('加载联系人列表失败:', error);
    
    // 返回错误响应
    return data({
      success: false,
      error: `加载联系人列表失败: ${error instanceof Error ? error.message : String(error)}`,
      contacts: [] // 提供空联系人列表作为默认值
    }, { status: 500 });
  }
}; 