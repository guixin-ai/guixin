import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, User, Check } from 'lucide-react';
import { Button } from '../components/ui/button';

// 联系人类型
interface Contact {
  id: string;
  name: string;
  avatar: string;
  initial: string;
  selected?: boolean;
}

// 示例联系人数据
const initialContacts: Contact[] = [
  { id: '1', name: '文件传输助手', avatar: '文', initial: 'W' },
  { id: '2', name: '老婆', avatar: '老', initial: 'L' },
  { id: '3', name: '张薇张薇', avatar: '张', initial: 'Z' },
  { id: '4', name: '于雯雯医生', avatar: '于', initial: 'Y' },
  { id: '5', name: '柒公子', avatar: '柒', initial: 'Q' },
  { id: '6', name: '订阅号', avatar: '订', initial: 'D' },
  { id: '7', name: '大疆', avatar: 'D', initial: 'D' },
  { id: '8', name: '扣子Coze', avatar: '扣', initial: 'K' },
  { id: '9', name: '携程旅行网', avatar: '携', initial: 'X' },
  { id: '10', name: 'A贝壳找房-施13855515537', avatar: 'A', initial: 'A' },
  { id: '11', name: 'A德佑·杨俊', avatar: 'A', initial: 'A' },
  { id: '12', name: 'A-定制印刷', avatar: 'A', initial: 'A' },
  { id: '13', name: '奥利奥爆爆朱 朱田田 新华 前端', avatar: '奥', initial: 'A' },
  { id: '14', name: 'A.修电脑的小秦', avatar: 'A', initial: 'A' },
  { id: '15', name: '摆渡人 崔焰舞', avatar: '摆', initial: 'B' },
  { id: '16', name: '鲍俊伟', avatar: '鲍', initial: 'B' },
  { id: '17', name: '鲍怡然', avatar: '鲍', initial: 'B' },
  { id: '18', name: 'bin', avatar: 'b', initial: 'B' },
  { id: '19', name: 'BK', avatar: 'B', initial: 'B' },
];

// 按首字母分组联系人
const groupContactsByInitial = (contacts: Contact[]) => {
  const grouped: { [key: string]: Contact[] } = {};
  
  contacts.forEach(contact => {
    if (!grouped[contact.initial]) {
      grouped[contact.initial] = [];
    }
    grouped[contact.initial].push(contact);
  });
  
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([initial, contacts]) => ({
      initial,
      contacts
    }));
};

const NewChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  
  // 检查是否为群聊模式
  const isGroupMode = new URLSearchParams(location.search).get('group') === 'true';
  
  // 过滤联系人
  const filteredContacts = initialContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // 按首字母分组联系人
  const groupedContacts = groupContactsByInitial(filteredContacts);
  
  // 处理返回
  const handleBack = () => {
    navigate('/guichat/chats');
  };
  
  // 选择联系人
  const handleSelectContact = (contact: Contact) => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };
  
  // 创建群聊
  const handleCreateGroupChat = () => {
    if (selectedContacts.length > 0) {
      // 这里实际应用中会创建群聊并获取群ID
      const groupId = `group-${Date.now()}`;
      navigate(`/guichat/chat/${groupId}`);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* 头部 */}
      <div className="flex items-center p-4 border-b border-gray-800">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white mr-2"
          onClick={handleBack}
        >
          <ArrowLeft size={20} />
        </Button>
        
        <h1 className="text-lg font-medium text-white flex-1 text-center mr-8">
          发起群聊
        </h1>
        
        {selectedContacts.length > 0 && (
          <Button 
            variant="ghost"
            className="text-white absolute right-4"
            onClick={handleCreateGroupChat}
          >
            完成
          </Button>
        )}
      </div>
      
      {/* 搜索栏 */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="搜索"
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* 联系人列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <User size={36} className="text-gray-600 mb-2" />
            <p className="text-gray-500">未找到联系人</p>
          </div>
        ) : (
          <>
            {groupedContacts.map(group => (
              <div key={group.initial}>
                {/* 分组标题 */}
                <div className="sticky top-0 px-4 py-1 bg-gray-900 text-gray-500 text-sm font-medium">
                  {group.initial}
                </div>
                
                {/* 联系人列表 */}
                <ul>
                  {group.contacts.map(contact => {
                    const isSelected = selectedContacts.some(c => c.id === contact.id);
                    
                    return (
                      <li
                        key={contact.id}
                        className="px-4 py-3 cursor-pointer border-b border-gray-800"
                        onClick={() => handleSelectContact(contact)}
                      >
                        <div className="flex items-center">
                          {/* 选择圆圈 */}
                          <div className={`w-6 h-6 rounded-full border ${isSelected ? 'bg-green-500 border-green-500 flex items-center justify-center' : 'border-gray-600'}`}>
                            {isSelected && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                          
                          {/* 头像 */}
                          <div className="ml-3 w-12 h-12 rounded-md bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-semibold">
                            {contact.avatar}
                          </div>
                          
                          {/* 联系人名称 */}
                          <div className="ml-3">
                            <span className="font-medium text-white">
                              {contact.name}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            
            {/* 右侧字母导航 */}
            <div className="fixed right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
              {groupedContacts.map(group => (
                <a 
                  key={group.initial}
                  href={`#${group.initial}`}
                  className="w-5 h-5 flex items-center justify-center text-xs text-gray-500"
                >
                  {group.initial}
                </a>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* 完成按钮 */}
      {selectedContacts.length > 0 && (
        <div className="p-4 border-t border-gray-800">
          <Button 
            variant="default"
            className="w-full bg-gray-800 hover:bg-gray-700 text-white"
            onClick={handleCreateGroupChat}
          >
            完成
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewChatPage; 