import { useState, useEffect } from 'react';
import { useNavigate, useLoaderData, useFetcher } from 'react-router-dom';
import { ArrowLeft, Search, User, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Contact } from '@/types/contact';
import { useShallow } from 'zustand/react/shallow';

// 联系人类型(本地使用)
interface ContactItem {
  id: string;
  name: string;
  avatar: string;
  selected?: boolean;
}

interface NewChatLoaderData {
  success: boolean;
  error?: string;
  contacts: Contact[];
}

// 创建群聊的fetcher返回数据类型
interface CreateGroupChatResponse {
  success: boolean;
  error?: string;
  chatId?: string;
  message?: string;
}

const NewChatPage = () => {
  const navigate = useNavigate();
  const data = useLoaderData() as NewChatLoaderData;
  
  // 创建一个fetcher用于发送创建群聊请求
  const createChatFetcher = useFetcher<CreateGroupChatResponse>();
  
  // 从loader获取联系人数据
  const contacts = data.success ? data.contacts : [];
  const hasError = !data.success;
  const errorMessage = data.error;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<ContactItem[]>([]);
  const [formattedContacts, setFormattedContacts] = useState<ContactItem[]>([]);

  // 格式化联系人数据
  useEffect(() => {
    if (contacts.length > 0) {
      const formatted = contacts.map((contact: Contact) => ({
        id: contact.id,
        name: contact.name,
        avatar: contact.avatar || contact.name.charAt(0),
      }));
      setFormattedContacts(formatted);
    }
  }, [contacts]);

  // 监听创建群聊的响应
  useEffect(() => {
    if (createChatFetcher.data && createChatFetcher.data.success && createChatFetcher.data.chatId) {
      // 导航到新创建的聊天
      navigate(`/chats/${createChatFetcher.data.chatId}`);
    }
  }, [createChatFetcher.data, navigate]);

  // 过滤联系人
  const filteredContacts = formattedContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 返回上一页
  const handleBack = () => {
    navigate(-1);
  };

  // 选择联系人
  const handleSelectContact = (contact: ContactItem) => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);

    if (isSelected) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  // 完成选择，创建聊天
  const handleCreateChat = () => {
    if (selectedContacts.length > 0) {
      const contactIds = selectedContacts.map(contact => contact.id).join(',');
      
      // 使用fetcher提交创建群聊的请求
      createChatFetcher.submit(
        { contactIds },
        { method: 'post', action: '/api/chats/create-group' }
      );
    }
  };

  // 检查是否正在创建聊天
  const isCreating = createChatFetcher.state === 'submitting';

  return (
    <div className="fixed inset-0 z-50 flex flex-col h-full bg-black text-white">
      {/* 头部 */}
      <div className="flex items-center p-4 border-b border-gray-800">
        <Button variant="ghost" size="icon" className="text-white mr-2" onClick={handleBack}>
          <ArrowLeft size={20} />
        </Button>

        <h1 className="text-lg font-medium text-white flex-1 text-center mr-8">发起聊天</h1>

        {selectedContacts.length > 0 && (
          <Button
            variant="ghost"
            className="text-white absolute right-4"
            onClick={handleCreateChat}
            disabled={isCreating}
          >
            {isCreating ? '创建中...' : '完成'}
          </Button>
        )}
      </div>

      {/* 搜索栏 */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="搜索"
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 错误提示 */}
      {hasError && (
        <div className="p-4 m-4 bg-red-500/20 text-red-400 rounded-md">
          <p>{errorMessage || '加载联系人失败'}</p>
        </div>
      )}

      {/* fetcher错误提示 */}
      {createChatFetcher.data && !createChatFetcher.data.success && (
        <div className="p-4 m-4 bg-red-500/20 text-red-400 rounded-md">
          <p>{createChatFetcher.data.error || '创建聊天失败'}</p>
        </div>
      )}

      {/* 联系人列表 - 简化版 */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <User size={36} className="text-gray-600 mb-2" />
            <p className="text-gray-500">未找到联系人</p>
          </div>
        ) : (
          <ul>
            {filteredContacts.map(contact => {
              const isSelected = selectedContacts.some(c => c.id === contact.id);

              return (
                <li
                  key={contact.id}
                  className="px-4 py-3 border-b border-gray-800 cursor-pointer"
                  onClick={() => handleSelectContact(contact)}
                >
                  <div className="flex items-center">
                    {/* 选择圆圈 */}
                    <div
                      className={`w-6 h-6 rounded-full border ${
                        isSelected
                          ? 'bg-green-500 border-green-500 flex items-center justify-center'
                          : 'border-gray-600'
                      }`}
                    >
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
                      <span className="font-medium text-white">{contact.name}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NewChatPage;