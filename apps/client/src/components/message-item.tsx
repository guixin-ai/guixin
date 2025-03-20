import React from 'react';
import { ChatMember } from '@/types/chat';

// 虚拟消息类型
export interface VirtuosoMessageItem {
  key: string;
  content: string;
  isSelf: boolean;
  timestamp: string;
  isStreaming?: boolean;
  senderId?: string;
}

// 联系人类型
interface Contact {
  id: string;
  name: string;
  avatar: string;
  isAI?: boolean;
}

interface MessageItemContentProps {
  data: VirtuosoMessageItem;
  contact: Contact | null;
  aiMembers?: ChatMember[];
}

// 消息项渲染组件 - 使用Gemini风格
export const MessageItemContent: React.FC<MessageItemContentProps> = ({ 
  data, 
  contact,
  aiMembers = [] 
}) => {
  const ownMessage = data.isSelf;

  // 获取消息发送者信息
  const getSender = () => {
    if (data.isSelf) return null;
    
    // 如果有指定的senderId，则从AI成员列表中查找
    if (data.senderId && aiMembers.length > 0) {
      const sender = aiMembers.find(member => member.id === data.senderId);
      if (sender) {
        return {
          name: sender.name,
          avatar: sender.avatar,
          isAI: sender.isAI || false
        };
      }
    }
    
    // 如果没有找到，则使用默认联系人
    return contact;
  };
  
  const sender = getSender();

  return (
    <div className="py-4">
      <div className={`flex ${ownMessage ? 'justify-end' : 'justify-start'}`}>
        {/* 对方消息 */}
        {!data.isSelf && sender && (
          <div className="flex items-start max-w-[80%]">
            <div className="w-8 h-8 rounded-md bg-green-500 flex items-center justify-center text-white font-semibold text-xs mr-2 mt-1">
              {sender.avatar}
            </div>
            <div>
              {/* 显示发送者名称 */}
              {sender.name && sender.name !== contact?.name && (
                <div className="text-xs text-gray-500 mb-1">
                  {sender.name}
                  {sender.isAI && <span className="text-xs text-green-400 ml-1">AI</span>}
                </div>
              )}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-gray-800 dark:text-white">
                {data.content}
                {data.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse"></span>
                )}
              </div>
              <div className="text-left mt-1">
                <span className="text-xs text-gray-500">{data.timestamp}</span>
              </div>
            </div>
          </div>
        )}

        {/* 自己的消息 */}
        {data.isSelf && (
          <div className="max-w-[80%]">
            <div className="bg-blue-600 rounded-lg p-3 text-white">{data.content}</div>
            <div className="flex justify-end items-center mt-1">
              <span className="text-xs text-gray-500">{data.timestamp}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItemContent; 