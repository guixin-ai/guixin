import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { contactService, contactGroupService } from '../../services';
import { Contact, ContactGroup, ContactWithGroup, CreateContactGroupRequest } from '../../types';
import { useUserStore } from '../user.model';

// 定义类型
export interface ContactPerson {
  id: string;
  name: string;
  avatar: string;
  description?: string;
  isGroup?: boolean;
  groupId: string;
}

export interface ContactGroupModel {
  id: string;
  name: string;
  description?: string;
  contacts: string[]; // 存储联系人ID
}

interface ContactsState {
  contacts: ContactPerson[];
  groups: ContactGroupModel[];
  selectedContactId: string | null;
  searchQuery: string;
  expandedGroups: string[];

  // 加载状态
  isLoadingContacts: boolean;
  isCreatingGroup: boolean;
  isAddingContact: boolean;
  loadings: {
    deleteContact: Record<string, boolean>; // 按联系人ID跟踪删除状态
    addContactWithGroup: Record<string, boolean>; // 按联系人ID跟踪添加状态
  };
  loadError: string | null;

  // 操作
  selectContact: (contactId: string) => void;
  setSearchQuery: (query: string) => void;
  toggleGroup: (groupId: string) => void;
  loadContacts: (userId: string) => Promise<void>;
  addContact: (contact: Omit<ContactPerson, 'id'>) => void;
  updateContact: (contactId: string, data: Partial<ContactPerson>) => void;
  deleteContact: (contactId: string) => Promise<void>;
  addToGroup: (contactId: string, groupId: string) => void;
  removeFromGroup: (contactId: string, groupId: string) => void;
  createGroup: (name: string) => Promise<string>;
  addContactWithGroup: (contactId: string) => Promise<void>;
}

export const useContactsStore = create(
  immer<ContactsState>((set, get) => ({
    contacts: [],
    groups: [],
    selectedContactId: null,
    searchQuery: '',
    expandedGroups: [],

    // 加载状态
    isLoadingContacts: false,
    isCreatingGroup: false,
    isAddingContact: false,
    loadings: {
      deleteContact: {},
      addContactWithGroup: {},
    },
    loadError: null,

    selectContact: contactId =>
      set(state => {
        state.selectedContactId = contactId;
        return state;
      }),

    setSearchQuery: query =>
      set(state => {
        state.searchQuery = query;
        return state;
      }),

    toggleGroup: groupId =>
      set(state => {
        if (state.expandedGroups.includes(groupId)) {
          state.expandedGroups = state.expandedGroups.filter(id => id !== groupId);
        } else {
          state.expandedGroups.push(groupId);
        }
        return state;
      }),

    loadContacts: async userId => {
      try {
        set(state => {
          state.isLoadingContacts = true;
          state.loadError = null;
          return state;
        });

        // 获取带分组信息的联系人
        const contactsWithGroup = await contactService.getContactsByOwnerIdWithGroup(userId);

        // 处理数据，构建联系人和分组
        const contactsMap = new Map<string, ContactPerson>();
        const groupsMap = new Map<string, ContactGroupModel>();

        // 处理联系人和分组数据
        contactsWithGroup.forEach((item: ContactWithGroup) => {
          const { contact, group } = item;

          // 处理联系人
          contactsMap.set(contact.id, {
            id: contact.id,
            name: contact.name,
            description: contact.description,
            avatar: contact.name.charAt(0).toUpperCase(), // 使用名称首字母作为头像
            groupId: contact.group_id,
          });

          // 处理分组
          if (!groupsMap.has(group.id)) {
            groupsMap.set(group.id, {
              id: group.id,
              name: group.name,
              description: group.description,
              contacts: [],
            });
          }

          // 将联系人添加到分组中
          const contactGroup = groupsMap.get(group.id);
          if (contactGroup && !contactGroup.contacts.includes(contact.id)) {
            contactGroup.contacts.push(contact.id);
          }
        });

        // 更新状态
        set(state => {
          state.contacts = Array.from(contactsMap.values());
          state.groups = Array.from(groupsMap.values());
          state.isLoadingContacts = false;

          // 默认展开所有分组
          state.expandedGroups = Array.from(groupsMap.keys());

          // 如果有联系人，默认选中第一个
          if (state.contacts.length > 0 && !state.selectedContactId) {
            state.selectedContactId = state.contacts[0].id;
          }

          return state;
        });
      } catch (error) {
        set(state => {
          state.isLoadingContacts = false;
          state.loadError = error instanceof Error ? error.message : '加载联系人失败';
          return state;
        });

        console.error('加载联系人失败:', error);
        // 将错误继续抛出，让组件层处理
        throw error;
      }
    },

    addContact: contact =>
      set(state => {
        // 这里应该调用API创建联系人，然后更新状态
        // 暂时使用本地模拟
        const newContact: ContactPerson = {
          ...contact,
          id: `contact-${Date.now()}`,
        };

        state.contacts.push(newContact);

        // 添加到对应分组
        const groupIndex = state.groups.findIndex(g => g.id === contact.groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].contacts.push(newContact.id);
        }

        return state;
      }),

    updateContact: (contactId, data) =>
      set(state => {
        const contactIndex = state.contacts.findIndex(c => c.id === contactId);
        if (contactIndex !== -1) {
          state.contacts[contactIndex] = {
            ...state.contacts[contactIndex],
            ...data,
          };
        }
        return state;
      }),

    deleteContact: async contactId => {
      try {
        // 设置特定联系人的删除加载状态
        set(state => {
          state.loadings.deleteContact[contactId] = true;
          return state;
        });

        // 获取当前用户ID
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser) {
          throw new Error('当前用户未登录');
        }

        // 调用服务删除联系人及其相关数据
        await contactService.deleteContact(contactId, currentUser.id);

        // 更新状态
        set(state => {
          // 从联系人列表中删除
          state.contacts = state.contacts.filter(c => c.id !== contactId);

          // 从所有分组中删除联系人
          state.groups.forEach(group => {
            group.contacts = group.contacts.filter(id => id !== contactId);
          });

          // 如果分组变为空，则删除该分组
          state.groups = state.groups.filter(group => group.contacts.length > 0);

          // 如果删除了分组，也要从expandedGroups中移除
          state.expandedGroups = state.expandedGroups.filter(id =>
            state.groups.some(group => group.id === id)
          );

          // 如果删除的是当前选中的联系人，则选择第一个联系人
          if (state.selectedContactId === contactId) {
            state.selectedContactId = state.contacts.length > 0 ? state.contacts[0].id : null;
          }

          // 清除加载状态
          delete state.loadings.deleteContact[contactId];

          return state;
        });
      } catch (error) {
        // 清除加载状态
        set(state => {
          delete state.loadings.deleteContact[contactId];
          return state;
        });

        console.error('删除联系人失败:', error);
        // 将错误继续抛出，让组件层处理
        throw error;
      }
    },

    addToGroup: (contactId, groupId) =>
      set(state => {
        const groupIndex = state.groups.findIndex(g => g.id === groupId);
        if (groupIndex !== -1 && !state.groups[groupIndex].contacts.includes(contactId)) {
          state.groups[groupIndex].contacts.push(contactId);
        }
        return state;
      }),

    removeFromGroup: (contactId, groupId) =>
      set(state => {
        const groupIndex = state.groups.findIndex(g => g.id === groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].contacts = state.groups[groupIndex].contacts.filter(
            id => id !== contactId
          );
        }
        return state;
      }),

    createGroup: async name => {
      try {
        set(state => {
          state.isCreatingGroup = true;
          return state;
        });

        // 调用API创建分组
        const request: CreateContactGroupRequest = {
          name,
          description: null,
        };

        const newGroup = await contactGroupService.createContactGroup(request);

        // 更新状态
        set(state => {
          state.groups.push({
            id: newGroup.id,
            name: newGroup.name,
            description: newGroup.description,
            contacts: [],
          });
          state.isCreatingGroup = false;
          return state;
        });

        return newGroup.id;
      } catch (error) {
        set(state => {
          state.isCreatingGroup = false;
          return state;
        });

        console.error('创建分组失败:', error);
        // 将错误继续抛出，让组件层处理
        throw error;
      }
    },

    addContactWithGroup: async contactId => {
      try {
        // 设置特定联系人的添加加载状态
        set(state => {
          state.loadings.addContactWithGroup[contactId] = true;
          return state;
        });

        // 获取联系人及其分组信息
        const contactWithGroup = await contactService.getContactByIdWithGroup(contactId);
        const { contact, group } = contactWithGroup;

        set(state => {
          // 检查分组是否已存在
          const existingGroup = state.groups.find(g => g.id === group.id);

          // 如果分组不存在，添加新分组
          if (!existingGroup) {
            const newGroup: ContactGroupModel = {
              id: group.id,
              name: group.name,
              description: group.description,
              contacts: [contact.id],
            };
            state.groups.push(newGroup);
          } else {
            // 如果分组已存在，检查联系人是否已在分组中
            if (!existingGroup.contacts.includes(contact.id)) {
              existingGroup.contacts.push(contact.id);
            }
          }

          // 检查联系人是否已存在
          const existingContactIndex = state.contacts.findIndex(c => c.id === contact.id);

          // 创建新的联系人对象
          const newContact: ContactPerson = {
            id: contact.id,
            name: contact.name,
            description: contact.description,
            avatar: contact.name.charAt(0).toUpperCase(), // 使用名称首字母作为头像
            groupId: contact.group_id,
          };

          // 如果联系人不存在，添加新联系人
          if (existingContactIndex === -1) {
            state.contacts.push(newContact);
          } else {
            // 如果联系人已存在，更新联系人信息
            state.contacts[existingContactIndex] = newContact;
          }

          // 清除加载状态
          delete state.loadings.addContactWithGroup[contactId];

          return state;
        });
      } catch (error) {
        // 清除加载状态
        set(state => {
          delete state.loadings.addContactWithGroup[contactId];
          return state;
        });

        console.error('添加联系人失败:', error);
        // 将错误继续抛出，让组件层处理
        throw error;
      }
    },
  }))
);

export default useContactsStore;
