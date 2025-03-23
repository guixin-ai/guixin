/**
 * 联系人服务 - 提供联系人相关的API接口
 */
import { Contact, ContactGroup, ContactsResponse, GroupedContactsResponse, ContactDetail, ContactDetailResponse } from '@/types/contact';
import { 
  ContactListFetchException, 
  ContactGroupFetchException, 
  ContactDetailFetchException 
} from '@/errors/service.errors';
import { contactCommands, userCommands } from '@/commands';
import { pinyin } from 'pinyin-pro';

/**
 * 联系人服务类
 */
class ContactService {
  // 单例实例
  private static instance: ContactService;
  
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
   * 从后端全局状态中获取当前用户的联系人
   */
  public async getContacts(): Promise<ContactsResponse> {
    try {
      // 调用指令层获取当前用户的联系人列表
      const contactsData = await contactCommands.getCurrentUserContacts();
      
      // 转换为前端所需的数据格式
      const contacts = contactsData.map(contact => ({
        id: contact.id,
        name: contact.name,
        avatar: contact.name.charAt(0), // 使用名称首字符作为头像
        pinyin: this.getPinyin(contact.name), // 获取拼音
      }));
      
      // 按拼音排序
      const sortedContacts = [...contacts].sort((a, b) => {
        if (!a.pinyin || !b.pinyin) return 0;
        return a.pinyin.localeCompare(b.pinyin);
      });
      
      return {
        contacts: sortedContacts,
        total: sortedContacts.length
      };
    } catch (error) {
      console.error('获取当前用户联系人列表失败:', error);
      throw new ContactListFetchException();
    }
  }
  
  /**
   * 获取按字母分组的联系人
   */
  public async getGroupedContacts(): Promise<GroupedContactsResponse> {
    try {
      const { contacts } = await this.getContacts();
      
      // 分组
      const groups: ContactGroup[] = [];
      let currentLetter = '';
      
      // 按首字母分组
      contacts.forEach(contact => {
        const firstLetter = this.getFirstLetter(contact.name); // 获取首字母
        
        if (currentLetter !== firstLetter) {
          currentLetter = firstLetter;
          groups.push({ letter: firstLetter, contacts: [contact] });
        } else {
          groups[groups.length - 1].contacts.push(contact);
        }
      });
      
      return {
        groups,
        total: contacts.length
      };
    } catch (error) {
      console.error('获取分组联系人失败:', error);
      throw new ContactGroupFetchException();
    }
  }
  
  /**
   * 根据ID获取联系人基本信息
   */
  public async getContactById(id: string): Promise<Contact | null> {
    try {
      const { contacts } = await this.getContacts();
      const contact = contacts.find(contact => contact.id === id);
      return contact || null;
    } catch (error) {
      console.error(`获取联系人 ${id} 基本信息失败:`, error);
      throw new ContactDetailFetchException(id);
    }
  }

  /**
   * 根据ID获取联系人详情信息
   */
  public async getContactDetail(id: string): Promise<ContactDetailResponse | null> {
    try {
      const contact = await this.getContactById(id);
      
      if (!contact) {
        return null;
      }
      
      try {
        // 从指令层获取用户详情数据
        // 注意：由于后端暂时缺少get_user命令，这里可能会失败
        // 使用get_current_user作为临时方案
        const userData = await userCommands.getUser({ id });
        
        const contactDetail: ContactDetail = {
          id: userData.id,
          name: userData.name,
          description: userData.description || undefined,
          avatar: userData.name.charAt(0)
        };
        
        return {
          contact: contactDetail
        };
      } catch (error) {
        // 如果获取用户详情失败，则使用基本联系人信息构建详情
        console.warn(`无法获取用户详情，使用基本联系人信息作为替代。错误:`, error);
        
        const contactDetail: ContactDetail = {
          id: contact.id,
          name: contact.name,
          description: undefined,
          avatar: contact.name.charAt(0)
        };
        
        return {
          contact: contactDetail
        };
      }
    } catch (error) {
      console.error(`获取联系人 ${id} 详情失败:`, error);
      throw new ContactDetailFetchException(id);
    }
  }
  
  /**
   * 添加联系人
   */
  public async addContact(contactId: string): Promise<void> {
    try {
      await contactCommands.addCurrentUserContact(contactId);
    } catch (error) {
      console.error('添加联系人失败:', error);
      throw new Error(String(error));
    }
  }
  
  /**
   * 删除联系人
   */
  public async removeContact(contactId: string): Promise<void> {
    try {
      await contactCommands.removeCurrentUserContact(contactId);
    } catch (error) {
      console.error('删除联系人失败:', error);
      throw new Error(String(error));
    }
  }
  
  /**
   * 获取汉字拼音
   * 使用pinyin-pro包处理中文拼音
   */
  private getPinyin(name: string): string {
    if (!name || name.length === 0) return '';
    
    // 获取不带声调的完整拼音，适合排序
    return pinyin(name, {
      toneType: 'none',    // 不带声调
      type: 'array',       // 返回拼音数组
      nonZh: 'consecutive' // 非中文字符连续输出
    }).join('').toLowerCase();
  }

  /**
   * 获取名称的拼音首字母（用于分组）
   */
  private getFirstLetter(name: string): string {
    if (!name || name.length === 0) return '#';
    
    // 获取首字母
    const firstPinyin = pinyin(name.charAt(0), {
      pattern: 'first',   // 仅返回首字母
      toneType: 'none',   // 不带声调
      nonZh: 'consecutive' // 非中文直接返回
    });
    
    const letter = firstPinyin.toUpperCase();
    
    // 检查是否是A-Z的字母，如果不是，归类到#组
    return /[A-Z]/.test(letter) ? letter : '#';
  }
}

// 导出联系人服务单例
export const contactService = ContactService.getInstance(); 