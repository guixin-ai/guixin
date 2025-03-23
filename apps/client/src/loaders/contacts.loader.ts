import { data } from 'react-router-dom';
import { contactCommands } from '../commands/contact.commands';
import { Contact } from '@/types/contact';

/**
 * 联系人列表页面的数据加载器
 * 获取所有联系人
 */
export const contactsLoader = async () => {
  try {
    // 获取联系人列表
    const contactsData = await contactCommands.getCurrentUserContacts();

    // 转换为前端模型
    const contacts: Contact[] = contactsData.map(contact => ({
      id: contact.id,
      name: contact.name,
      avatar: contact.name.charAt(0), // 使用名称首字符作为头像
      pinyin: '', // 不再使用拼音排序
      description: contact.description || undefined,
      isAi: contact.is_ai
    }));

    // 使用data包裹成功响应
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