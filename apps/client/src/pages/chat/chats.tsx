import { useState, useEffect, useRef } from 'react';
import useChatsStore from '../../models/routes/chat-chats.model';
import { useUserStore } from '../../models/user.model';
import { ChatList } from '../../components/chat-list/chat-list';
import { ChatWindow, ChatWindowRef } from '../../components/chat-window/chat-window';

/**
 * 聊天对话组件的属性接口
 */
interface ChatConversationProps {
  /** 聊天的ID */
  chatId: string;
  /** 是否禁用输入框 */
  disabled?: boolean;
  /** 输入框占位符文本 */
  inputPlaceholder?: string;
}

/**
 * 聊天对话组件
 *
 * 封装ChatWindow组件，并提供消息发送功能
 */
const ChatConversation = ({
  chatId,
  disabled = false,
  inputPlaceholder = '输入消息...',
}: ChatConversationProps) => {
  const chatWindowRef = useRef<ChatWindowRef>(null);
  const [activeChat, setActiveChat] = useState<
    | {
        id: string;
        name: string;
        avatar: string;
      }
    | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 使用聊天store
  const {
    loadConversation,
    sendMessage,
    currentConversation,
    isLoadingConversation,
    loadError,
    loadMessages,
  } = useChatsStore();

  // 加载聊天信息
  useEffect(() => {
    console.log('ChatConversation: 开始加载聊天信息, chatId =', chatId);

    const loadChat = async () => {
      if (!chatId) {
        console.log('ChatConversation: 无效的chatId，不执行加载');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('ChatConversation: 开始调用loadConversation...');
        // 使用chats store加载会话
        await loadConversation(chatId);
        console.log('ChatConversation: loadConversation完成');

        // 获取当前会话状态
        const conv = useChatsStore.getState().currentConversation;
        console.log('ChatConversation: 当前会话状态:', conv ? '已加载' : '未加载');

        if (conv) {
          console.log('ChatConversation: 设置activeChat');
          setActiveChat({
            id: conv.chatId,
            name: conv.title,
            avatar: conv.title.charAt(0).toUpperCase(),
          });
        } else {
          console.warn('ChatConversation: 加载会话后currentConversation仍为null');
        }
      } catch (err) {
        console.error('ChatConversation: 加载聊天信息失败:', err);
        setError(err instanceof Error ? err.message : '加载聊天信息失败');
      } finally {
        console.log('ChatConversation: 加载完成，设置loading = false');
        setLoading(false);
      }
    };

    loadChat();

    // 清理函数
    return () => {
      console.log('ChatConversation: 组件卸载，chatId =', chatId);
    };
  }, [chatId, loadConversation]); // 移除currentConversation依赖，防止循环更新

  // 监听currentConversation变化，更新activeChat
  useEffect(() => {
    console.log('ChatConversation: currentConversation发生变化');
    if (currentConversation) {
      console.log('ChatConversation: 更新activeChat');
      setActiveChat({
        id: currentConversation.chatId,
        name: currentConversation.title,
        avatar: currentConversation.title.charAt(0).toUpperCase(),
      });
    }
  }, [currentConversation]);

  // 加载消息
  const handleLoadMessages = async () => {
    console.log('ChatConversation: 加载消息');
    if (!activeChat) return [];

    try {
      const messages = await loadMessages(activeChat.id);

      // 转换为 MessageWithStatus 类型
      return messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        time: msg.time,
        sender: msg.sender,
        isSelf: msg.isSelf,
        status: msg.status === 'delivered' || msg.status === 'read' ? 'sent' : msg.status,
      }));
    } catch (error) {
      console.error('ChatConversation: 加载消息失败', error);
      return [];
    }
  };

  // 发送消息
  const handleSendMessage = async (content: string) => {
    if (!chatWindowRef.current) {
      console.warn('ChatConversation: chatWindowRef未初始化');
      return;
    }

    console.log('ChatConversation: 准备发送消息:', content);

    // 创建临时消息并获取消息ID
    const messageId = chatWindowRef.current.sendMessage(content);

    try {
      // 使用store发送消息
      console.log('ChatConversation: 调用store发送消息');
      await sendMessage(content, 'text');

      console.log('ChatConversation: 消息发送成功，更新UI');
      // 更新消息状态为已发送
      chatWindowRef.current.updateMessageStatus(messageId, 'sent');
    } catch (err) {
      console.error('ChatConversation: 发送消息失败:', err);

      // 更新消息状态为错误
      chatWindowRef.current.updateMessageStatus(
        messageId,
        'error',
        err instanceof Error ? err.message : '发送消息失败'
      );
    }
  };

  if (loading || isLoadingConversation) {
    return <div className="flex-1 flex items-center justify-center">加载中...</div>;
  }

  if (error || loadError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-2">加载失败: {error || loadError}</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <ChatWindow
      ref={chatWindowRef}
      activeChat={activeChat}
      onLoadMessages={handleLoadMessages}
      onSendMessage={handleSendMessage}
      disabled={disabled}
      inputPlaceholder={inputPlaceholder}
    />
  );
};

export const ChatPage = () => {
  const {
    chats,
    activeChatId,
    isLoadingChats,
    loadError,
    setActiveChat,
    loadChats,
    clearCurrentConversation,
  } = useChatsStore();

  const { currentUser } = useUserStore();

  // 获取当前活跃聊天
  const activeChat = chats.find(chat => chat.id === activeChatId);

  // 初始化加载聊天列表 - 使用优化的getUserChats方法
  useEffect(() => {
    if (currentUser) {
      // 调用loadChats方法，内部已经更新为使用getUserChats
      loadChats(currentUser.id);
    }

    // 清除会话状态
    return () => {
      clearCurrentConversation();
    };
  }, [currentUser, loadChats, clearCurrentConversation]);

  // 适配聊天列表所需的类型格式
  const formattedChats = chats.map(chat => ({
    id: chat.id,
    name: chat.name,
    avatar: chat.avatar || chat.name.charAt(0),
    lastMessage: chat.lastMessage,
    lastMessageTime: chat.lastMessageTime,
    unread: chat.unread,
  }));

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* 聊天列表 */}
      <ChatList
        chats={formattedChats}
        activeChatId={activeChatId}
        isLoadingChats={isLoadingChats}
        loadError={loadError}
        onChatSelect={setActiveChat}
      />

      {/* 聊天窗口区域 */}
      <div className="flex-1 flex flex-col">
        {activeChatId ? (
          <ChatConversation chatId={activeChatId} inputPlaceholder="输入消息..." />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            请选择或创建一个聊天
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
