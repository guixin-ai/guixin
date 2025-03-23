import { ChatContact } from '..';

// 提及列表项接口
export interface MentionListProps {
  contacts: ChatContact[];
  searchText: string;
  selectedIndex: number;
  onSelectContact: (contact: ChatContact) => void;
  maxHeight?: string;
  width?: string;
}

/**
 * 提及联系人列表组件
 * 显示根据搜索文本过滤的联系人列表
 * 支持键盘导航和鼠标点击选择
 */
export function MentionList({ 
  contacts, 
  searchText, 
  selectedIndex, 
  onSelectContact,
  maxHeight = '250px',
  width = '280px'
}: MentionListProps) {
  // 过滤联系人
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
    contact.id.toLowerCase().includes(searchText.toLowerCase())
  );
  
  // 如果没有匹配的联系人，显示提示
  if (filteredContacts.length === 0) {
    return (
      <div className="absolute z-10 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1" style={{ width }}>
        <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
          未找到匹配的联系人
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="absolute z-10 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 overflow-y-auto" 
      style={{ maxHeight, width }}
    >
      {filteredContacts.map((contact, index) => (
        <div
          key={contact.id}
          className={`px-3 py-2 flex items-center cursor-pointer ${
            index === selectedIndex
              ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700/30'
          }`}
          onClick={() => onSelectContact(contact)}
        >
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-6 h-6 rounded-full mr-2"
            />
          ) : (
            <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs ${
              contact.isAI 
                ? 'bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}>
              {contact.name[0]}
            </div>
          )}
          <div className="flex-1 flex flex-col">
            <span className="text-sm font-medium">{contact.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {contact.isAI ? 'AI助手' : '联系人'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 