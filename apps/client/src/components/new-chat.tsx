import { useState, useEffect } from 'react';
import { ArrowLeft, Search, User, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useContact } from '../models/contact.model';
import { Contact as ContactType } from '@/types/contact';
import DelayedLoading from './delayed-loading';

// 联系人类型(本地使用)
interface Contact {
  id: string;
  name: string;
  avatar: string;
  initial: string;
  selected?: boolean;
}

// 组件Props类型
interface NewChatProps {
  onBack: () => void;
  onCreateChat: (contactIds: string[]) => void;
}

// 按首字母分组联系人
const groupContactsByInitial = (contacts: Contact[]) => {
  const grouped: { [key: string]: Contact[] } = {};
  
  contacts.forEach(contact => {
    if (!grouped[contact.initial]) {
      grouped[contact.initial] = [];
    }
    grouped[contact.initial].push(contact);
  });
  
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([initial, contacts]) => ({
      initial,
      contacts
    }));
};

const NewChat = ({ onBack, onCreateChat }: NewChatProps) => {
  const { contacts, initialized, initialize } = useContact();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [formattedContacts, setFormattedContacts] = useState<Contact[]>([]);
  
  // 初始化联系人数据
  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      if (!initialized) {
        try {
          await initialize();
        } catch (error) {
          console.error('初始化联系人列表失败:', error);
        }
      }
      setLoading(false);
    };

    loadContacts();
  }, [initialize, initialized]);

  // 格式化联系人数据
  useEffect(() => {
    if (contacts.length > 0) {
      const formatted = contacts.map((contact: ContactType) => ({
        id: contact.id,
        name: contact.name,
        avatar: contact.avatar || contact.name.charAt(0),
        initial: contact.pinyin ? contact.pinyin.charAt(0).toUpperCase() : '#'
      }));
      setFormattedContacts(formatted);
    }
  }, [contacts]);
  
  // 过滤联系人
  const filteredContacts = formattedContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // 按首字母分组联系人
  const groupedContacts = groupContactsByInitial(filteredContacts);
  
  // 选择联系人
  const handleSelectContact = (contact: Contact) => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };
  
  // 创建聊天
  const handleCreateChat = () => {
    if (selectedContacts.length > 0) {
      onCreateChat(selectedContacts.map(contact => contact.id));
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-black text-white absolute inset-0 z-10">
      {/* 头部 */}
      <div className="flex items-center p-4 border-b border-gray-800">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white mr-2"
          onClick={onBack}
        >
          <ArrowLeft size={20} />
        </Button>
        
        <h1 className="text-lg font-medium text-white flex-1 text-center mr-8">
          发起聊天
        </h1>
        
        {selectedContacts.length > 0 && (
          <Button 
            variant="ghost"
            className="text-white absolute right-4"
            onClick={handleCreateChat}
          >
            完成
          </Button>
        )}
      </div>
      
      {/* 搜索栏 */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="搜索"
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* 联系人列表 */}
      <DelayedLoading loading={loading}>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <User size={36} className="text-gray-600 mb-2" />
              <p className="text-gray-500">未找到联系人</p>
            </div>
          ) : (
            <>
              {groupedContacts.map(group => (
                <div key={group.initial}>
                  {/* 分组标题 */}
                  <div className="sticky top-0 px-4 py-1 bg-gray-900 text-gray-500 text-sm font-medium">
                    {group.initial}
                  </div>
                  
                  {/* 联系人列表 */}
                  <ul>
                    {group.contacts.map(contact => {
                      const isSelected = selectedContacts.some(c => c.id === contact.id);
                      
                      return (
                        <li
                          key={contact.id}
                          className="px-4 py-3 cursor-pointer border-b border-gray-800"
                          onClick={() => handleSelectContact(contact)}
                        >
                          <div className="flex items-center">
                            {/* 选择圆圈 */}
                            <div className={`w-6 h-6 rounded-full border ${isSelected ? 'bg-green-500 border-green-500 flex items-center justify-center' : 'border-gray-600'}`}>
                              {isSelected && (
                                <Check size={14} className="text-white" />
                              )}
                            </div>
                            
                            {/* 头像 */}
                            <div className="ml-3 w-12 h-12 rounded-md bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-semibold">
                              {contact.avatar}
                            </div>
                            
                            {/* 联系人名称 */}
                            <div className="ml-3">
                              <span className="font-medium text-white">
                                {contact.name}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              
              {/* 右侧字母导航 */}
              <div className="fixed right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                {groupedContacts.map(group => (
                  <a 
                    key={group.initial}
                    href={`#${group.initial}`}
                    className="w-5 h-5 flex items-center justify-center text-xs text-gray-500"
                  >
                    {group.initial}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </DelayedLoading>
      
      {/* 完成按钮 */}
      {selectedContacts.length > 0 && (
        <div className="p-4 border-t border-gray-800">
          <Button 
            variant="default"
            className="w-full bg-gray-800 hover:bg-gray-700 text-white"
            onClick={handleCreateChat}
          >
            完成
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewChat; 