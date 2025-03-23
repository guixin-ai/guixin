import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MoreVertical, UserPlus, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useContactStore } from '../../models/contact.model';
import { Contact, ContactGroup, ContactDetail } from '../../types/contact';
import DelayedLoading from '../../components/delayed-loading';
import ContactDetailComponent from '../../components/contact-detail';
import { useShallow } from 'zustand/react/shallow';
import NewChat from '../../components/new-chat';
import CreateFriend from '../../components/create-friend';
import { useChatStore } from '../../models/chat.model';
import { ChatItem, ChatDetail as ChatDetailType } from '../../types/chat';
import { GroupChatCreationFailedException } from '@/errors/chat.errors';
import { contactService } from '@/services/contact.service';

// 按拼音首字母分组联系人的函数
const groupContactsByPinyin = (contacts: Contact[]): ContactGroup[] => {
  // 创建一个Map用于存储分组
  const groupMap = new Map<string, Contact[]>();

  // 遍历联系人，按拼音首字母分组
  contacts.forEach(contact => {
    // 获取拼音首字母，如果没有拼音则使用#
    const firstLetter = contact.pinyin ? contact.pinyin.charAt(0).toUpperCase() : '#';

    // 获取或创建该字母的分组
    const group = groupMap.get(firstLetter) || [];
    group.push(contact);
    groupMap.set(firstLetter, group);
  });

  // 将Map转换为数组并排序
  const groups: ContactGroup[] = Array.from(groupMap.entries()).map(([letter, contacts]) => ({
    letter,
    contacts,
  }));

  // 按字母顺序排序
  return groups.sort((a, b) => a.letter.localeCompare(b.letter));
};

const ContactsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 从URL查询参数中获取当前模态框和选中的联系人ID
  const currentModal = searchParams.get('modal');
  const contactId = searchParams.get('contactId');

  // 使用 useShallow 和选择器获取需要的状态和方法
  const { searchContacts, initializeList, contacts, initializedList } = useContactStore(
    useShallow(state => ({
      searchContacts: state.searchContacts,
      initializeList: state.initializeList,
      contacts: state.contacts,
      initializedList: state.initializedList,
    }))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // 初始化联系人数据
  useEffect(() => {
    const loadContacts = async () => {
      try {
        // 先检查模型层的初始化状态
        if (initializedList) {
          // 如果已经初始化，直接使用模型中的数据，不再调用服务
          console.log('联系人列表已初始化，跳过服务调用');
          return;
        }

        // 设置加载状态为 true，只在发起请求时
        setLoading(true);
        
        // 如果未初始化，才调用服务获取数据
        const response = await contactService.getContacts();
        // 调用模型层的初始化方法设置数据和初始化标记
        initializeList(response.contacts);
      } catch (error) {
        console.error('加载联系人数据失败:', error);
      } finally {
        // 请求完成后设置加载状态为 false
        setLoading(false);
      }
    };

    loadContacts();
  }, [initializeList, initializedList]);

  // 使用useMemo来计算分组数据 - 计算属性
  const groupsData = useMemo(() => {
    return groupContactsByPinyin(contacts);
  }, [contacts]);

  // 搜索过滤 - 也使用useMemo计算
  const filteredGroups = useMemo(() => {
    if (!searchQuery) {
      return groupsData;
    }

    return groupsData
      .map((group: ContactGroup) => ({
        ...group,
        contacts: group.contacts.filter((contact: Contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((group: ContactGroup) => group.contacts.length > 0);
  }, [groupsData, searchQuery]);

  // 导航到联系人详情 - 使用URL参数
  const goToContactDetail = (contactId: string) => {
    setSearchParams({ modal: 'contact-detail', contactId });
  };

  // 关闭联系人详情 - 清除URL参数
  const handleCloseContactDetail = () => {
    clearModal();
  };

  // 清除模态框参数
  const clearModal = () => {
    // 保留其他可能的查询参数，但删除modal和contactId
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('modal');
    newParams.delete('contactId');
    setSearchParams(newParams);
  };

  // 打开/关闭下拉菜单
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // 创建群聊 - 更新此方法使用URL参数
  const createGroup = () => {
    setSearchParams({ modal: 'new-chat' });
    setShowDropdown(false);
  };

  // 处理聊天创建完成
  const handleChatCreated = async (contactIds: string[]) => {
    if (!contactIds || contactIds.length === 0) {
      return;
    }

    try {
      // 使用新的异步createGroupChat方法创建群聊
      const chatId = await useChatStore.getState().createGroupChat(contactIds);

      // 导航到新的聊天页面
      navigate(`/chat/${chatId}`);
      clearModal();
    } catch (error) {
      console.error('创建群聊失败:', error);

      // 根据错误类型显示不同的错误信息
      let errorMessage = '创建群聊失败，请稍后重试';

      if (error instanceof GroupChatCreationFailedException) {
        errorMessage = error.message;
      }

      // 这里可以添加显示错误提示的代码，例如toast通知
      alert(errorMessage); // 实际应用中应替换为更友好的UI组件
    }
  };

  // 关闭创建聊天页面
  const handleCloseCreateChat = () => {
    clearModal();
  };

  // 添加朋友
  const addFriend = () => {
    // 使用URL参数代替直接导航
    setSearchParams({ modal: 'create-friend' });
    setShowDropdown(false);
  };

  // 处理朋友创建完成 - 新增此方法
  const handleFriendCreated = async (contactId?: string) => {
    if (!contactId) {
      clearModal();
      return;
    }

    try {
      // 创建完朋友后，直接创建一个与该朋友的聊天
      const chatId = await useChatStore.getState().createGroupChat([contactId]);

      // 导航到新的聊天页面
      navigate(`/chat/${chatId}`);
      clearModal();
    } catch (error) {
      console.error('创建聊天失败:', error);
      let errorMessage = '创建聊天失败，请稍后重试';

      if (error instanceof GroupChatCreationFailedException) {
        errorMessage = error.message;
      }

      // 错误提示
      alert(errorMessage);
      clearModal();
    }
  };

  // 关闭创建朋友页面
  const handleCloseCreateFriend = () => {
    clearModal();
  };

  return (
    <>
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
              filteredGroups.map((group: ContactGroup) => (
                <div key={group.letter} id={group.letter}>
                  {/* 字母索引 */}
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 sticky top-0">
                    {group.letter}
                  </div>

                  {/* 联系人 */}
                  {group.contacts.map((contact: Contact) => (
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
      {/* 联系人详情组件 - 基于URL参数条件渲染 */}
      {currentModal === 'contact-detail' && contactId && (
        <ContactDetailComponent contactId={contactId} onBack={handleCloseContactDetail} />
      )}

      {/* 新建聊天组件 - 基于URL参数条件渲染 */}
      {currentModal === 'new-chat' && (
        <NewChat onBack={handleCloseCreateChat} onComplete={handleChatCreated} />
      )}

      {/* 创建朋友组件 - 基于URL参数条件渲染 */}
      {currentModal === 'create-friend' && (
        <CreateFriend onBack={handleCloseCreateFriend} onComplete={handleFriendCreated} />
      )}
    </>
  );
};

export default ContactsPage;
