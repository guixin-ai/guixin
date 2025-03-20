/**
 * 联系人模型 - 定义联系人相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { contactService } from '@/services/contact.service';
import { Contact, ContactDetail } from '@/types/contact';
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
  getContacts: () => Promise<Contact[]>;
  getContactDetail: (id: string) => Promise<ContactDetail | null>;
  getContactById: (id: string) => Promise<Contact | null>;

  // 初始化方法
  initializeList: () => Promise<void>;
  initializeContactDetail: (id: string) => Promise<ContactDetail | null>;
}

// 示例数据
const initialContacts: Contact[] = [];

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
      
      // 获取联系人列表 - 检查初始化状态并返回数据
      getContacts: async () => {
        const state = get();
        
        // 如果已经初始化，则直接返回缓存数据
        if (state.initializedList) {
          return state.contacts;
        }
        
        // 如果未初始化，则调用初始化方法
        try {
          await get().initializeList();
          return get().contacts;
        } catch (error) {
          console.error(`获取联系人列表失败: ${error}`);
          return [];
        }
      },
      
      // 获取联系人详情 - 判断是否已初始化并返回数据
      getContactDetail: async (id: string) => {
        const state = get();
        
        // 如果已经初始化，则直接返回缓存数据
        if (state.initializedDetailIds[id]) {
          return state.contactDetails[id] || null;
        }
        
        // 如果未初始化，则调用初始化方法
        try {
          return await get().initializeContactDetail(id);
        } catch (error) {
          console.error(`获取联系人详情失败: ${error}`);
          return null;
        }
      },

      // 根据ID获取联系人 - 检查初始化状态并返回数据
      getContactById: async (id: string) => {
        const state = get();
        
        // 如果已经初始化，则直接返回缓存数据
        if (state.initializedList) {
          return state.contacts.find(contact => contact.id === id) || null;
        }
        
        // 如果未初始化，则调用初始化方法
        try {
          await get().initializeList();
          return get().contacts.find(contact => contact.id === id) || null;
        } catch (error) {
          console.error(`获取联系人失败: ${error}`);
          return null;
        }
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
