import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, UserPlus, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useChatStore } from '../../models/chat.model';
import {
  ChatListInitFailedException,
  GroupChatCreationFailedException,
} from '@/errors/chat.errors';
import DelayedLoading from '../../components/delayed-loading';
import NewChat from '../../components/new-chat';
import CreateFriend from '../../components/create-friend';
import { ChatListItem } from '../../components/chat-list-item';
import { useShallow } from 'zustand/react/shallow';
import { ChatItem, ChatDetail } from '../../types/chat';
import { chatService } from '@/services/chat.service';

const ChatsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 从URL查询参数中获取模态框状态
  const currentModal = searchParams.get('modal');

  // 使用 useShallow 和选择器获取需要的状态和方法
  const { searchChats, chats, initializeChatList, initializedChatList } = useChatStore(
    useShallow(state => ({
      searchChats: state.searchChats,
      chats: state.chats,
      initializeChatList: state.initializeChatList,
      initializedChatList: state.initializedChatList,
    }))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 初始化聊天数据
  useEffect(() => {
    const loadChats = async () => {
      try {
        // 先检查模型层的初始化状态
        if (initializedChatList) {
          // 如果已经初始化，直接使用模型中的数据，不再调用服务
          console.log('聊天列表已初始化，跳过服务调用');
          setLoading(false);
          return;
        }

        // 如果未初始化，才调用服务获取数据
        const response = await chatService.getChats();
        // 调用模型层的初始化方法设置数据和初始化标记
        initializeChatList(response.chats);
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
  }, [initializeChatList, initializedChatList]);

  // 过滤后的聊天列表
  const filteredChats = searchQuery ? searchChats(searchQuery) : chats;

  // 打开聊天详情
  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  // 发起聊天处理函数
  const handleCreateChat = () => {
    setSearchParams({ modal: 'new-chat' });
  };

  // 创造朋友
  const handleCreateFriend = () => {
    setSearchParams({ modal: 'create-friend' });
  };

  // 处理聊天创建
  const handleChatCreated = async (contactIds: string[]) => {
    if (!contactIds || contactIds.length === 0) {
      return;
    }

    try {
      // 使用新的异步createGroupChat方法创建群聊
      const chatId = await useChatStore.getState().createGroupChat(contactIds);

      // 导航到新的聊天页面
      navigate(`/chat/${chatId}`);
      // 清除modal参数
      clearModal();
    } catch (error) {
      console.error('创建群聊失败:', error);

      // 根据错误类型显示不同的错误信息
      let errorMessage = '创建群聊失败，请稍后重试';

      if (error instanceof GroupChatCreationFailedException) {
        errorMessage = error.message;
      }

      // 这里可以添加显示错误提示的代码，例如toast通知
      alert(errorMessage); // 实际应用中应替换为更友好的UI组件
    }
  };

  // 处理朋友创建完成
  const handleFriendCreated = async (contactId?: string) => {
    if (!contactId) {
      clearModal();
      return;
    }

    try {
      // 创建完朋友后，直接创建一个与该朋友的聊天
      const chatId = await useChatStore.getState().createGroupChat([contactId]);

      // 导航到新的聊天页面
      navigate(`/chat/${chatId}`);
      clearModal();
    } catch (error) {
      console.error('创建聊天失败:', error);
      let errorMessage = '创建聊天失败，请稍后重试';

      if (error instanceof GroupChatCreationFailedException) {
        errorMessage = error.message;
      }

      // 错误提示
      alert(errorMessage);
      clearModal();
    }
  };

  // 清除模态框参数
  const clearModal = () => {
    // 保留其他可能的查询参数
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('modal');
    setSearchParams(newParams);
  };

  // 关闭新建聊天页面
  const handleCloseNewChat = () => {
    clearModal();
  };

  // 关闭创建朋友页面
  const handleCloseCreateFriend = () => {
    clearModal();
  };

  return (
    <>
      <DelayedLoading loading={loading}>
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900">
            <h1
              className="text-xl font-semibold text-gray-800 dark:text-white"
              data-testid="app-logo"
            >
              硅信
            </h1>
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
            {filteredChats.length > 0 &&
              filteredChats.map(chat => (
                <ChatListItem key={chat.id} chat={chat} onClick={handleChatClick} />
              ))}
          </div>
        </div>
      </DelayedLoading>

      {/* 新建聊天组件 - 基于URL参数条件渲染 */}
      {currentModal === 'new-chat' && (
        <NewChat onBack={handleCloseNewChat} onComplete={handleChatCreated} />
      )}

      {/* 创造朋友组件 - 基于URL参数条件渲染 */}
      {currentModal === 'create-friend' && (
        <CreateFriend onBack={handleCloseCreateFriend} onComplete={handleFriendCreated} />
      )}
    </>
  );
};

export default ChatsPage;
