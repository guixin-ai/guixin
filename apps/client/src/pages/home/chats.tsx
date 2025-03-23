import { useState } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ChatListItem } from '../../components/chat-list-item';
import { ChatItem } from '@/types/chat';

// 聊天列表加载器数据类型
interface ChatsLoaderData {
  success: boolean;
  error?: string;
  chats: ChatItem[];
}

const ChatsPage = () => {
  const navigate = useNavigate();
  const data = useLoaderData() as ChatsLoaderData;
  
  // 从loader获取聊天列表数据
  const chats = data.success ? data.chats : [];
  const hasError = !data.success;
  const errorMessage = data.error;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // 过滤聊天列表
  const filteredChats = searchQuery 
    ? chats.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : chats;

  // 打开聊天详情
  const handleChatClick = (chatId: string) => {
    navigate(`/chats/${chatId}`);
  };

  // 发起聊天处理函数
  const handleCreateChat = () => {
    navigate('/chats/new');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900">
        <h1
          className="text-xl font-semibold text-gray-800 dark:text-white"
          data-testid="app-logo"
        >
          硅信
        </h1>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 dark:text-gray-300"
          onClick={handleCreateChat}
        >
          <Plus size={24} />
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="px-4 pb-2 bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="搜索"
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 错误提示 */}
      {hasError && (
        <div className="p-4 m-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
          <p>{errorMessage || '加载聊天列表失败'}</p>
        </div>
      )}

      {/* 聊天列表 */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 dark:text-gray-400">加载中...</div>
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map(chat => (
            <ChatListItem 
              key={chat.id} 
              chat={chat} 
              onClick={handleChatClick}
              onDelete={(chatId) => console.log('删除聊天:', chatId)} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">暂无聊天</p>
            <Button variant="outline" onClick={handleCreateChat}>
              开始新的聊天
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPage;
