import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Plus, UserPlus, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

// 聊天项类型
interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
}

// 示例数据
const initialChats: ChatItem[] = [
  {
    id: '1',
    name: '文件传输助手',
    avatar: '文',
    lastMessage: '[图片]',
    timestamp: '星期二',
  },
  {
    id: '2',
    name: '老婆',
    avatar: '老',
    lastMessage: '晚安宝宝',
    timestamp: '昨天',
    unread: 1,
  },
  {
    id: '3',
    name: '张薇张薇',
    avatar: '张',
    lastMessage: '周末一起打球？',
    timestamp: '昨天',
  },
  {
    id: '4',
    name: '于雯雯医生',
    avatar: '于',
    lastMessage: '好的，请按时服药',
    timestamp: '昨天',
  },
  {
    id: '5',
    name: '柒公子 顺丰快递 收件',
    avatar: '柒',
    lastMessage: '您的快递已经送达前台',
    timestamp: '昨天',
  },
  {
    id: '6',
    name: '订阅号',
    avatar: '订',
    lastMessage: '南京本地宝: 好消息！江苏新增5家国家级旅游度假区',
    timestamp: '昨天',
    unread: 3,
  },
  {
    id: '7',
    name: '大疆',
    avatar: 'D',
    lastMessage: '新品发布会邀请',
    timestamp: '昨天',
  },
  {
    id: '8',
    name: '扣子Coze',
    avatar: '扣',
    lastMessage: '有什么可以帮到您？',
    timestamp: '星期二',
  },
  {
    id: '9',
    name: '携程旅行网',
    avatar: '携',
    lastMessage: '最后一天，超爆全返场！限时优惠！',
    timestamp: '星期二',
  },
];

const ChatsPage = () => {
  const navigate = useNavigate();
  const [chats] = useState<ChatItem[]>(initialChats);
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤后的聊天列表
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 打开聊天详情
  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  // 新建聊天
  const handleNewChat = () => {
    navigate('/new-chat');
  };

  // 发起群聊
  const handleCreateGroupChat = () => {
    navigate('/new-chat?group=true');
  };

  // 创造朋友
  const handleCreateFriend = () => {
    navigate('/create-friend');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">微信</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 dark:text-gray-300"
            >
              <Plus size={24} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleCreateGroupChat}>
              <Users size={16} className="mr-2 text-green-500" />
              <span>发起群聊</span>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <User size={36} className="text-gray-400 mb-2" />
            <p className="text-gray-500">未找到聊天</p>
          </div>
        ) : (
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
    </div>
  );
};

export default ChatsPage; 