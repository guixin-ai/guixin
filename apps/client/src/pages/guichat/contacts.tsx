import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, UserPlus, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';

// 联系人类型
interface Contact {
  id: string;
  name: string;
  avatar: string;
  pinyin?: string;
}

const ContactsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // 模拟联系人数据
  const contacts: Contact[] = [
    { id: 'a1', name: '阿里巴巴', avatar: '阿', pinyin: 'alibaba' },
    { id: 'a2', name: '阿童木', avatar: '阿', pinyin: 'atom' },
    { id: 'b1', name: '白起', avatar: '白', pinyin: 'baiqi' },
    { id: 'b2', name: '班主任', avatar: '班', pinyin: 'banzhuren' },
    { id: 'c1', name: '陈奕迅', avatar: '陈', pinyin: 'chenyixun' },
    { id: 'c2', name: '程序员', avatar: '程', pinyin: 'chengxuyuan' },
    { id: 'd1', name: '大卫', avatar: '大', pinyin: 'dawei' },
    { id: 'd2', name: '杜甫', avatar: '杜', pinyin: 'dufu' },
    { id: 'l1', name: '老婆', avatar: '老', pinyin: 'laopo' },
    { id: 'l2', name: '爸爸', avatar: '爸', pinyin: 'baba' },
    { id: 'w1', name: '王小波', avatar: '王', pinyin: 'wangxiaobo' },
    { id: 'w2', name: '王力宏', avatar: '王', pinyin: 'wanglihong' },
    { id: 'z1', name: '张三', avatar: '张', pinyin: 'zhangsan' },
    { id: 'z2', name: '周杰伦', avatar: '周', pinyin: 'zhoujielun' },
  ];
  
  // 根据字母分组联系人
  const groupedContacts = () => {
    // 按拼音首字母排序
    contacts.sort((a, b) => {
      if (!a.pinyin || !b.pinyin) return 0;
      return a.pinyin.localeCompare(b.pinyin);
    });
    
    // 分组
    const groups: { letter: string; contacts: Contact[] }[] = [];
    let currentLetter = '';
    
    contacts.forEach(contact => {
      const firstLetter = contact.pinyin?.[0].toUpperCase() || '#';
      
      if (currentLetter !== firstLetter) {
        currentLetter = firstLetter;
        groups.push({ letter: firstLetter, contacts: [contact] });
      } else {
        groups[groups.length - 1].contacts.push(contact);
      }
    });
    
    return groups;
  };
  
  const groups = groupedContacts();
  
  // 搜索过滤
  const filteredGroups = searchQuery
    ? groups.map(group => ({
        ...group,
        contacts: group.contacts.filter(contact =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(group => group.contacts.length > 0)
    : groups;
  
  // 导航到联系人详情
  const goToContactDetail = (contactId: string) => {
    navigate(`/guichat/contact/${contactId}`);
  };
  
  // 打开/关闭下拉菜单
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  // 创建群聊
  const createGroup = () => {
    // TODO: 实现创建群聊功能
    setShowDropdown(false);
  };
  
  // 添加朋友
  const addFriend = () => {
    navigate('/guichat/create-friend');
    setShowDropdown(false);
  };
  
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black">
      {/* 头部 */}
      <div className="bg-white dark:bg-black p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h1 className="text-xl font-medium text-gray-800 dark:text-white">通讯录</h1>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 dark:text-gray-300"
            onClick={toggleDropdown}
          >
            <MoreVertical size={24} />
          </Button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-gray-200 dark:border-gray-700">
              <button
                className="flex items-center w-full px-4 py-3 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={createGroup}
              >
                <Users size={18} className="mr-2" />
                创建群聊
              </button>
              <button
                className="flex items-center w-full px-4 py-3 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={addFriend}
              >
                <UserPlus size={18} className="mr-2" />
                添加朋友
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 搜索框 */}
      <div className="bg-white dark:bg-black p-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none"
            placeholder="搜索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* 联系人列表 */}
      <div className="flex-1 overflow-y-auto">
        {/* 按字母分组的联系人 */}
        {filteredGroups.map(group => (
          <div key={group.letter} id={group.letter}>
            {/* 字母索引 */}
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 sticky top-0">
              {group.letter}
            </div>
            
            {/* 联系人 */}
            {group.contacts.map(contact => (
              <button
                key={contact.id}
                className="flex items-center w-full p-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 bg-white dark:bg-black"
                onClick={() => goToContactDetail(contact.id)}
              >
                <div className="w-10 h-10 rounded-md bg-green-500 flex items-center justify-center text-white font-semibold">
                  {contact.avatar}
                </div>
                <span className="ml-3 text-gray-800 dark:text-white text-left">
                  {contact.name}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
      
      {/* 字母导航条 */}
      <div className="fixed right-1 top-1/2 transform -translate-y-1/2 flex flex-col justify-center items-center">
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(letter => (
          <a
            key={letter}
            href={`#${letter}`}
            className="text-xs py-0.5 text-gray-500 dark:text-gray-400"
          >
            {letter}
          </a>
        ))}
      </div>
    </div>
  );
};

export default ContactsPage; 