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

// 联系人详情类型（包含更多信息）
export interface ContactDetail extends Contact {
  description?: string;
  personality?: string;
  background?: string;
  expertise?: string[];
  phoneNumber?: string;
  email?: string;
  isAI?: boolean;
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