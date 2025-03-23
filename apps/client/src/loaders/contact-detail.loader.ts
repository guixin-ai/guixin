import { LoaderFunctionArgs } from 'react-router-dom';
import { contactService } from '@/services/contact.service';

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
    // 使用contactService获取联系人详情
    const response = await contactService.getContactDetail(contactId);
    
    if (!response) {
      return {
        success: false,
        error: `联系人 ${contactId} 不存在`,
        contact: null
      };
    }
    
    // 返回成功响应
    return {
      success: true,
      contact: response.contact
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