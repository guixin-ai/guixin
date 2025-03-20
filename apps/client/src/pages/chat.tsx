import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  Image,
  Mic,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useChatStore } from '../models/chat.model';
import { useContactStore } from '../models/contact.model';
import { ChatMessage, ChatMember } from '@/types/chat';
import {
  ChatNotFoundException,
  ChatListInitFailedException,
  ChatMessagesInitFailedException,
  ChatDetailInitFailedException,
} from '@/errors/chat.errors';
import DelayedLoading from '../components/delayed-loading';
import {
  VirtuosoMessage,
  VirtuosoMessageListMethods,
} from '../components/lib/virtuoso-message/virtuoso-message';
import {
  ollamaService,
  OllamaChatResponse,
  OllamaMessage,
  ChatStreamOptions,
} from '../services/ollama.service';
import {
  OllamaBaseError,
  OllamaConnectionError,
  OllamaStreamAbortedError,
  OllamaServiceUnavailableError,
  OllamaModelNotFoundError,
  OllamaModelLoadError,
} from '@/errors/ollama.errors';
import ChatInfoPage from '../components/chat-info';
import NewChat from '../components/new-chat';
import { useShallow } from 'zustand/react/shallow';
import MessageItemContent, { VirtuosoMessageItem } from '../components/message-item';

// 联系人类型
interface Contact {
  id: string;
  name: string;
  avatar: string;
  isAI?: boolean;
}

// 随机短语，用于模拟打字效果
const randomPhrases = [
  '我理解你的问题，',
  '让我思考一下，',
  '根据我的分析，',
  '这是一个很好的问题，',
  '从技术角度来看，',
  '考虑到你的需求，',
  '基于最佳实践，',
  '我认为这个想法不错，',
  '你提到的内容很有趣，',
  '这个问题有几个方面需要考虑，',
];

// 获取随机短语
function getRandomPhrase() {
  return randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
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
  
  // 添加AI队列相关状态
  const [aiQueue, setAiQueue] = useState<ChatMember[]>([]);
  const [currentAiIndex, setCurrentAiIndex] = useState(0);
  const [isAiQueueProcessing, setIsAiQueueProcessing] = useState(false);

  // 添加AbortController引用
  const abortControllerRef = useRef<AbortController | null>(null);
  // 添加输入框引用，用于保持焦点
  const inputRef = useRef<HTMLInputElement>(null);

  // 使用 useShallow 和选择器获取需要的状态和方法
  const chatStore = useChatStore(
    useShallow(state => ({
      chatDetails: state.chatDetails,
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
    initializeChatDetail,
    initializeChatMessages,
    addChatMessage,
    updateChatMessage,
    getChatDetail,
    getChatMessages,
    addChatMember,
  } = chatStore;

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
        // 初始化聊天详情
        const chatDetail = await initializeChatDetail(chatId);

        // 如果没有找到，抛出异常
        if (!chatDetail) {
          throw new ChatNotFoundException(chatId);
        }

        // 设置联系人信息
        setContact({
          id: chatDetail.id,
          name: chatDetail.name,
          avatar: chatDetail.avatar,
          isAI: chatDetail.isAI || false,
        });

        // 初始化聊天消息并转换为VirtuosoMessageItem
        const chatMessages = await initializeChatMessages(chatId);
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
  }, [chatId, initializeChatDetail, initializeChatMessages]);

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

  // 取消当前正在进行的生成
  const cancelCurrentGeneration = () => {
    if (abortControllerRef.current) {
      console.log('取消当前生成...');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      
      // 重置AI队列处理状态
      setIsAiQueueProcessing(false);
      setCurrentAiIndex(0);
      setAiQueue([]);
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

  // 准备AI队列
  const prepareAIQueue = async () => {
    // 从模型层直接获取聊天详情
    const chatDetail = chatDetails[chatId];
    
    // 如果模型层中没有聊天详情，尝试获取
    if (!chatDetail || !chatDetail.members) {
      const refreshedDetail = await getChatDetail(chatId);
      if (!refreshedDetail || !refreshedDetail.members) return [];
      
      // 过滤出所有AI成员
      const aiMembers = refreshedDetail.members.filter(member => member.isAI);
      return aiMembers;
    }
    
    // 过滤出所有AI成员
    const aiMembers = chatDetail.members.filter(member => member.isAI);
    
    // 如果没有AI成员，返回空数组
    if (aiMembers.length === 0) return [];
    
    // 返回AI成员队列
    return aiMembers;
  };

  // 使用Ollama生成AI回复
  const generateAIResponse = async (responseId: string, aiMember: ChatMember) => {
    setIsAIResponding(true);

    try {
      // 使用本地Ollama模型 - 这里使用gemma3模型
      const MODEL_NAME = 'gemma3:1b';

      // 准备聊天历史 - 在添加空消息前获取最新的消息列表
      const latestMessages = await getChatMessages(chatId);
      const chatHistory: OllamaMessage[] = latestMessages.map(msg => ({
        role: msg.isSelf ? 'user' : 'assistant',
        content: msg.content,
      }));

      // 创建虚拟联系人对象用于显示
      const aiContact: Contact = {
        id: aiMember.id,
        name: aiMember.name,
        avatar: aiMember.avatar,
        isAI: true,
      };

      // 创建初始空回复
      const aiMessage: VirtuosoMessageItem = {
        key: responseId,
        content: '',
        isSelf: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true,
        senderId: aiMember.id,
      };

      // 直接添加到UI组件
      if (virtuosoRef.current && isMessagesInitialized) {
        virtuosoRef.current.data.append([aiMessage]);
      }

      // 同步到模型层 - 初始添加空消息
      const chatAiMessage: ChatMessage = {
        id: responseId,
        content: '',
        isSelf: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addChatMessage(chatId, chatAiMessage);

      // 创建新的AbortController
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // 准备系统提示词（如果有）
      const systemMessages: OllamaMessage[] = [];
      if (aiMember.description) {
        systemMessages.push({
          role: 'system',
          content: aiMember.description
        });
      }

      // 合并系统消息和聊天历史
      const allMessages = [...systemMessages, ...chatHistory];

      // 使用服务层提供的可中断流方法
      await ollamaService.chatStream(
        {
          model: MODEL_NAME,
          messages: allMessages,
          stream: true,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        },
        { signal }, // 传入AbortSignal
        (chunk: OllamaChatResponse) => {
          // 处理每个响应块
          if (chunk.message?.content && typeof chunk.message.content === 'string') {
            // 维护一个局部变量记录当前的消息内容
            let currentContent = '';

            // 更新UI显示
            if (virtuosoRef.current && isMessagesInitialized) {
              virtuosoRef.current.data.map(msg => {
                if (msg.key === responseId) {
                  currentContent = msg.content + chunk.message.content;
                  return {
                    ...msg,
                    content: currentContent,
                  };
                }
                return msg;
              });
            }

            // 同步更新到模型层 - 使用updateChatMessage更新已有消息
            updateChatMessage(chatId, responseId, currentContent);
          }
        },
        (fullResponse: OllamaMessage) => {
          // 完成时处理
          const finalContent = fullResponse.content as string;

          if (virtuosoRef.current && isMessagesInitialized) {
            virtuosoRef.current.data.map(msg => {
              if (msg.key === responseId) {
                return {
                  ...msg,
                  content: finalContent,
                  isStreaming: false,
                };
              }
              return msg;
            });
          }

          // 同步最终完整的响应到模型层 - 使用updateChatMessage更新最终内容
          updateChatMessage(chatId, responseId, finalContent);

          setIsAIResponding(false);
          // 清除当前的AbortController
          abortControllerRef.current = null;
          
          // 处理AI队列中的下一个AI
          processNextAI();
        }
      );
    } catch (error: any) {
      // 使用新的异常类型进行处理
      let errorMessage = '抱歉，我暂时无法回答您的问题。';
      let isAborted = false;

      if (error instanceof OllamaStreamAbortedError) {
        // 流被用户中断
        isAborted = true;
        errorMessage = '(已中断)';
      } else if (error instanceof OllamaModelNotFoundError) {
        // 模型不存在
        errorMessage = `抱歉，所需的模型 ${error.modelName} 不存在。请确保该模型已安装。`;
      } else if (error instanceof OllamaModelLoadError) {
        // 模型加载失败
        errorMessage = `抱歉，模型 ${error.modelName} 加载失败。请检查模型是否损坏或重新安装。`;
      } else if (error instanceof OllamaServiceUnavailableError) {
        // 服务不可用
        errorMessage = '抱歉，Ollama服务不可用。请确保Ollama服务已启动并正常运行。';
      } else if (error instanceof OllamaConnectionError) {
        // 连接错误
        errorMessage = '抱歉，连接到Ollama服务失败。请检查网络连接和服务状态。';
      } else if (error instanceof OllamaBaseError) {
        // 其他Ollama错误
        errorMessage = `抱歉，Ollama服务出现错误: ${error.message}`;
      } else {
        // 未知错误
        console.error('调用Ollama服务失败:', error);
        errorMessage = '抱歉，我暂时无法回答您的问题。请检查Ollama服务是否正常运行。';
      }

      // 更新UI显示错误信息
      let finalErrorContent = '';

      if (virtuosoRef.current && isMessagesInitialized) {
        virtuosoRef.current.data.map(msg => {
          if (msg.key === responseId) {
            finalErrorContent = isAborted ? msg.content + errorMessage : errorMessage;
            return {
              ...msg,
              content: finalErrorContent,
              isStreaming: false,
            };
          }
          return msg;
        });
      }

      // 更新模型层中的错误消息
      updateChatMessage(chatId, responseId, finalErrorContent);

      setIsAIResponding(false);
      abortControllerRef.current = null;
      
      // 如果发生错误，也尝试处理下一个AI（除非是被用户中断的）
      if (!isAborted) {
        processNextAI();
      } else {
        // 如果是被用户中断，重置队列
        setIsAiQueueProcessing(false);
        setCurrentAiIndex(0);
        setAiQueue([]);
      }
    }
  };

  // 启动AI队列处理
  const startAIQueueProcessing = async () => {
    // 如果已经在处理队列，则不再重复启动
    if (isAiQueueProcessing) return;
    
    // 准备AI队列
    const aiMembers = await prepareAIQueue();
    if (aiMembers.length === 0) return;
    
    setAiQueue(aiMembers);
    setCurrentAiIndex(0);
    setIsAiQueueProcessing(true);
    
    // 开始处理第一个AI
    const firstAI = aiMembers[0];
    const responseId = `ai-${firstAI.id}-${Date.now()}`;
    generateAIResponse(responseId, firstAI);
  };

  // 处理队列中的下一个AI
  const processNextAI = () => {
    // 如果队列为空或当前索引已超出范围，结束处理
    if (aiQueue.length === 0 || currentAiIndex >= aiQueue.length - 1) {
      setIsAiQueueProcessing(false);
      setCurrentAiIndex(0);
      setAiQueue([]);
      return;
    }
    
    // 移动到下一个AI
    const nextIndex = currentAiIndex + 1;
    setCurrentAiIndex(nextIndex);
    
    // 获取下一个AI并生成回复
    const nextAI = aiQueue[nextIndex];
    const responseId = `ai-${nextAI.id}-${Date.now()}`;
    
    // 短暂延迟后开始下一个AI的回复，使界面有时间更新
    setTimeout(() => {
      generateAIResponse(responseId, nextAI);
    }, 500);
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

    // 延迟1秒后开始AI队列处理
    setTimeout(() => {
      startAIQueueProcessing();
    }, 1000);

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

  // 聊天页面（包括未找到聊天的情况）
  return (
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

          {/* 聊天信息组件 - 条件渲染且浮动在上面 */}
          {showChatInfo && (
            <div className="absolute inset-0 z-10 bg-white dark:bg-black">
              <ChatInfoPage
                onBack={() => setShowChatInfo(false)}
                chatId={chatId}
                onAddMember={handleAddMember}
              />
            </div>
          )}

          {/* 新聊天组件 - 条件渲染且浮动在上面 */}
          {showNewChat && (
            <div className="absolute inset-0 z-10 bg-white dark:bg-black">
              <NewChat
                onBack={() => setShowNewChat(false)}
                onComplete={handleSelectContacts}
                preSelectedContactIds={
                  chatDetails[chatId]?.members?.map((member: ChatMember) => member.id) || []
                }
              />
            </div>
          )}
        </div>
      ) : (
        // 空白页面 - 不显示未找到聊天的提示
        <div className="h-screen bg-white dark:bg-black"></div>
      )}
    </DelayedLoading>
  );
};

// 导出 ChatPageWrapper 作为默认组件
export default ChatPageWrapper;
