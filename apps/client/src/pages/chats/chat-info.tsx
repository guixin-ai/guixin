import { useNavigate, useLoaderData, useParams } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatDetail } from '@/types/chat';

// 定义加载器返回数据的类型
interface ChatInfoLoaderData {
  success: boolean;
  error?: string;
  chat: ChatDetail | null;
  messages: any[];
}

const ChatInfoPage = () => {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  
  // 使用泛型而不是类型断言获取loader数据
  const data = useLoaderData<ChatInfoLoaderData>();
  
  const chatDetail = data.success ? data.chat : null;
  const hasError = !data.success;
  const errorMessage = data.error;

  // 返回上一页
  const handleBack = () => {
    navigate(-1);
  };

  // 添加成员
  const handleAddMember = () => {
    if (!chatDetail) return;
    navigate(`/chats/new?add_to=${chatDetail.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col h-screen bg-gray-900 text-white">
      {/* 头部 */}
      <div className="flex items-center p-3 bg-gray-900 border-b border-gray-800">
        <Button variant="ghost" size="icon" className="text-gray-300 mr-2" onClick={handleBack}>
          <ArrowLeft size={20} />
        </Button>

        <div className="flex-1 text-center">
          <h2 className="font-medium text-white">聊天信息</h2>
        </div>

        <div className="w-8"></div>
      </div>

      {/* 错误提示 */}
      {hasError && (
        <div className="p-4 m-4 bg-red-500/20 text-red-400 rounded-md">
          <p>{errorMessage || '加载聊天信息失败'}</p>
        </div>
      )}

      {/* 聊天成员 */}
      {chatDetail ? (
        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-gray-400 text-sm mb-4">聊天成员</h4>
            <div className="flex flex-wrap gap-4">
              {chatDetail.members?.map((member) => (
                <div key={member.id} className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-md bg-green-500 flex items-center justify-center text-white font-semibold mb-1">
                    {typeof member.avatar === 'string' ? member.avatar : member.avatar[0]}
                  </div>
                  <span className="text-xs text-gray-300">{member.name}</span>
                  <span className="text-xs text-gray-400">{member.username}</span>
                </div>
              ))}
              <div className="flex flex-col items-center cursor-pointer" onClick={handleAddMember}>
                <div className="w-14 h-14 rounded-md border border-dashed border-gray-600 flex items-center justify-center text-gray-400 mb-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-400">添加</span>
              </div>
            </div>
          </div>
        </div>
      ) : !hasError && (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <User size={36} className="text-gray-600 mb-2" />
          <p className="text-gray-500">未找到聊天信息</p>
        </div>
      )}
    </div>
  );
};

export default ChatInfoPage; 