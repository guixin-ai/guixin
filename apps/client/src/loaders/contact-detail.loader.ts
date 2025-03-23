import { LoaderFunctionArgs } from 'react-router-dom';
import { contactCommands } from '@/commands';

/**
 * 联系人详情页面加载器
 * 
 * 用于加载特定联系人的详细信息
 */
export const contactDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  const contactId = params.contactId;
  
  if (!contactId) {
    return {
      success: false,
      error: '联系人ID不能为空',
      contact: null
    };
  }
  
  try {
    // 从联系人列表中查找指定ID的联系人
    const contacts = await contactCommands.getCurrentUserContacts();
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) {
      return {
        success: false,
        error: `联系人 ${contactId} 不存在`,
        contact: null
      };
    }
    
    // 返回成功响应，格式化联系人详情
    return {
      success: true,
      contact: {
        id: contact.id,
        name: contact.name,
        description: contact.description || undefined,
        avatar: contact.name.charAt(0)
      }
    };
  } catch (error) {
    console.error(`加载联系人详情失败:`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '加载联系人详情时发生未知错误',
      contact: null
    };
  }
}; 