import React from 'react';
import { ChatItem } from '@/types/chat';
import { 
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@/components/ui/context-menu';

export interface ChatListItemProps {
  /**
   * 聊天项数据
   */
  chat: ChatItem;
  
  /**
   * 点击聊天项时的回调
   */
  onClick?: (chatId: string) => void;

  /**
   * 删除聊天项时的回调
   */
  onDelete?: (chatId: string) => void;

  /**
   * 测试ID，用于自动化测试
   */
  testId?: string;
}

/**
 * 聊天列表项组件
 * 
 * 用于显示聊天列表中的单个聊天项，包括头像、名称、最后消息和时间戳
 */
export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  onClick,
  onDelete,
  testId = `chat-item-${chat.id}`,
}) => {
  const handleClick = () => {
    onClick?.(chat.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡，避免触发点击事件
    onDelete?.(chat.id);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
          onClick={handleClick}
          data-testid={testId}
        >
          <div className="flex items-center">
            {/* 头像 */}
            <div className="relative">
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold"
                data-testid={`${testId}-avatar`}>
                {chat.avatar}
              </div>
              {/* 未读消息提示 - 只有当未读数大于0时才显示 */}
              {chat.unread !== undefined && chat.unread !== null && chat.unread > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                  data-testid={`${testId}-unread-badge`}>
                  {chat.unread}
                </div>
              )}
            </div>

            {/* 聊天信息 */}
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex justify-between">
                <span className="font-medium text-gray-800 dark:text-white truncate"
                  data-testid={`${testId}-name`}>
                  {chat.name}
                </span>
                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap"
                  data-testid={`${testId}-timestamp`}>
                  {chat.timestamp}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1"
                data-testid={`${testId}-last-message`}>
                {chat.lastMessage}
              </div>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem variant="destructive" onClick={handleDelete} data-testid={`${testId}-delete-button`}>
          删除聊天
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ChatListItem; 