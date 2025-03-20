/**
 * 联系人模型 - 定义联系人相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { contactService } from '@/services/contact.service';
import { Contact, ContactGroup } from '@/types/contact';


// 联系人状态接口
export interface ContactState {
  // 联系人列表
  contacts: Contact[];
  // 是否已初始化
  initialized: boolean;

  // 操作方法
  fetchAllContacts: () => Promise<void>;
  fetchContactById: (id: string) => Promise<Contact | null>;
  searchContacts: (query: string) => Contact[];
  addContact: (contact: Contact) => void;
  getGroupedContacts: () => Promise<void>;
  getGroups: () => ContactGroup[];
  
  // 初始化方法
  initialize: () => Promise<void>;
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
    contacts
  }));
  
  // 按字母顺序排序
  return groups.sort((a, b) => a.letter.localeCompare(b.letter));
};

// 创建联系人状态存储
export const useContactStore = create(
  immer<ContactState>((set, get) => ({
    // 初始状态
    contacts: initialContacts,
    initialized: false,

    // 获取所有联系人
    fetchAllContacts: async () => {
      try {
        // 调用服务获取联系人列表
        const response = await contactService.getContacts();
        
        set(state => {
          state.contacts = response.contacts;
          state.initialized = true;
        });
      } catch (error) {
        console.error('获取联系人列表失败:', error);
      }
    },

    // 根据ID获取联系人
    fetchContactById: async (id: string) => {
      try {
        // 先从本地状态查找
        const localContact = get().contacts.find(contact => contact.id === id);
        if (localContact) return localContact;
        
        // 如果本地没有，则调用服务获取
        return await contactService.getContactById(id);
      } catch (error) {
        console.error('获取联系人详情失败:', error);
        return null;
      }
    },

    // 搜索联系人
    searchContacts: (query: string) => {
      const { contacts } = get();
      return contacts.filter(contact => 
        contact.name.toLowerCase().includes(query.toLowerCase())
      );
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
        await contactService.getContacts().then(response => {
          set(state => {
            state.contacts = response.contacts;
          });
        });
      } catch (error) {
        console.error('获取分组联系人失败:', error);
      }
    },
    
    // 获取计算后的分组数据
    getGroups: () => {
      const { contacts } = get();
      return groupContactsByPinyin(contacts);
    },

    // 初始化方法
    initialize: async () => {
      const state = get();
      
      // 如果已经初始化，则直接返回
      if (state.initialized) {
        return;
      }
      
      try {
        // 调用fetchAllContacts获取联系人列表
        await get().fetchAllContacts();
        
        // 标记为已初始化（在fetchAllContacts中已经设置了）
      } catch (error) {
        console.error('联系人模型初始化失败:', error);
      }
    },
  }))
);

// 导出联系人状态钩子
export const useContact = () => useContactStore(); 