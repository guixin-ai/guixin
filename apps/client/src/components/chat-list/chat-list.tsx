import { Search } from 'lucide-react';
import { useState } from 'react';

/**
 * 聊天项目接口
 */
interface Chat {
  id: string;
  /** 聊天名称 */
  name: string;
  /** 聊天头像 */
  avatar: string;
  /** 最后一条消息内容 */
  lastMessage?: string | null;
  /** 最后一条消息时间 */
  lastMessageTime?: string | null;
  /** 未读消息数量 */
  unread: number;
}

/**
 * 聊天列表组件属性
 */
interface ChatListProps {
  /** 聊天列表数据 */
  chats: Chat[];
  /** 当前活跃的聊天ID */
  activeChatId?: string | null;
  /** 是否正在加载聊天列表 */
  isLoadingChats: boolean;
  /** 加载错误信息 */
  loadError?: string | null;
  /** 是否启用搜索功能 */
  searchEnabled?: boolean;
  /** 选择聊天的回调函数 */
  onChatSelect: (chatId: string) => void;
}

/**
 * 聊天列表组件
 *
 * 用于显示聊天列表，支持搜索和选择功能
 *
 * 职责范围：
 * - 展示聊天列表
 * - 支持搜索过滤
 * - 显示加载状态和错误信息
 * - 提供聊天选择功能
 *
 * 不在职责范围内：
 * - 不处理数据获取和状态管理
 * - 不处理聊天内容的展示
 */
export const ChatList = ({
  chats,
  activeChatId,
  isLoadingChats,
  loadError,
  searchEnabled = true,
  onChatSelect,
}: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤聊天
  const filteredChats = searchQuery
    ? chats.filter(
        chat =>
          chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : chats;

  return (
    <div className="w-80 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-100 dark:border-gray-700 shadow-sm">
      {searchEnabled && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-full relative">
            <input
              type="text"
              placeholder="搜索"
              className="w-full p-2 pl-9 rounded-full bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
      )}
      <div>
        {isLoadingChats ? (
          <div className="p-4 text-center text-gray-500">加载中...</div>
        ) : loadError ? (
          <div className="p-4 text-center text-red-500">{loadError}</div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">暂无聊天</div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`flex items-center p-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${activeChatId === chat.id ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl mr-3 shadow-sm">
                {chat.avatar}
              </div>
              <div className="flex-1 border-b border-gray-100 dark:border-gray-700 pb-3">
                <div className="flex justify-between">
                  <span className="font-medium dark:text-white">{chat.name}</span>
                  <span className="text-xs text-gray-400">{chat.lastMessageTime}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {chat.lastMessage || '暂无消息'}
                  </span>
                  {chat.unread > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
