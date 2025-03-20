import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, UserPlus, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useContactStore } from '../../models/contact.model';
import { ContactGroup } from '../../types/contact';
import DelayedLoading from '../../components/delayed-loading';

const ContactsPage = () => {
  const navigate = useNavigate();
  const { searchContacts, getGroups, initializeList } = useContactStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // 初始化联系人数据
  useEffect(() => {
    const initContacts = async () => {
      try {
        await initializeList();
        setLoading(false);
      } catch (error) {
        console.error('初始化联系人数据失败:', error);
        setLoading(false);
      }
    };

    initContacts();
  }, [initializeList]);

  // 从计算属性获取分组数据
  const groups = getGroups();

  // 搜索过滤
  const filteredGroups = searchQuery
    ? groups
        .map(group => ({
          ...group,
          contacts: group.contacts.filter(contact =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(group => group.contacts.length > 0)
    : groups;

  // 导航到联系人详情
  const goToContactDetail = (contactId: string) => {
    navigate(`/contact/${contactId}`);
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
    navigate('/create-friend');
    setShowDropdown(false);
  };

  return (
    <DelayedLoading loading={loading}>
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
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 联系人列表 */}
        <div className="flex-1 overflow-y-auto">
          {filteredGroups.length > 0 &&
            filteredGroups.map(group => (
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
          {/* 空白状态 - 不显示任何内容 */}
        </div>

        {/* 字母导航条 */}
        <div className="fixed right-1 top-1/2 transform -translate-y-1/2 flex flex-col justify-center items-center">
          {[
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'J',
            'K',
            'L',
            'M',
            'N',
            'O',
            'P',
            'Q',
            'R',
            'S',
            'T',
            'U',
            'V',
            'W',
            'X',
            'Y',
            'Z',
          ].map(letter => (
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
    </DelayedLoading>
  );
};

export default ContactsPage;
