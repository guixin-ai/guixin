import { useState } from 'react';
import { useNavigate, useLoaderData, useFetcher } from 'react-router-dom';
import { Search, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Contact } from '@/types/contact';

// 定义加载器返回数据的类型
interface ContactLoaderData {
  success?: boolean;
  error?: string;
  contacts: Contact[];
}

// 定义删除联系人操作返回数据类型
interface DeleteFetcherData {
  success?: boolean;
  error?: string;
}

const ContactsPage = () => {
  const navigate = useNavigate();
  
  // 使用useLoaderData获取路由加载器提供的数据
  const data = useLoaderData<ContactLoaderData>();
  
  // 兼容处理，确保能处理loader返回的数据
  const contacts = data.contacts || [];
  const hasError = data.success === false;
  const errorMessage = data.error;

  // 创建独立的fetcher实例处理数据操作
  const deleteFetcher = useFetcher<DeleteFetcherData>();

  const [searchQuery, setSearchQuery] = useState('');

  // 搜索过滤联系人
  const filteredContacts = searchQuery
    ? contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contacts;

  // 添加新联系人
  const handleAddContact = () => {
    navigate('/contacts/new');
  };

  // 查看联系人详情 - 打开聊天
  const handleContactClick = (contact: Contact) => {
    // 这里可以导航到聊天页面
    navigate(`/chats/${contact.id}`);
  };

  // 删除联系人
  const handleDeleteContact = (contactId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    // 使用fetcher提交删除请求
    deleteFetcher.submit(
      { id: contactId },
      { method: "delete", action: "/api/contacts/delete" }
    );
  };

  // 判断是否有fetcher正在提交
  const isLoading = deleteFetcher.state === "submitting";

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">通讯录</h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 dark:text-gray-300"
          onClick={handleAddContact}
        >
          <Plus size={24} />
        </Button>
      </div>

      {/* 错误提示 */}
      {hasError && (
        <div className="mx-4 p-3 mb-2 bg-destructive/15 text-destructive rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2" />
          <span>{errorMessage || '加载联系人列表失败'}</span>
        </div>
      )}

      {/* 搜索栏 */}
      <div className="px-4 pb-2 bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="搜索联系人"
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 联系人列表 */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
        {filteredContacts.length > 0 ? (
          filteredContacts.map(contact => (
            <div
              key={contact.id}
              className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 flex items-center"
              onClick={() => handleContactClick(contact)}
            >
              {/* 联系人头像 */}
              <div className="w-10 h-10 flex items-center justify-center bg-blue-500 rounded-lg text-white font-medium">
                {contact.avatar}
              </div>
              
              {/* 联系人信息 */}
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-800 dark:text-white">{contact.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {contact.description || (contact.isAi ? 'AI助手' : '联系人')}
                </div>
              </div>
              
              {/* 操作按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-red-500"
                onClick={(e) => handleDeleteContact(contact.id, e)}
                disabled={deleteFetcher.state === "submitting" && 
                          deleteFetcher.formData?.get('id') === contact.id}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {isLoading ? '正在处理...' : (hasError ? '加载失败' : '没有找到联系人')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;
