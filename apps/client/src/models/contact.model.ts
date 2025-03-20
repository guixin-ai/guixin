/**
 * 联系人模型 - 定义联系人相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { contactService } from '@/services/contact.service';
import { Contact, ContactGroup, ContactDetail } from '@/types/contact';
import { ContactNotFoundException, ContactListInitFailedException, ContactDetailInitFailedException } from '@/errors/contact.errors';
import { devtools } from 'zustand/middleware';

// 联系人状态接口
export interface ContactState {
  // 联系人列表
  contacts: Contact[];
  // 联系人详情，以联系人ID为键
  contactDetails: Record<string, ContactDetail>;
  // 是否已初始化联系人列表
  initializedList: boolean;
  // 已初始化的联系人详情ID集合
  initializedDetailIds: Record<string, boolean>;

  // 操作方法
  fetchAllContacts: () => Promise<void>;
  fetchContactById: (id: string) => Promise<Contact | null>;
  fetchContactDetail: (id: string) => Promise<ContactDetail | null>;
  searchContacts: (query: string) => Contact[];
  addContact: (contact: Contact) => void;
  getGroupedContacts: () => Promise<void>;
  getGroups: () => ContactGroup[];
  getContacts: () => Contact[];
  getContactDetail: (id: string) => ContactDetail | null;

  // 初始化方法
  initializeList: () => Promise<void>;
  initializeContactDetail: (id: string) => Promise<ContactDetail | null>;
}

// 示例数据
const initialContacts: Contact[] = [];

// 按拼音首字母分组联系人
const groupContactsByPinyin = (contacts: Contact[]): ContactGroup[] => {
  // 创建一个Map用于存储分组
  const groupMap = new Map<string, Contact[]>();

  // 遍历联系人，按拼音首字母分组
  contacts.forEach(contact => {
    // 获取拼音首字母，如果没有拼音则使用#
    const firstLetter = contact.pinyin ? contact.pinyin.charAt(0).toUpperCase() : '#';

    // 获取或创建该字母的分组
    const group = groupMap.get(firstLetter) || [];
    group.push(contact);
    groupMap.set(firstLetter, group);
  });

  // 将Map转换为数组并排序
  const groups: ContactGroup[] = Array.from(groupMap.entries()).map(([letter, contacts]) => ({
    letter,
    contacts,
  }));

  // 按字母顺序排序
  return groups.sort((a, b) => a.letter.localeCompare(b.letter));
};

// 创建联系人状态存储
export const useContactStore = create(
  devtools(
    immer<ContactState>((set, get) => ({
      // 初始状态
      contacts: initialContacts,
      contactDetails: {},
      initializedList: false,
      initializedDetailIds: {},

      // 获取所有联系人
      fetchAllContacts: async () => {
        try {
          // 调用服务获取联系人列表
          const response = await contactService.getContacts();

          set(state => {
            state.contacts = response.contacts;
            state.initializedList = true;
          });
        } catch (error) {
          console.error('获取联系人列表失败:', error);
          throw error; // 重新抛出异常，让调用方处理
        }
      },

      // 根据ID获取联系人基本信息
      fetchContactById: async (id: string) => {
        try {
          // 从服务获取联系人基本信息
          const contact = await contactService.getContactById(id);
          if (!contact) {
            throw new ContactNotFoundException(id);
          }
          
          return contact;
        } catch (error) {
          console.error('获取联系人基本信息失败:', error);
          // 重新抛出异常，让调用方处理
          if (error instanceof ContactNotFoundException) {
            throw error;
          }
          // 其他错误包装后抛出
          throw new ContactNotFoundException(id);
        }
      },
      
      // 根据ID获取联系人详情信息
      fetchContactDetail: async (id: string) => {
        try {
          // 从服务获取联系人详情
          const response = await contactService.getContactDetail(id);
          if (!response) {
            throw new ContactNotFoundException(id);
          }
          
          // 更新到详情缓存
          set(state => {
            state.contactDetails[id] = response.contact;
            state.initializedDetailIds[id] = true;
          });
          
          return response.contact;
        } catch (error) {
          console.error('获取联系人详情失败:', error);
          // 重新抛出异常，让调用方处理
          if (error instanceof ContactNotFoundException) {
            throw error;
          }
          // 其他错误包装后抛出
          throw new ContactNotFoundException(id);
        }
      },

      // 搜索联系人
      searchContacts: (query: string) => {
        const { contacts } = get();
        return contacts.filter(contact => contact.name.toLowerCase().includes(query.toLowerCase()));
      },

      // 添加新联系人
      addContact: (contact: Contact) => {
        set(state => {
          state.contacts.push(contact);
          // 按拼音重新排序
          state.contacts.sort((a, b) => {
            if (!a.pinyin || !b.pinyin) return 0;
            return a.pinyin.localeCompare(b.pinyin);
          });
        });
      },

      // 获取分组联系人 - 仅从服务端获取联系人数据
      getGroupedContacts: async () => {
        try {
          const response = await contactService.getContacts();
          set(state => {
            state.contacts = response.contacts;
          });
        } catch (error) {
          console.error('获取分组联系人失败:', error);
          throw error; // 重新抛出异常，让调用方处理
        }
      },

      // 获取计算后的分组数据 - 直接返回内存数据
      getGroups: () => {
        const { contacts } = get();
        return groupContactsByPinyin(contacts);
      },
      
      // 获取联系人列表 - 直接返回内存数据
      getContacts: () => {
        return get().contacts;
      },
      
      // 获取联系人详情 - 直接返回内存数据
      getContactDetail: (id: string) => {
        return get().contactDetails[id] || null;
      },

      // 初始化联系人列表
      initializeList: async () => {
        const state = get();

        // 如果已经初始化，则直接返回
        if (state.initializedList) {
          return;
        }

        try {
          // 调用fetchAllContacts获取联系人列表
          await get().fetchAllContacts();
        } catch (error) {
          console.error('联系人列表初始化失败:', error);
          throw new ContactListInitFailedException(error);
        }
      },
      
      // 初始化联系人详情
      initializeContactDetail: async (id: string) => {
        const state = get();
        
        // 如果已经初始化该联系人详情，则直接返回缓存数据
        if (state.initializedDetailIds[id]) {
          return state.contactDetails[id] || null;
        }
        
        try {
          // 直接调用服务获取联系人详情
          const contactDetail = await get().fetchContactDetail(id);
          return contactDetail;
        } catch (error) {
          console.error(`初始化联系人 ${id} 的详情失败:`, error);
          // 抛出自定义异常
          throw new ContactDetailInitFailedException(id, error);
        }
      }
    })),
    {
      name: 'contact',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// 导出联系人状态钩子
export const useContact = () => useContactStore();
