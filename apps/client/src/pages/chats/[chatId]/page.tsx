import { AIMember, useAIQueueStore } from '@/models/ai-queue.model';
import { ChatMember, ChatMessage } from '@/types/chat';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLoaderData } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import {
  VirtuosoMessage,
  VirtuosoMessageListMethods,
} from '../../../components/lib/virtuoso-message/virtuoso-message';
import MessageItemContent, { VirtuosoMessageItem } from '../../../components/message-item';
import { Button } from '../../../components/ui/button';
import { OllamaMessage } from '../../../services/ollama.service';
import { useFetcher } from 'react-router-dom';
import { ChatInput, ChatContact } from '../../../components/chat-input';

// 聊天详情页加载器数据类型
interface ChatDetailLoaderData {
  success: boolean;
  error?: string;
  chat: {
    id: string;
    name: string;
    avatar: string[];
    isAI?: boolean;
    members?: ChatMember[];
  } | null;
  messages: ChatMessage[];
}

// 消息发送返回数据类型
interface SendMessageFetcherData {
  success: boolean;
  error?: string;
  message?: ChatMessage;
}

// 聊天详情页组件
const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  
  // 创建fetcher用于发送消息
  const messageFetcher = useFetcher<SendMessageFetcherData>();
  
  // 从loader获取数据
  const data = useLoaderData<ChatDetailLoaderData>();
  
  const chatDetail = data.success ? data.chat : null;
  const initialMessages = data.success ? data.messages : [];
  const hasError = !data.success;
  const errorMessage = data.error;
  
  const virtuosoRef = useRef<VirtuosoMessageListMethods<VirtuosoMessageItem>>(null);
  const [contact, setContact] = useState<ChatContact | null>(null);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [isMessagesInitialized, setIsMessagesInitialized] = useState(false);
  const [messages, setMessages] = useState<VirtuosoMessageItem[]>([]);

  // 获取AI队列相关方法
  const aiQueueStore = useAIQueueStore(
    useShallow(state => ({
      registerHandlers: state.registerHandlers,
      updateChatHistory: state.updateChatHistory,
      addToQueue: state.addToQueue,
      cancelChat: state.cancelChat,
    }))
  );

  // 转换ChatMessage为VirtuosoMessageItem
  const convertToVirtuosoMessage = (message: ChatMessage): VirtuosoMessageItem => {
    return {
      key: message.id,
      content: message.content,
      isSelf: message.isSelf,
      timestamp: message.timestamp,
    };
  };

  // 初始化聊天数据
  useEffect(() => {
    if (!chatDetail || !chatId) return;
    
    // 设置联系人信息
    setContact({
      id: chatDetail.id,
      name: chatDetail.name,
      avatar: chatDetail.avatar[0],
      isAI: chatDetail.isAI || false,
    });
    
    // 转换消息格式并设置到状态
    const virtuosoMessages = initialMessages.map(convertToVirtuosoMessage);
    setMessages(virtuosoMessages);
    setIsMessagesInitialized(true);
  }, [chatDetail, chatId, initialMessages]);

  // 注册AI队列处理器
  useEffect(() => {
    if (!chatId) return;
    
    // 定义当前聊天的消息处理器
    const handlers = {
      // 当AI开始回复时调用
      onStart: (messageId: string, aiMember: AIMember) => {
        // 标记AI正在响应
        setIsAIResponding(true);

        // 在UI中创建一个空消息气泡
        const aiMessage: VirtuosoMessageItem = {
          key: messageId,
          content: '',
          isSelf: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isStreaming: true,
          senderId: aiMember.id,
        };

        // 添加到UI组件
        if (virtuosoRef.current && isMessagesInitialized) {
          virtuosoRef.current.data.append([aiMessage]);
        }

        // 同步到后端 - 使用fetcher发送消息
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageFetcher.submit(
          { 
            chatId, 
            messageId,
            content: '',
            isSelf: 'false',
            timestamp: currentTime
          },
          { method: "post", action: "/api/chats/send-message" }
        );
      },

      // 当收到AI部分回复内容时调用
      onContent: (messageId: string, content: string, aiMember: AIMember) => {
        // 更新UI中的消息内容 - 直接使用服务传来的完整内容
        if (virtuosoRef.current && isMessagesInitialized) {
          virtuosoRef.current.data.map(msg => {
            if (msg.key === messageId) {
              return {
                ...msg,
                content: content, // 直接使用服务传来的完整内容，不需要拼接
              };
            }
            return msg;
          });
        }

        // 定期更新消息内容到后端 - 使用防抖处理
        // 这里简化实现，实际应用中可能需要更复杂的防抖逻辑
        if (content.length % 50 === 0) {
          messageFetcher.submit(
            { 
              chatId, 
              messageId,
              content,
              update: 'true'
            },
            { method: "post", action: "/api/chats/send-message" }
          );
        }
      },

      // 当AI回复完成时调用
      onComplete: (messageId: string, fullContent: string, aiMember: AIMember) => {
        if (virtuosoRef.current && isMessagesInitialized) {
          virtuosoRef.current.data.map(msg => {
            if (msg.key === messageId) {
              return {
                ...msg,
                content: fullContent,
                isStreaming: false,
              };
            }
            return msg;
          });
        }

        // 最终更新完整内容到后端
        messageFetcher.submit(
          { 
            chatId, 
            messageId,
            content: fullContent,
            update: 'true',
            isComplete: 'true'
          },
          { method: "post", action: "/api/chats/send-message" }
        );

        // 取消AI响应状态
        setIsAIResponding(false);
      },

      // 当AI回复出错时调用
      onError: (messageId: string, error: Error, aiMember: AIMember) => {
        if (virtuosoRef.current && isMessagesInitialized) {
          virtuosoRef.current.data.map(msg => {
            if (msg.key === messageId) {
              return {
                ...msg,
                content: error.message,
                isStreaming: false,
                isError: true,
              };
            }
            return msg;
          });
        }

        // 更新错误消息到后端
        messageFetcher.submit(
          { 
            chatId, 
            messageId,
            content: `错误: ${error.message}`,
            update: 'true',
            isError: 'true'
          },
          { method: "post", action: "/api/chats/send-message" }
        );

        // 取消AI响应状态
        setIsAIResponding(false);
      },
    };

    // 注册处理器并获取取消注册函数
    const unregister = aiQueueStore.registerHandlers(chatId, handlers);

    // 组件卸载时取消注册
    return () => {
      unregister();
      // 确保取消当前聊天的所有AI回复
      aiQueueStore.cancelChat(chatId);
    };
  }, [chatId, isMessagesInitialized, messageFetcher, aiQueueStore]);

  // 返回聊天列表
  const handleBack = () => {
    navigate('/home/chats');
  };

  // 跳转到聊天信息页面
  const handleOpenChatInfo = () => {
    if (chatId) {
      navigate(`/chats/${chatId}/info`);
    }
  };

  // 发送消息
  const handleSend = (message: string) => {
    if (!chatId) return;
    
    // 如果没有输入内容或AI正在响应，则不发送消息
    if (!message.trim() || isAIResponding) return;

    const userMessageId = `user-${Date.now()}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 创建用户消息
    const userMessage: VirtuosoMessageItem = {
      key: userMessageId,
      content: message,
      isSelf: true,
      timestamp: currentTime,
    };

    // 直接添加到UI，优先响应界面变化
    if (virtuosoRef.current && isMessagesInitialized) {
      virtuosoRef.current.data.append([userMessage], ({ scrollInProgress, atBottom }) => {
        return {
          index: 'LAST',
          align: 'start',
          behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
        };
      });
    } else {
      // 如果组件未初始化，初始化组件并显示消息
      setMessages([userMessage]);
      setIsMessagesInitialized(true);
    }

    // 将用户消息保存到后端 - 使用fetcher发送消息
    messageFetcher.submit(
      { 
        chatId, 
        messageId: userMessageId,
        content: message,
        isSelf: 'true',
        timestamp: currentTime
      },
      { method: "post", action: "/api/chats/send-message" }
    );

    // 使用aiQueueStore处理AI回复
    // 准备历史消息 - 包括刚才的用户消息
    const allCurrentMessages = [...initialMessages, {
      id: userMessageId,
      content: message,
      isSelf: true,
      timestamp: currentTime
    }];
    
    // 格式化消息为Ollama格式
    const chatHistory: OllamaMessage[] = allCurrentMessages.map(msg => ({
      role: msg.isSelf ? 'user' : 'assistant',
      content: msg.content,
    }));

    // 初始化aiQueueStore的历史记录 (已包含最新的用户消息)
    aiQueueStore.updateChatHistory(chatId, chatHistory);

    // 获取聊天中的AI成员
    if (!chatDetail || !chatDetail.members) return;

    // 过滤出所有AI成员
    const aiMembers = chatDetail.members.filter(member => member.isAI);
    if (aiMembers.length === 0) return;

    // 为每个AI成员创建回复任务
    aiMembers.forEach(aiMember => {
      // 生成唯一消息ID
      const messageId = `ai-${aiMember.id}-${Date.now()}`;

      // 添加到队列
      aiQueueStore.addToQueue({
        chatId,
        messageId,
        aiMember: {
          id: aiMember.id,
          name: aiMember.name,
          avatar: typeof aiMember.avatar === 'string' ? aiMember.avatar : aiMember.avatar[0],
          description: aiMember.description,
          isAI: true,
        },
        modelName: 'gemma3:1b', // 可配置
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      });
    });
  };

  // 修改取消生成函数，使用aiQueueStore
  const cancelCurrentGeneration = () => {
    if (!chatId) return;
    
    // 取消当前聊天的所有AI回复
    aiQueueStore.cancelChat(chatId);
    // 重置AI响应状态
    setIsAIResponding(false);
  };

  // 获取聊天成员作为联系人列表
  const getContactsFromMembers = (): ChatContact[] => {
    if (!chatDetail || !chatDetail.members) return [];
    
    return chatDetail.members.map(member => ({
      id: member.id,
      name: member.name,
      avatar: typeof member.avatar === 'string' ? member.avatar : member.avatar[0],
      isAI: member.isAI || false
    }));
  };

  // 聊天页面
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 头部 */}
      <div className="flex items-center p-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 dark:text-gray-300 mr-2"
          onClick={handleBack}
        >
          <ArrowLeft size={20} />
        </Button>

        <div className="flex-1 text-center">
          <h2 className="font-medium text-gray-800 dark:text-white">
            {contact?.name}
            {contact?.isAI && <span className="text-xs text-green-400 ml-2">AI助手</span>}
          </h2>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 dark:text-gray-300"
          onClick={handleOpenChatInfo}
        >
          <MoreVertical size={20} />
        </Button>
      </div>

      {/* 错误提示 */}
      {hasError && (
        <div className="p-4 m-4 bg-red-500/20 text-red-400 rounded-md">
          <p>{errorMessage || '加载聊天失败'}</p>
        </div>
      )}

      {/* 消息区域 - 使用VirtuosoMessage组件 */}
      {isMessagesInitialized ? (
        <VirtuosoMessage<VirtuosoMessageItem, null>
          ref={virtuosoRef}
          className="flex-1 h-full bg-gray-100 dark:bg-gray-900"
          computeItemKey={({ data }) => data.key}
          ItemContent={({ data }) => (
            <MessageItemContent
              data={data}
              contact={contact}
              aiMembers={chatDetail?.members || []}
            />
          )}
          initialData={messages}
          initialLocation={{ index: 'LAST', align: 'end' }}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <p className="text-gray-500">加载消息...</p>
        </div>
      )}

      {/* 输入区域 */}
      <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <ChatInput 
          onSend={handleSend}
          placeholder="输入消息..."
          loading={isAIResponding || messageFetcher.state === 'submitting'}
          contacts={getContactsFromMembers()}
        />
        
        {isAIResponding && (
          <div className="flex items-center mt-2 px-2">
            <div className="text-gray-500 text-xs mr-2 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              <div
                className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 text-xs ml-1"
              onClick={cancelCurrentGeneration}
            >
              终止生成
            </Button>
          </div>
        )}
        
        {hasError && (
          <div className="text-red-500 text-xs mt-2 px-2">{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

// 导出聊天页面组件
export default ChatPage;
