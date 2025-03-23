import { data } from 'react-router-dom';
import { contactCommands } from '@/commands';
import { Contact } from '@/types/contact';

/**
 * 新建聊天页面的数据加载器
 * 获取所有联系人作为可选的聊天成员
 */
export const newChatLoader = async () => {
  try {
    // 获取联系人列表
    const contactsFromApi = await contactCommands.getCurrentUserContacts();
    
    // 转换为前端所需的联系人格式
    const contacts: Contact[] = contactsFromApi.map(contact => ({
      id: contact.id,
      name: contact.name,
      avatar: contact.name.charAt(0),
      pinyin: '' // 拼音在此处不再处理，如果需要可在UI层处理
    }));

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