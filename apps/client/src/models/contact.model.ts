/**
 * 联系人模型 - 定义联系人相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// 联系人类型
export interface Contact {
  id: string;
  name: string;
  avatar: string;
  pinyin?: string;
}

// 按字母分组的联系人
export interface ContactGroup {
  letter: string;
  contacts: Contact[];
}

// 联系人状态接口
export interface ContactState {
  // 联系人列表
  contacts: Contact[];
  // 当前选中的联系人ID
  currentContactId: string | null;

  // 操作方法
  fetchAllContacts: () => void;
  fetchContactById: (id: string) => Contact | undefined;
  setCurrentContact: (contactId: string) => void;
  clearCurrentContact: () => void;
  searchContacts: (query: string) => Contact[];
  addContact: (contact: Contact) => void;
  getGroupedContacts: () => ContactGroup[];
}

// 示例数据
const initialContacts: Contact[] = [
  { id: 'a1', name: '阿里巴巴', avatar: '阿', pinyin: 'alibaba' },
  { id: 'a2', name: '阿童木', avatar: '阿', pinyin: 'atom' },
  { id: 'b1', name: '白起', avatar: '白', pinyin: 'baiqi' },
  { id: 'b2', name: '班主任', avatar: '班', pinyin: 'banzhuren' },
  { id: 'c1', name: '陈奕迅', avatar: '陈', pinyin: 'chenyixun' },
  { id: 'c2', name: '程序员', avatar: '程', pinyin: 'chengxuyuan' },
  { id: 'd1', name: '大卫', avatar: '大', pinyin: 'dawei' },
  { id: 'd2', name: '杜甫', avatar: '杜', pinyin: 'dufu' },
  { id: 'l1', name: '老婆', avatar: '老', pinyin: 'laopo' },
  { id: 'l2', name: '爸爸', avatar: '爸', pinyin: 'baba' },
  { id: 'w1', name: '王小波', avatar: '王', pinyin: 'wangxiaobo' },
  { id: 'w2', name: '王力宏', avatar: '王', pinyin: 'wanglihong' },
  { id: 'z1', name: '张三', avatar: '张', pinyin: 'zhangsan' },
  { id: 'z2', name: '周杰伦', avatar: '周', pinyin: 'zhoujielun' },
];

// 创建联系人状态存储
export const useContactStore = create(
  immer<ContactState>((set, get) => ({
    // 初始状态
    contacts: initialContacts,
    currentContactId: null,

    // 获取所有联系人
    fetchAllContacts: () => {
      // 这里可以添加从API获取联系人列表的逻辑
      // 目前直接使用本地数据
      set(state => {
        state.contacts = initialContacts;
      });
    },

    // 根据ID获取联系人
    fetchContactById: (id: string) => {
      const contact = get().contacts.find(contact => contact.id === id);
      return contact;
    },

    // 设置当前联系人
    setCurrentContact: (contactId: string) => {
      set(state => {
        state.currentContactId = contactId;
      });
    },

    // 清除当前联系人
    clearCurrentContact: () => {
      set(state => {
        state.currentContactId = null;
      });
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
        // 设置为当前联系人
        state.currentContactId = contact.id;
      });
    },

    // 获取按字母分组的联系人
    getGroupedContacts: () => {
      const { contacts } = get();
      
      // 先按拼音排序
      const sortedContacts = [...contacts].sort((a, b) => {
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
      
      return groups;
    }
  }))
);

// 获取当前选中的联系人（计算属性）
export const useCurrentContact = () => {
  const { currentContactId, contacts } = useContactStore();
  return contacts.find(contact => contact.id === currentContactId) || null;
};

// 导出联系人状态钩子
export const useContact = () => useContactStore(); 