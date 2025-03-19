import React, { useRef, useMemo } from 'react';
import { ContactItem } from '../contact-item/contact-item';
import { ContactPerson, ContactGroupModel } from '../../models/routes/chat-contacts.model';
import ContactSearchBar, { ContactSearchBarRef } from '../contact-search-bar/contact-search-bar';
import { GroupedVirtuoso } from '../lib/grouped-virtuoso/grouped-virtuoso';

/**
 * 联系人列表组件接口属性
 * @interface ContactListProps
 */
interface ContactListProps {
  /** 联系人列表 */
  contacts: ContactPerson[];
  /** 联系人分组列表 */
  groups: ContactGroupModel[];
  /** 当前选中的联系人ID */
  selectedContactId: string | null;
  /** 搜索查询字符串 */
  searchQuery: string;
  /** 是否正在加载联系人数据 */
  isLoading: boolean;
  /** 加载状态对象，包含各种操作的加载状态 */
  loadings: {
    /** 按联系人ID跟踪删除状态 */
    deleteContact: Record<string, boolean>;
  } | null;
  /** 搜索输入变化回调 */
  onSearch: (query: string) => void;
  /** 选择联系人回调 */
  onSelectContact: (id: string) => void;
  /** 删除联系人回调 */
  onDeleteContact: (id: string) => Promise<void>;
  /** 创建新联系人回调 */
  onCreateContact: () => void;
}

/**
 * 联系人列表组件
 *
 * 用于显示联系人列表，包含搜索、分组和联系人条目。负责：
 * - 显示联系人搜索框
 * - 提供创建新联系人的入口
 * - 展示分组和联系人列表
 * - 处理搜索筛选
 *
 * 不负责：
 * - 联系人数据的获取和管理
 * - 处理联系人的具体业务逻辑
 * - 联系人的具体UI渲染（由ContactItem组件负责）
 */
const ContactList: React.FC<ContactListProps> = ({
  contacts,
  groups,
  selectedContactId,
  searchQuery,
  isLoading,
  loadings,
  onSearch,
  onSelectContact,
  onDeleteContact,
  onCreateContact,
}) => {
  const searchBarRef = useRef<ContactSearchBarRef>(null);

  // 过滤联系人
  const filteredContacts = searchQuery
    ? contacts.filter(contact => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : contacts;

  // 为GroupedVirtuoso准备数据
  const virtuosoData = useMemo(() => {
    if (searchQuery) {
      // 搜索模式：只有一个组，包含所有筛选出的联系人
      return {
        groupCounts: filteredContacts.length > 0 ? [filteredContacts.length] : [0],
        groups: ['搜索结果'] as const,
        allItems: filteredContacts,
      };
    } else {
      // 按组展示模式：所有非空组
      const nonEmptyGroups = groups.filter(group => group.contacts.length > 0);
      const groupCounts = nonEmptyGroups.map(group => group.contacts.length);

      // 收集所有要显示的联系人
      const allItems = nonEmptyGroups.flatMap(group => {
        return group.contacts
          .map(contactId => contacts.find(c => c.id === contactId))
          .filter(Boolean) as ContactPerson[];
      });

      return {
        groupCounts,
        groups: nonEmptyGroups,
        allItems,
      };
    }
  }, [contacts, groups, filteredContacts, searchQuery]);

  return (
    <div className="w-80 flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 shadow-sm">
      {/* 固定在顶部的搜索区域 */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <ContactSearchBar
          ref={searchBarRef}
          initialSearchText={searchQuery}
          onSearch={onSearch}
          onAddClick={onCreateContact}
          placeholder="搜索联系人"
        />
      </div>

      {/* 可滚动的联系人列表区域 - 单一GroupedVirtuoso */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">正在加载联系人...</div>
        ) : searchQuery ? (
          // 搜索结果 - 使用GroupedVirtuoso
          filteredContacts.length > 0 ? (
            <GroupedVirtuoso
              style={{ height: '100%', width: '100%' }}
              groupCounts={virtuosoData.groupCounts}
              groupContent={index => (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    搜索结果 ({filteredContacts.length})
                  </span>
                </div>
              )}
              itemContent={index => {
                const contact = filteredContacts[index];
                return (
                  <ContactItem
                    key={contact.id}
                    id={contact.id}
                    name={contact.name}
                    avatar={contact.avatar}
                    description={contact.description}
                    isSelected={selectedContactId === contact.id}
                    onSelect={onSelectContact}
                    onDelete={onDeleteContact}
                    isDeleting={!!loadings?.deleteContact[contact.id]}
                  />
                );
              }}
            />
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              未找到匹配的联系人
            </div>
          )
        ) : // 分组显示 - 单一GroupedVirtuoso
        virtuosoData.allItems.length > 0 ? (
          <GroupedVirtuoso
            style={{ height: '100%', width: '100%' }}
            groupCounts={virtuosoData.groupCounts}
            groupContent={index => {
              const group = virtuosoData.groups[index];
              return (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {typeof group === 'string' ? group : group.name}
                  </span>
                </div>
              );
            }}
            itemContent={index => {
              const contact = virtuosoData.allItems[index];
              return (
                <ContactItem
                  key={contact.id}
                  id={contact.id}
                  name={contact.name}
                  avatar={contact.avatar}
                  description={contact.description}
                  isSelected={selectedContactId === contact.id}
                  isInGroup={true}
                  onSelect={onSelectContact}
                  onDelete={onDeleteContact}
                  isDeleting={!!loadings?.deleteContact[contact.id]}
                />
              );
            }}
          />
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            没有联系人，请添加联系人
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactList;
