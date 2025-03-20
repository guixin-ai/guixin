/**
 * 联系人服务 - 提供联系人相关的API接口
 */
import { Contact, ContactGroup, ContactsResponse, GroupedContactsResponse } from '@/types/contact';
import { 
  ContactListFetchException, 
  ContactGroupFetchException, 
  ContactDetailFetchException 
} from '@/errors/service.errors';

/**
 * 联系人服务类
 */
class ContactService {
  // 单例实例
  private static instance: ContactService;
  
  // 模拟联系人数据
  private mockContacts: Contact[] = [
    { id: 'a1', name: '阿里巴巴', avatar: '阿', pinyin: 'alibaba' },
    { id: 'a2', name: '阿童木', avatar: '阿', pinyin: 'atom' },
    { id: 'b1', name: '白起', avatar: '白', pinyin: 'baiqi' },
    { id: 'b2', name: '班主任', avatar: '班', pinyin: 'banzhuren' },
    { id: 'c1', name: '陈奕迅', avatar: '陈', pinyin: 'chenyixun' },
    { id: 'l1', name: '老婆', avatar: '老', pinyin: 'laopo' },
    { id: 'w1', name: '王小波', avatar: '王', pinyin: 'wangxiaobo' },
    { id: 'z1', name: '张三', avatar: '张', pinyin: 'zhangsan' },
  ];
  
  // 私有构造函数，防止外部实例化
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  public static getInstance(): ContactService {
    if (!ContactService.instance) {
      ContactService.instance = new ContactService();
    }
    return ContactService.instance;
  }
  
  /**
   * 获取联系人列表
   */
  public async getContacts(): Promise<ContactsResponse> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 按拼音排序
      const sortedContacts = [...this.mockContacts].sort((a, b) => {
        if (!a.pinyin || !b.pinyin) return 0;
        return a.pinyin.localeCompare(b.pinyin);
      });
      
      return {
        contacts: sortedContacts,
        total: sortedContacts.length
      };
    } catch (error) {
      console.error('获取联系人列表失败:', error);
      throw new ContactListFetchException();
    }
  }
  
  /**
   * 获取按字母分组的联系人
   */
  public async getGroupedContacts(): Promise<GroupedContactsResponse> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 先按拼音排序
      const sortedContacts = [...this.mockContacts].sort((a, b) => {
        if (!a.pinyin || !b.pinyin) return 0;
        return a.pinyin.localeCompare(b.pinyin);
      });
      
      // 分组
      const groups: ContactGroup[] = [];
      let currentLetter = '';
      
      sortedContacts.forEach(contact => {
        const firstLetter = contact.pinyin?.[0].toUpperCase() || '#';
        
        if (currentLetter !== firstLetter) {
          currentLetter = firstLetter;
          groups.push({ letter: firstLetter, contacts: [contact] });
        } else {
          groups[groups.length - 1].contacts.push(contact);
        }
      });
      
      return {
        groups,
        total: sortedContacts.length
      };
    } catch (error) {
      console.error('获取分组联系人失败:', error);
      throw new ContactGroupFetchException();
    }
  }
  
  /**
   * 根据ID获取联系人详情
   */
  public async getContactById(id: string): Promise<Contact | null> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const contact = this.mockContacts.find(contact => contact.id === id);
      return contact || null;
    } catch (error) {
      console.error(`获取联系人 ${id} 详情失败:`, error);
      throw new ContactDetailFetchException(id);
    }
  }
}

// 导出联系人服务单例
export const contactService = ContactService.getInstance(); 