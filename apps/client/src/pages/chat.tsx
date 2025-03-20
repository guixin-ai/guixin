import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Smile, Image, Mic, MoreVertical, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useChat } from '../models/chat.model';
import { ChatMessage } from '@/types/chat';
import { 
  ChatNotFoundException, 
  ChatListInitFailedException, 
  ChatMessagesInitFailedException 
} from '@/errors/chat.errors';

// 联系人类型
interface Contact {
  id: string;
  name: string;
  avatar: string;
}

const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 使用聊天模型的状态和方法
  const { initialize, fetchChatById, initializeChatMessages, addChatMessage } = useChat();
  
  // 加载聊天数据
  useEffect(() => {
    if (!chatId) return;
    
    const loadChatData = async () => {
      setLoading(true);
      
      try {
        // 初始化聊天列表并直接获取列表数据
        const chatsList = await initialize();
        
        // 从返回的列表中查找聊天信息
        const chatInfo = chatsList.find(chat => chat.id === chatId);
        
        // 如果列表中没有找到，抛出异常
        if (!chatInfo) {
          throw new ChatNotFoundException(chatId);
        }
        
        // 设置联系人信息
        setContact({
          id: chatInfo.id,
          name: chatInfo.name,
          avatar: chatInfo.avatar,
        });
        
        // 初始化并获取聊天消息
        const chatMessages = await initializeChatMessages(chatId);
        setMessages(chatMessages);
      } catch (error) {
        // 处理不同类型的错误
        if (error instanceof ChatNotFoundException) {
          console.error(`聊天未找到: ${error.message}`);
        } else if (error instanceof ChatListInitFailedException) {
          console.error(`聊天列表初始化失败: ${error.message}`);
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
  }, [chatId, initialize, fetchChatById, initializeChatMessages]);
  
  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 返回聊天列表
  const handleBack = () => {
    if (showChatInfo) {
      setShowChatInfo(false);
    } else {
      navigate('/guichat/chats');
    }
  };
  
  // 发送消息
  const handleSend = () => {
    if (!inputValue.trim() || !chatId) return;
    
    const newMessage: ChatMessage = {
      id: `${Date.now()}`,
      content: inputValue,
      isSelf: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    // 添加消息到模型缓存
    addChatMessage(chatId, newMessage);
    // 更新本地状态
    setMessages([...messages, newMessage]);
    setInputValue('');
    
    // 模拟对方回复
    setTimeout(() => {
      const replyMessage: ChatMessage = {
        id: `${Date.now() + 1}`,
        content: '好的，我知道了',
        isSelf: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      // 添加回复消息到模型缓存
      addChatMessage(chatId, replyMessage);
      // 更新本地状态
      setMessages(prevMessages => [...prevMessages, replyMessage]);
    }, 1000);
  };
  
  // 按回车发送消息
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // 打开聊天信息设置
  const handleOpenChatInfo = () => {
    setShowChatInfo(true);
  };
  
  // 显示加载状态
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }
  
  if (!contact) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
        <p className="text-gray-500">未找到聊天</p>
      </div>
    );
  }
  
  // 按时间分组消息
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';
    
    messages.forEach(message => {
      // 在实际应用中应根据消息的实际时间戳计算日期
      // 这里简化为使用当前日期
      const today = new Date().toLocaleDateString();
      
      if (currentDate !== today) {
        currentDate = today;
        groups.push({ date: '今天', messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate();
  
  // 聊天信息设置页面
  if (showChatInfo) {
    return (
      <div className="flex flex-col h-screen bg-black text-white">
        {/* 头部 */}
        <div className="flex items-center p-3 bg-gray-900 border-b border-gray-800">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-300 mr-2"
            onClick={handleBack}
          >
            <ArrowLeft size={20} />
          </Button>
          
          <div className="flex-1 text-center">
            <h2 className="font-medium text-white">
              聊天信息
            </h2>
          </div>
          
          <div className="w-8"></div>
        </div>
        
        {/* 聊天参与者 */}
        <div className="p-4">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-md bg-green-500 flex items-center justify-center text-white text-2xl font-semibold mb-2">
              {contact.avatar}
            </div>
            <h3 className="text-lg font-medium">{contact.name}</h3>
          </div>
          
          {/* 添加聊天成员 */}
          <div className="mt-4 mb-2">
            <h4 className="text-gray-400 text-sm mb-2">聊天成员</h4>
            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-md bg-green-500 flex items-center justify-center text-white font-semibold mb-1">
                  我
                </div>
                <span className="text-xs">我</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-md bg-green-500 flex items-center justify-center text-white font-semibold mb-1">
                  {contact.avatar}
                </div>
                <span className="text-xs">{contact.name}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-md border border-dashed border-gray-600 flex items-center justify-center text-gray-400 mb-1">
                  +
                </div>
                <span className="text-xs text-gray-400">添加</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 功能列表 */}
        <div className="mt-2">
          <div className="bg-gray-900">
            {/* 查找聊天记录 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <span>查找聊天记录</span>
              <ChevronRight size={20} className="text-gray-600" />
            </div>
            
            {/* 消息免打扰 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <span>消息免打扰</span>
              <div className="w-12 h-6 rounded-full bg-gray-700 relative">
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white"></div>
              </div>
            </div>
            
            {/* 置顶聊天 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <span>置顶聊天</span>
              <div className="w-12 h-6 rounded-full bg-green-500 relative">
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white"></div>
              </div>
            </div>
            
            {/* 提醒 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <span>提醒</span>
              <div className="w-12 h-6 rounded-full bg-gray-700 relative">
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
          
          <div className="mt-2 bg-gray-900">
            {/* 设置当前聊天背景 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <span>设置当前聊天背景</span>
              <ChevronRight size={20} className="text-gray-600" />
            </div>
            
            {/* 清空聊天记录 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <span>清空聊天记录</span>
              <ChevronRight size={20} className="text-gray-600" />
            </div>
            
            {/* 投诉 */}
            <div className="flex items-center justify-between p-4">
              <span>投诉</span>
              <ChevronRight size={20} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // 聊天页面
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black">
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
      
      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="px-4">
            {/* 日期分隔线 */}
            <div className="flex justify-center my-4">
              <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-500 dark:text-gray-400">
                {group.date}
              </div>
            </div>
            
            {/* 消息列表 */}
            {group.messages.map(message => (
              <div 
                key={message.id}
                className={`flex mb-4 ${message.isSelf ? 'justify-end' : 'justify-start'}`}
              >
                {/* 对方消息 */}
                {!message.isSelf && (
                  <div className="flex items-end max-w-[70%]">
                    <div className="w-8 h-8 rounded-md bg-green-500 flex items-center justify-center text-white font-semibold text-xs mr-2">
                      {contact.avatar}
                    </div>
                    <div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-gray-800 dark:text-white">
                        {message.content}
                      </div>
                      <div className="text-left mt-1">
                        <span className="text-xs text-gray-500">
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 自己的消息 */}
                {message.isSelf && (
                  <div className="max-w-[70%]">
                    <div className="bg-green-500 rounded-lg p-3 text-white">
                      {message.content}
                    </div>
                    <div className="flex justify-end items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} className="h-4" />
      </div>
      
      {/* 输入区域 */}
      <div className="p-2 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-1">
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Smile size={20} />
          </Button>
          
          <div className="flex-1 mx-1">
            <input
              type="text"
              className="w-full p-2 bg-transparent text-gray-800 dark:text-white focus:outline-none"
              placeholder="输入消息..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          
          <div className="flex items-center">
            {!inputValue.trim() && (
              <>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Paperclip size={20} />
                </Button>
                
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Mic size={20} />
                </Button>
              </>
            )}
            
            {inputValue.trim() && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white bg-green-500 rounded-full p-1.5"
                onClick={handleSend}
              >
                <Send size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 