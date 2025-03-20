import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, UserPlus, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useChatStore } from '../../models/chat.model';
import { ChatListInitFailedException } from '@/errors/chat.errors';
import DelayedLoading from '../../components/delayed-loading';
import NewChat from '../../components/new-chat';
import CreateFriend from '../../components/create-friend';
import { useShallow } from 'zustand/react/shallow';

const ChatsPage = () => {
  const navigate = useNavigate();
  // 使用 useShallow 和选择器获取需要的状态和方法
  const { searchChats, chats, initializeChatList } = useChatStore(
    useShallow(state => ({
      searchChats: state.searchChats,
      chats: state.chats,
      initializeChatList: state.initializeChatList
    }))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showCreateFriend, setShowCreateFriend] = useState(false);

  // 初始化聊天数据
  useEffect(() => {
    const loadChats = async () => {
      try {
        // 直接调用初始化方法
        await initializeChatList();
        setLoading(false);
      } catch (error) {
        console.error('加载聊天列表失败:', error);
        if (error instanceof ChatListInitFailedException) {
          console.error(`聊天列表初始化失败: ${error.message}`);
        }
        setLoading(false);
      }
    };

    loadChats();
  }, [initializeChatList]);

  // 过滤后的聊天列表
  const filteredChats = searchQuery ? searchChats(searchQuery) : chats;

  // 打开聊天详情
  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  // 发起聊天处理函数
  const handleCreateChat = () => {
    setShowNewChat(true);
  };

  // 创造朋友
  const handleCreateFriend = () => {
    setShowCreateFriend(true);
  };

  // 处理聊天创建
  const handleChatCreated = (contactIds: string[]) => {
    // 这里实际应用中会创建聊天并获取群ID
    const chatId = `chat-${Date.now()}`;
    navigate(`/chat/${chatId}`);
    setShowNewChat(false);
  };

  // 处理朋友创建完成
  const handleFriendCreated = () => {
    setShowCreateFriend(false);
  };

  // 关闭新建聊天页面
  const handleCloseNewChat = () => {
    setShowNewChat(false);
  };

  // 关闭创建朋友页面
  const handleCloseCreateFriend = () => {
    setShowCreateFriend(false);
  };

  return (
    <DelayedLoading loading={loading}>
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">微信</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
                <Plus size={24} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleCreateChat}>
                <Users size={16} className="mr-2 text-green-500" />
                <span>发起聊天</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateFriend}>
                <UserPlus size={16} className="mr-2 text-blue-500" />
                <span>创造朋友</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

        {/* 聊天列表 */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
          {filteredChats.length > 0 && (
            <ul>
              {filteredChats.map(chat => (
                <li
                  key={chat.id}
                  className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                  onClick={() => handleChatClick(chat.id)}
                >
                  <div className="flex items-center">
                    {/* 头像 */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-md bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                        {chat.avatar}
                      </div>
                      {/* 未读消息提示 */}
                      {chat.unread && chat.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                          {chat.unread}
                        </div>
                      )}
                    </div>

                    {/* 聊天信息 */}
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-800 dark:text-white truncate">
                          {chat.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                          {chat.timestamp}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                        {chat.lastMessage}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 新建聊天组件 - 条件渲染 */}
        {showNewChat && (
          <NewChat
            onBack={handleCloseNewChat}
            onComplete={handleChatCreated}
          />
        )}

        {/* 创造朋友组件 - 条件渲染 */}
        {showCreateFriend && (
          <CreateFriend
            onBack={handleCloseCreateFriend}
            onComplete={handleFriendCreated}
          />
        )}
      </div>
    </DelayedLoading>
  );
};

export default ChatsPage;
