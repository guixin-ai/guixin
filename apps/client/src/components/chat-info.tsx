import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
} from 'lucide-react';
import { Button } from './ui/button';
import { useChatStore } from '../models/chat.model';
import { ChatDetail, ChatMember } from '@/types/chat';
import { ChatNotFoundException, ChatDetailInitFailedException } from '@/errors/chat.errors';
import DelayedLoading from './delayed-loading';
import { useShallow } from 'zustand/react/shallow';
import { chatService } from '@/services/chat.service';

interface ChatInfoPageProps {
  // 回调函数，用于返回上一级界面
  onBack: () => void;
  // 聊天ID参数
  chatId: string;
  // 添加成员回调
  onAddMember?: () => void;
  // 添加创建朋友回调
  onCreateFriend?: () => void;
}

const ChatInfoPage = ({ onBack, chatId, onAddMember, onCreateFriend }: ChatInfoPageProps) => {
  const [chatDetail, setChatDetail] = useState<ChatDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 使用聊天模型 - 获取需要的状态和方法
  const { chatDetails, initializedChatDetailIds, initializeChatDetail } = useChatStore(
    useShallow(state => ({
      chatDetails: state.chatDetails,
      initializedChatDetailIds: state.initializedChatDetailIds,
      initializeChatDetail: state.initializeChatDetail
    }))
  );

  // 加载聊天数据
  useEffect(() => {
    if (!chatId) return;

    const initializeData = async () => {
      setLoading(true);

      try {
        // 检查是否已初始化
        if (!initializedChatDetailIds[chatId]) {
          // 如果未初始化，调用服务获取聊天详情
          const chatItem = await chatService.getChatById(chatId);
          
          // 如果没有找到，抛出异常
          if (!chatItem) {
            throw new ChatNotFoundException(chatId);
          }
          
          // 转换成详情对象
          const newChatDetail: ChatDetail = {
            id: chatItem.id,
            name: chatItem.name,
            avatar: chatItem.avatar,
            isAI: true, // 假设所有聊天都是AI
            members: [
              {
                id: 'current-user',
                name: '我',
                avatar: '我',
                username: '@自如'
              },
              {
                id: chatItem.id,
                name: chatItem.name,
                avatar: chatItem.avatar,
                isAI: true,
                username: '@自如'
              }
            ]
          };
          
          // 调用同步的初始化方法设置数据
          initializeChatDetail(chatId, newChatDetail);
        }

        // 从状态中获取聊天详情
        const detail = chatDetails[chatId];

        // 如果没有找到，抛出异常
        if (!detail) {
          throw new ChatNotFoundException(chatId);
        }

        // 设置聊天详情
        setChatDetail(detail);
      } catch (error) {
        // 处理不同类型的错误
        if (error instanceof ChatNotFoundException) {
          console.error(`聊天未找到: ${error.message}`);
        } else if (error instanceof ChatDetailInitFailedException) {
          console.error(`聊天详情初始化失败: ${error.message}`);
        } else {
          console.error('加载聊天数据失败:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [chatId, chatDetails, initializedChatDetailIds, initializeChatDetail]);

  const handleAddMember = () => {
    if (onAddMember) {
      onAddMember();
    }
  };

  const handleCreateFriend = () => {
    if (onCreateFriend) {
      onCreateFriend();
    }
  };

  return (
    <DelayedLoading loading={loading}>
      <div className="fixed inset-0 z-50 flex flex-col h-screen bg-gray-900 text-white">
        {/* 头部 */}
        <div className="flex items-center p-3 bg-gray-900 border-b border-gray-800">
          <Button variant="ghost" size="icon" className="text-gray-300 mr-2" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>

          <div className="flex-1 text-center">
            <h2 className="font-medium text-white">聊天信息</h2>
          </div>

          <div className="w-8"></div>
        </div>

        {/* 聊天成员 */}
        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-gray-400 text-sm mb-4">聊天成员</h4>
            <div className="flex flex-wrap gap-4">
              {chatDetail?.members?.map((member) => (
                <div key={member.id} className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-md bg-green-500 flex items-center justify-center text-white font-semibold mb-1">
                    {member.avatar}
                  </div>
                  <span className="text-xs text-gray-300">{member.name}</span>
                  <span className="text-xs text-gray-400">{member.username}</span>
                </div>
              ))}
              <div className="flex flex-col items-center cursor-pointer" onClick={handleAddMember}>
                <div className="w-14 h-14 rounded-md border border-dashed border-gray-600 flex items-center justify-center text-gray-400 mb-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-400">添加</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DelayedLoading>
  );
};

export default ChatInfoPage; 