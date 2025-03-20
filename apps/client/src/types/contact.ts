/**
 * 联系人相关类型定义
 */

// 联系人类型（列表项）
export interface Contact {
  id: string;
  name: string;
  avatar: string;
  pinyin?: string;
}

// 联系人详情类型（独立的，不继承自Contact）
export interface ContactDetail {
  id: string;          // 必须字段
  name: string;        // 必须字段
  description?: string; // 设定描述
  avatar: string;      // 头像
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

// 联系人详情响应类型
export interface ContactDetailResponse {
  contact: ContactDetail;
} 