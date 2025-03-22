import {
  ChatDetailInitFailedException,
  ChatMessagesInitFailedException,
  ChatNotFoundException,
} from '@/errors/chat.errors';
import { AIMember, useAIQueueStore } from '@/models/ai-queue.model';
import { aiProcessor } from '@/services/ai-processor.service';
import { ChatMember, ChatMessage } from '@/types/chat';
import { ArrowLeft, Mic, MoreVertical, Paperclip, Send, Smile } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import ChatInfoPage from '../components/chat-info';
import DelayedLoading from '../components/delayed-loading';
import {
  VirtuosoMessage,
  VirtuosoMessageListMethods,
} from '../components/lib/virtuoso-message/virtuoso-message';
import MessageItemContent, { VirtuosoMessageItem } from '../components/message-item';
import NewChat from '../components/new-chat';
import { Button } from '../components/ui/button';
import { useChatStore } from '../models/chat.model';
import { useContactStore } from '../models/contact.model';
import { OllamaMessage } from '../services/ollama.service';
import { chatService } from '@/services/chat.service';

// 联系人类型
interface Contact {
  id: string;
  name: string;
  avatar: string;
  isAI?: boolean;
}

// 新增 ChatPageWrapper 组件
const ChatPageWrapper = () => {
  const { chatId } = useParams<{ chatId: string }>();
  if (!chatId) {
    throw new ChatNotFoundException('未指定聊天ID');
  }
  return <ChatPageContent chatId={chatId} />;
};

// 将原 ChatPage 组件重命名为 ChatPageContent，并接收 chatId 作为 props
const ChatPageContent = ({ chatId }: { chatId: string }) => {
  const navigate = useNavigate();
  const virtuosoRef = useRef<VirtuosoMessageListMethods<VirtuosoMessageItem>>(null);
  const [inputValue, setInputValue] = useState('');
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [isMessagesInitialized, setIsMessagesInitialized] = useState(false);
  const [initialMessages, setInitialMessages] = useState<VirtuosoMessageItem[]>([]);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  // 添加输入框引用，用于保持焦点
  const inputRef = useRef<HTMLInputElement>(null);

  // 使用 useShallow 和选择器获取需要的状态和方法
  const chatStore = useChatStore(
    useShallow(state => ({
      chatDetails: state.chatDetails,
      chatMessages: state.chatMessages,
      initializedChatDetailIds: state.initializedChatDetailIds,
      initializedChatIds: state.initializedChatIds,
      initializeChatDetail: state.initializeChatDetail,
      initializeChatMessages: state.initializeChatMessages,
      addChatMessage: state.addChatMessage,
      updateChatMessage: state.updateChatMessage,
      getChatDetail: state.getChatDetail,
      getChatMessages: state.getChatMessages,
      addChatMember: state.addChatMember,
    }))
  );

  // 使用析构来简化后续访问
  const {
    chatDetails,
    chatMessages,
    initializedChatDetailIds,
    initializedChatIds,
    initializeChatDetail,
    initializeChatMessages,
    addChatMessage,
    updateChatMessage,
    getChatDetail,
    getChatMessages,
    addChatMember,
  } = chatStore;

  // 获取AI队列相关方法
  const aiQueueStore = useAIQueueStore(
    useShallow(state => ({
      registerHandlers: state.registerHandlers,
      updateChatHistory: state.updateChatHistory,
      addToQueue: state.addToQueue,
      cancelChat: state.cancelChat,
      getChatHistory: state.getChatHistory,
      queueItems: state.queueItems,
      processingItems: state.processingItems,
      startProcessing: state.startProcessing,
      completeProcessing: state.completeProcessing,
      errorProcessing: state.errorProcessing
    }))
  );

  // 使用联系人模型获取联系人详情 - 方法不需要重新创建
  const getContactDetail = useContactStore(state => state.getContactDetail);

  // 转换ChatMessage为VirtuosoMessageItem
  const convertToVirtuosoMessage = (message: ChatMessage): VirtuosoMessageItem => {
    return {
      key: message.id,
      content: message.content,
      isSelf: message.isSelf,
      timestamp: message.timestamp,
    };
  };

  // 加载聊天数据
  useEffect(() => {
    const loadChatData = async () => {
      setLoading(true);
      setIsMessagesInitialized(false);

      try {
        // 先检查聊天详情是否已初始化
        let chatDetail = null;
        if (initializedChatDetailIds[chatId]) {
          // 如果已经初始化，则直接使用缓存数据
          chatDetail = chatDetails[chatId];
        } else {
          // 如果未初始化，直接调用服务获取聊天详情
          const chatItem = await chatService.getChatById(chatId);

          // 如果没有找到，抛出异常
          if (!chatItem) {
            throw new ChatNotFoundException(chatId);
          }

          // 转换成详情对象
          chatDetail = {
            id: chatItem.id,
            name: chatItem.name,
            avatar: typeof chatItem.avatar === 'string' ? chatItem.avatar : chatItem.avatar[0],
            isAI: true, // 假设所有聊天都是AI
            members: [
              {
                id: 'current-user',
                name: '我',
                avatar: '我',
                username: '@自如',
              },
              {
                id: chatItem.id,
                name: chatItem.name,
                avatar: typeof chatItem.avatar === 'string' ? chatItem.avatar : chatItem.avatar[0],
                isAI: true,
                username: '@自如',
              },
            ],
          };

          // 调用同步的初始化方法设置数据
          initializeChatDetail(chatId, chatDetail);
        }

        // 设置联系人信息
        setContact({
          id: chatDetail.id,
          name: chatDetail.name,
          avatar: chatDetail.avatar,
          isAI: chatDetail.isAI || false,
        });

        // 先检查聊天消息是否已初始化
        let chatMessages = [];
        if (initializedChatIds[chatId]) {
          // 如果已经初始化，则直接使用缓存数据
          chatMessages = chatStore.chatMessages[chatId] || [];
        } else {
          // 如果未初始化，直接调用服务获取聊天消息
          chatMessages = await chatService.getChatMessages(chatId);

          // 调用同步的初始化方法设置数据
          initializeChatMessages(chatId, chatMessages);
        }

        // 转换为VirtuosoMessageItem
        const virtuosoMessages = chatMessages.map(convertToVirtuosoMessage);
        setInitialMessages(virtuosoMessages);

        setIsMessagesInitialized(true);
      } catch (error) {
        // 处理不同类型的错误
        if (error instanceof ChatNotFoundException) {
          console.error(`聊天未找到: ${error.message}`);
        } else if (error instanceof ChatDetailInitFailedException) {
          console.error(`聊天详情初始化失败: ${error.message}`);
        } else if (error instanceof ChatMessagesInitFailedException) {
          console.error(`聊天消息初始化失败: ${error.message}`);
        } else {
          console.error('加载聊天数据失败:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadChatData();
  }, [
    chatId,
    initializeChatDetail,
    initializeChatMessages,
    chatDetails,
    chatMessages,
    initializedChatDetailIds,
    initializedChatIds,
  ]);

  // 注册AI队列处理器
  useEffect(() => {
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

        // 同步到模型层 - 初始添加空消息
        const chatAiMessage: ChatMessage = {
          id: messageId,
          content: '',
          isSelf: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        addChatMessage(chatId, chatAiMessage);
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

        // 同步最终完整的响应到模型层
        updateChatMessage(chatId, messageId, fullContent);

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

        // 更新模型层中的错误消息
        updateChatMessage(chatId, messageId, error.message);

        // 取消AI响应状态
        setIsAIResponding(false);
      },
    };

    // 注册处理器并获取取消注册函数
    const unregister = aiQueueStore.registerHandlers(chatId, handlers);

    // 处理队列中的项目
    const processNextInQueue = async () => {
      const { queueItems, processingItems, getChatHistory } = aiQueueStore;
      
      // 如果当前已有处理中的项目，则不处理
      if (processingItems[chatId]) return;
      
      // 获取该聊天的队列
      const chatQueue = queueItems[chatId] || [];
      
      // 如果队列为空，则返回
      if (chatQueue.length === 0) return;
      
      // 获取下一个队列项
      const nextItem = chatQueue[0];
      
      // 获取消息历史
      const messages = getChatHistory(chatId);
      
      // 处理该队列项
      try {
        // 直接调用aiProcessor处理
        await aiProcessor.process({
          chatId: nextItem.chatId,
          messageId: nextItem.messageId,
          aiMember: nextItem.aiMember,
          modelName: nextItem.modelName,
          messages,
          options: nextItem.options,
          abortController: nextItem.abortController,
          callbacks: {
            onStart: (chatId, messageId) => {
              // 使用aiQueueStore的startProcessing
              aiQueueStore.startProcessing(chatId, messageId);
            },
            onContent: (chatId, messageId, content) => {
              // 更新UI界面
              if (virtuosoRef.current && isMessagesInitialized) {
                virtuosoRef.current.data.map(msg => {
                  if (msg.key === messageId) {
                    return {
                      ...msg,
                      content,
                    };
                  }
                  return msg;
                });
              }
            },
            onComplete: (chatId, messageId, content) => {
              // 使用aiQueueStore的completeProcessing
              aiQueueStore.completeProcessing(chatId, messageId, content);
              // 处理下一个队列项
              setTimeout(processNextInQueue, 100);
            },
            onError: (chatId, messageId, error) => {
              // 使用aiQueueStore的errorProcessing
              aiQueueStore.errorProcessing(chatId, messageId, error);
              // 处理下一个队列项
              setTimeout(processNextInQueue, 100);
            }
          }
        });
      } catch (error) {
        console.error('处理队列项失败:', error);
      }
    };

    // 监听队列变化，自动处理队列
    const unsubscribe = useAIQueueStore.subscribe(
      (state) => {
        // 返回当前聊天的队列长度
        return state.queueItems[chatId]?.length || 0;
      },
      (currentLength) => {
        if (currentLength > 0) {
          processNextInQueue();
        }
      }
    );

    // 组件卸载时取消注册
    return () => {
      unregister();
      unsubscribe();
      // 确保取消当前聊天的所有AI回复
      aiQueueStore.cancelChat(chatId);
    };
  }, [chatId, isMessagesInitialized, addChatMessage, updateChatMessage, aiQueueStore]);

  // 返回聊天列表
  const handleBack = () => {
    if (showNewChat) {
      setShowNewChat(false);
    } else if (showChatInfo) {
      setShowChatInfo(false);
    } else {
      navigate('/guichat/chats');
    }
  };

  // 显示添加成员组件
  const handleAddMember = () => {
    setShowChatInfo(false);
    setShowNewChat(true);
  };

  // 处理选择联系人
  const handleSelectContacts = async (contactIds: string[]) => {
    // 获取聊天详情
    const chatDetail = await getChatDetail(chatId);
    if (!chatDetail) return;

    // 为每个选择的联系人ID添加到聊天成员中
    for (const contactId of contactIds) {
      // 获取联系人详情
      const contactDetail = await getContactDetail(contactId);
      if (contactDetail) {
        const member: ChatMember = {
          id: contactDetail.id,
          name: contactDetail.name,
          avatar: contactDetail.avatar || contactDetail.name.charAt(0),
          username: `@${contactDetail.name}`,
        };
        addChatMember(chatId, member);
      }
    }

    // 关闭新聊天组件
    setShowNewChat(false);
  };

  // 发送消息
  const handleSend = () => {
    // 如果没有输入内容或AI正在响应，则不发送消息
    if (!inputValue.trim() || isAIResponding) return;

    const userMessageId = `user-${Date.now()}`;

    // 创建用户消息
    const userMessage: VirtuosoMessageItem = {
      key: userMessageId,
      content: inputValue,
      isSelf: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
      setInitialMessages([userMessage]);
      setIsMessagesInitialized(true);
    }

    // 保存用户输入，然后清空输入框
    const currentInput = inputValue;
    setInputValue('');

    // 将用户消息同步到模型层
    const chatMessage: ChatMessage = {
      id: userMessageId,
      content: currentInput,
      isSelf: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    addChatMessage(chatId, chatMessage);

    // 使用aiQueueStore处理AI回复
    // 1. 准备历史消息
    getChatMessages(chatId).then(messages => {
      // 2. 格式化消息为Ollama格式
      const chatHistory: OllamaMessage[] = messages.map(msg => ({
        role: msg.isSelf ? 'user' : 'assistant',
        content: msg.content,
      }));

      // 3. 初始化aiQueueStore的历史记录 (已包含最新的用户消息)
      aiQueueStore.updateChatHistory(chatId, chatHistory);

      // 5. 获取聊天中的AI成员
      const chatDetail = chatDetails[chatId];
      if (!chatDetail || !chatDetail.members) return;

      // 过滤出所有AI成员
      const aiMembers = chatDetail.members.filter(member => member.isAI);
      if (aiMembers.length === 0) return;

      // 6. 为每个AI成员创建回复任务
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
            avatar: aiMember.avatar || aiMember.name.charAt(0),
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
    });

    // 保持输入框焦点
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 按回车发送消息
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认行为，防止输入框换行

      // 只有在AI没有响应时才发送消息
      if (!isAIResponding) {
        handleSend();
      }
      // 如果AI正在响应，不做任何操作，但保持焦点在输入框上
    }
  };

  // 打开聊天信息设置
  const handleOpenChatInfo = () => {
    setShowChatInfo(true);
  };

  // 修改取消生成函数，使用aiQueueStore
  const cancelCurrentGeneration = () => {
    // 取消当前聊天的所有AI回复
    aiQueueStore.cancelChat(chatId);
    // 重置AI响应状态
    setIsAIResponding(false);
  };

  // 聊天页面（包括未找到聊天的情况）
  return (
    <>
      <DelayedLoading loading={loading}>
        {contact ? (
          <div className="flex flex-col h-screen bg-white dark:bg-black">
            {/* 聊天消息页面 - 始终显示 */}
            <>
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
                    {contact.name}
                    {contact.isAI && <span className="text-xs text-green-400 ml-2">AI助手</span>}
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
                      aiMembers={chatDetails[chatId]?.members || []}
                    />
                  )}
                  initialData={initialMessages}
                  initialLocation={{ index: 'LAST', align: 'end' }}
                />
              ) : (
                <div className="flex-1 bg-gray-100 dark:bg-gray-900"></div>
              )}

              {/* 输入区域 */}
              <div className="p-2 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500"
                    disabled={isAIResponding}
                  >
                    <Smile size={20} />
                  </Button>

                  <div className="flex-1 mx-1">
                    <input
                      ref={inputRef}
                      type="text"
                      className="w-full p-2 bg-transparent text-gray-800 dark:text-white focus:outline-none"
                      placeholder={isAIResponding ? 'AI正在回复中...' : '输入消息...'}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={false}
                    />
                  </div>

                  <div className="flex items-center">
                    {!inputValue.trim() && !isAIResponding && (
                      <>
                        <Button variant="ghost" size="icon" className="text-gray-500">
                          <Paperclip size={20} />
                        </Button>

                        <Button variant="ghost" size="icon" className="text-gray-500">
                          <Mic size={20} />
                        </Button>
                      </>
                    )}

                    {inputValue.trim() && !isAIResponding && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white bg-green-500 rounded-full p-1.5"
                        onClick={handleSend}
                      >
                        <Send size={18} />
                      </Button>
                    )}

                    {isAIResponding && (
                      <div className="flex items-center">
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
                  </div>
                </div>
              </div>
            </>
          </div>
        ) : (
          // 空白页面 - 不显示未找到聊天的提示
          <div className="h-screen bg-white dark:bg-black"></div>
        )}
      </DelayedLoading>
      {/* 聊天信息组件 - 条件渲染且浮动在上面 */}
      {showChatInfo && (
        <ChatInfoPage
          onBack={() => setShowChatInfo(false)}
          chatId={chatId}
          onAddMember={handleAddMember}
        />
      )}

      {/* 新聊天组件 - 条件渲染且浮动在上面 */}
      {showNewChat && (
        <NewChat
          onBack={() => setShowNewChat(false)}
          onComplete={handleSelectContacts}
          preSelectedContactIds={
            chatDetails[chatId]?.members?.map((member: ChatMember) => member.id) || []
          }
        />
      )}
    </>
  );
};

// 导出 ChatPageWrapper 作为默认组件
export default ChatPageWrapper;
