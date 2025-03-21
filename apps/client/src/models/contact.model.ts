/**
 * 联系人模型 - 定义联系人相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Contact, ContactDetail } from '@/types/contact';
import { ContactNotFoundException, ContactDetailInitFailedException } from '@/errors/contact.errors';
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
  searchContacts: (query: string) => Contact[];
  addContact: (contact: Contact) => void;
  addContactDetail: (detail: ContactDetail) => void;
  getContacts: () => Contact[];
  getContactDetail: (id: string) => ContactDetail | null;
  getContactById: (id: string) => Contact | null;
  updateContactDetail: (id: string, updates: Partial<ContactDetail>) => ContactDetail | null;

  // 初始化方法 - 同步方法，接收联系人列表参数
  initializeList: (contacts: Contact[]) => void;
  initializeContactDetail: (id: string, contactDetail: ContactDetail) => void;
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

      // 搜索联系人
      searchContacts: (query: string) => {
        const { contacts } = get();
        return contacts.filter(contact => contact.name.toLowerCase().includes(query.toLowerCase()));
      },

      // 添加新联系人
      addContact: (contact: Contact) => {
        set(state => {
          // 添加到联系人列表
          state.contacts.push(contact);
          // 按拼音重新排序
          state.contacts.sort((a, b) => {
            if (!a.pinyin || !b.pinyin) return 0;
            return a.pinyin.localeCompare(b.pinyin);
          });
          
          // 同时添加联系人详情
          state.contactDetails[contact.id] = {
            id: contact.id,
            name: contact.name,
            avatar: contact.avatar,
            description: `联系人 ${contact.name}` // 提供一个默认描述
          };
          
          // 标记为已初始化
          state.initializedDetailIds[contact.id] = true;
        });
      },

      // 添加联系人详情
      addContactDetail: (detail: ContactDetail) => {
        // 验证必要字段
        if (!detail.id || !detail.name || !detail.avatar) {
          throw new Error(`联系人详情缺少必需字段: id=${detail.id}, name=${detail.name}, avatar=${detail.avatar}`);
        }
        
        set(state => {
          // 添加到详情缓存
          state.contactDetails[detail.id] = detail;
          // 标记为已初始化
          state.initializedDetailIds[detail.id] = true;
        });
      },
      
      // 获取联系人列表 - 同步方法，检查初始化状态并返回数据
      getContacts: () => {
        const state = get();
        
        // 如果已经初始化，则直接返回缓存数据
        if (state.initializedList) {
          return state.contacts;
        }
        
        // 如果未初始化，则返回空列表
        return [];
      },
      
      // 获取联系人详情 - 同步方法，判断是否已初始化并返回数据
      getContactDetail: (id: string) => {
        const state = get();
        
        // 如果已经初始化，则直接返回缓存数据
        if (state.initializedDetailIds[id]) {
          return state.contactDetails[id] || null;
        }
        
        // 如果未初始化，则返回null
        return null;
      },

      // 根据ID获取联系人 - 同步方法，检查初始化状态并返回数据
      getContactById: (id: string) => {
        const state = get();
        
        // 如果已经初始化，则直接返回缓存数据
        if (state.initializedList) {
          return state.contacts.find(contact => contact.id === id) || null;
        }
        
        // 如果未初始化，则返回null
        return null;
      },

      // 初始化联系人列表 - 同步方法，接收联系人数据参数
      initializeList: (contacts: Contact[]) => {
        set(state => {
          state.contacts = contacts;
          state.initializedList = true;
        });
      },
      
      // 初始化联系人详情 - 同步方法，接收详情参数
      initializeContactDetail: (id: string, contactDetail: ContactDetail) => {
        set(state => {
          state.contactDetails[id] = contactDetail;
          state.initializedDetailIds[id] = true;
        });
      },

      // 更新联系人详情 - 同步方法
      updateContactDetail: (id: string, updates: Partial<ContactDetail>) => {
        const state = get();
        
        // 检查是否已初始化联系人详情
        if (!state.initializedDetailIds[id]) {
          throw new ContactDetailInitFailedException(id, new Error('更新联系人详情前必须先初始化'));
        }
        
        try {
          // 获取当前联系人详情
          const currentDetail = state.contactDetails[id];
          if (!currentDetail) {
            throw new ContactNotFoundException(id);
          }
          
          // 更新本地状态
          const updatedDetail = {
            ...currentDetail,
            ...updates
          };
          
          // 更新状态
          set(state => {
            state.contactDetails[id] = updatedDetail;
            
            // 如果更新了名称，同时更新联系人列表中的名称
            if (updates.name) {
              const contactIndex = state.contacts.findIndex(c => c.id === id);
              if (contactIndex !== -1) {
                state.contacts[contactIndex].name = updates.name;
              }
            }
          });
          
          return get().contactDetails[id];
        } catch (error) {
          console.error('更新联系人详情失败:', error);
          return null;
        }
      }
    })),
    {
      name: 'contact',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
