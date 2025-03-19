import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Smile, Image, Mic, MoreVertical, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

// 消息类型
interface Message {
  id: string;
  content: string;
  isSelf: boolean;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

// 联系人类型
interface Contact {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
}

const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [showChatInfo, setShowChatInfo] = useState(false);
  
  // 模拟加载聊天数据
  useEffect(() => {
    // 假设联系人数据
    const mockContact: Contact = {
      id: chatId || '1',
      name: chatId === '1' ? '文件传输助手' : 
            chatId === '2' ? '老婆' : 
            chatId === '3' ? '张薇张薇' : '陌生人',
      avatar: chatId === '1' ? '文' : 
              chatId === '2' ? '老' : 
              chatId === '3' ? '张' : '陌',
      online: chatId === '2' || chatId === '3',
    };
    
    // 假设消息历史
    const mockMessages: Message[] = [
      {
        id: '1',
        content: '你好啊',
        isSelf: false,
        timestamp: '10:00',
        status: 'read',
      },
      {
        id: '2',
        content: '最近怎么样？',
        isSelf: false,
        timestamp: '10:01',
        status: 'read',
      },
      {
        id: '3',
        content: '挺好的，你呢？',
        isSelf: true,
        timestamp: '10:05',
        status: 'read',
      },
      {
        id: '4',
        content: '我也不错，最近在忙什么呢？',
        isSelf: false,
        timestamp: '10:06',
        status: 'read',
      },
      {
        id: '5',
        content: '在写一些代码，做一个聊天应用',
        isSelf: true,
        timestamp: '10:10',
        status: 'delivered',
      },
    ];
    
    setContact(mockContact);
    setMessages(mockMessages);
  }, [chatId]);
  
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
    if (!inputValue.trim()) return;
    
    const newMessage: Message = {
      id: `${Date.now()}`,
      content: inputValue,
      isSelf: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    
    setMessages([...messages, newMessage]);
    setInputValue('');
    
    // 模拟对方回复
    setTimeout(() => {
      const replyMessage: Message = {
        id: `${Date.now() + 1}`,
        content: '好的，我知道了',
        isSelf: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
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
  
  if (!contact) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }
  
  // 按时间分组消息
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];
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
            {contact.online && <span className="text-xs text-green-500 mt-1">在线</span>}
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
          {contact.online && (
            <span className="text-xs text-green-500">在线</span>
          )}
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
                      <span className="text-xs text-gray-500 mr-1">
                        {message.timestamp}
                      </span>
                      {message.status === 'sent' && (
                        <span className="text-xs text-gray-500">已发送</span>
                      )}
                      {message.status === 'delivered' && (
                        <span className="text-xs text-gray-500">已送达</span>
                      )}
                      {message.status === 'read' && (
                        <span className="text-xs text-gray-500">已读</span>
                      )}
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