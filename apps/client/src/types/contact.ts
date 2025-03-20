/**
 * 联系人相关类型定义
 */

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

// 联系人列表响应类型
export interface ContactsResponse {
  contacts: Contact[];
  total: number;
}

// 分组联系人响应类型
export interface GroupedContactsResponse {
  groups: ContactGroup[];
  total: number;
} 