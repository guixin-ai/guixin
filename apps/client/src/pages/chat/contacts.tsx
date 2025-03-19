import { listen } from '@tauri-apps/api/event';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { getCurrentWindow, PhysicalPosition } from '@tauri-apps/api/window';
import { Loader2, Mail, MessageCircle, Phone, Search, User, UserPlus, Video } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ContactItem } from '../../components/contact-item/contact-item';
import ContactList from '../../components/contact-list/contact-list';
import { Button } from '../../components/ui/button';
import { useCurrentUserOrThrow } from '../../hooks/use-current-user-or-throw';
import useContactsStore from '../../models/routes/chat-contacts.model';

// 类型守卫函数，检查是否包含有效的联系人信息
function hasValidContactInfo(
  payload: unknown
): payload is { userId: string; contact: { id: string; name: string } } {
  if (!payload || typeof payload !== 'object') return false;

  const p = payload as Record<string, unknown>;

  // 检查 userId 和 contact.id 是否存在且为字符串
  return (
    typeof p.userId === 'string' &&
    p.userId.length > 0 &&
    p.contact !== undefined &&
    p.contact !== null &&
    typeof p.contact === 'object' &&
    typeof (p.contact as Record<string, unknown>).id === 'string' &&
    ((p.contact as Record<string, unknown>).id as string).length > 0 &&
    typeof (p.contact as Record<string, unknown>).name === 'string' &&
    ((p.contact as Record<string, unknown>).name as string).length > 0
  );
}

export const ContactsPage = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUserOrThrow();

  const {
    contacts,
    groups,
    selectedContactId,
    searchQuery,
    expandedGroups,
    isLoadingContacts,
    loadings,
    loadError,
    selectContact,
    setSearchQuery,
    toggleGroup,
    loadContacts,
    addContactWithGroup,
    deleteContact,
  } = useContactsStore();

  // 在组件挂载时加载联系人数据
  useEffect(() => {
    loadContacts(currentUser.id);
  }, [currentUser.id, loadContacts]);

  // 设置事件监听
  useEffect(() => {
    console.log('设置联系人页面事件监听器...');

    // 使用 Promise 方式处理 listen 函数
    const unlistenPromise = listen('contact-created', event => {
      console.log('联系人页面收到联系人创建事件:', event);

      // 使用类型守卫检查载荷是否包含有效的联系人信息
      if (hasValidContactInfo(event.payload)) {
        const { userId, contact } = event.payload;

        // 确保 userId 与当前用户匹配
        if (userId === currentUser.id) {
          // 添加新联系人到模型中，而不是重新加载所有联系人
          addContactWithGroup(contact.id)
            .then(() => {
              toast.success('联系人创建成功', {
                description: `联系人 "${contact.name}" 已创建`,
              });
            })
            .catch(error => {
              console.error('更新联系人失败:', error);
              toast.error('更新联系人失败', {
                description: error instanceof Error ? error.message : '请稍后重试',
              });
            });
        }
      } else {
        console.error('无效的事件载荷，缺少必要信息:', event.payload);
      }
    });

    // 清理函数 - 使用 Promise 方式处理 unlisten
    return () => {
      console.log('准备清理联系人页面事件监听器...');
      unlistenPromise
        .then(unlistenFn => {
          unlistenFn();
          console.log('联系人页面事件监听器已清理');
        })
        .catch(err => {
          console.error('清理联系人页面事件监听器失败:', err);
        });
    };
  }, [currentUser.id, loadContacts, addContactWithGroup]); // 添加依赖项

  // 获取当前选中的联系人
  const selectedContact = contacts.find(contact => contact.id === selectedContactId);

  // 创建新联系人窗口
  const createNewContactWindow = async () => {
    // 获取当前窗口
    const currentWindow = getCurrentWindow();

    // 创建新窗口，使用center选项
    const contactWindow = new WebviewWindow('create-contact', {
      url: '/chat-contacts/create',
      title: '创建新联系人',
      width: 600,
      height: 600,
      visible: false, // 先不显示窗口
      resizable: true,
      focus: true,
      decorations: true,
    });

    contactWindow.once('tauri://created', async () => {
      console.log('联系人创建窗口已打开');

      try {
        // 获取父窗口位置和大小
        const [parentPosition, parentSize, childSize] = await Promise.all([
          currentWindow.outerPosition(),
          currentWindow.outerSize(),
          contactWindow.outerSize(),
        ]);

        // 打印调试信息
        console.log('调试信息 - 父窗口:', {
          parentPosition,
          parentSize,
        });

        // 计算子窗口应该在的位置（相对于父窗口居中）
        const x = Math.round(parentPosition.x + (parentSize.width - childSize.width) / 2);
        const y = Math.round(parentPosition.y + (parentSize.height - childSize.height) / 2);

        console.log('调试信息 - 计算位置:', {
          childSize,
          calculatedX: x,
          calculatedY: y,
        });

        // 设置子窗口位置
        await contactWindow.setPosition(new PhysicalPosition(x, y));

        // 显示窗口
        await contactWindow.show();

        // 验证最终位置
        const finalPosition = await contactWindow.outerPosition();
        console.log('调试信息 - 子窗口最终位置:', finalPosition);
      } catch (positionError) {
        console.error('设置窗口位置时出错:', positionError);
        // 如果设置位置失败，至少显示窗口
        await contactWindow.show();
      }
    });

    contactWindow.once('tauri://error', (error: unknown) => {
      console.error('打开联系人创建窗口时发生错误:', error);
      // 如果窗口创建失败，回退到路由导航
      navigate('/chat-contacts/create');
    });
  };

  // 处理联系人删除
  const handleDeleteContact = async (contactId: string) => {
    try {
      // ContactItem 组件已经有了确认对话框，所以这里不需要再显示 confirm
      await deleteContact(contactId);

      toast.success('联系人已删除', {
        description: '联系人及相关数据已成功删除',
      });
    } catch (error) {
      console.error('删除联系人失败:', error);
      toast.error('删除联系人失败', {
        description: error instanceof Error ? error.message : '请稍后重试',
      });
    }
  };

  // 如果正在加载，显示加载状态
  if (isLoadingContacts) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">正在加载联系人...</p>
        </div>
      </div>
    );
  }

  // 如果加载出错，显示错误信息
  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-red-500 font-medium mb-2">加载联系人失败</p>
          <p className="text-gray-500 dark:text-gray-400">{loadError}</p>
          <Button className="mt-4" onClick={() => loadContacts(currentUser.id)}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* 联系人列表 */}
      <ContactList
        contacts={contacts}
        groups={groups}
        selectedContactId={selectedContactId}
        searchQuery={searchQuery}
        expandedGroups={expandedGroups}
        isLoading={isLoadingContacts}
        loadings={loadings}
        onSearch={setSearchQuery}
        onSelectContact={selectContact}
        onDeleteContact={handleDeleteContact}
        onToggleGroup={toggleGroup}
        onCreateContact={createNewContactWindow}
      />

      {/* 联系人详情 */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="bg-white dark:bg-gray-800 flex flex-col items-center justify-center py-10 border-b border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl mb-4 shadow-md">
                {selectedContact.avatar}
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {selectedContact.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {selectedContact.description || '无描述'}
              </p>

              <div className="flex mt-6">
                <button className="mx-2 w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white shadow-sm hover:shadow-md transition-all">
                  <Phone size={20} />
                </button>
                <button className="mx-2 w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-sm hover:shadow-md transition-all">
                  <Video size={20} />
                </button>
                <button className="mx-2 w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white shadow-sm hover:shadow-md transition-all">
                  <MessageCircle size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-medium text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
                  联系信息
                </h3>

                <div className="flex items-center p-3 mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300 mr-4">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">名称</div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {selectedContact.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300 mr-4">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">描述</div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {selectedContact.description || '无描述'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="text-blue-500 mb-4">
                <User size={48} className="mx-auto opacity-50" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">请选择一个联系人查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;
