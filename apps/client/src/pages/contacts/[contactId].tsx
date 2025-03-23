import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLoaderData, useFetcher } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertCircle, Edit, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { contactService } from '@/services/contact.service';
import { ContactDetail } from '@/types/contact';

// 定义加载器返回数据的类型
interface ContactDetailLoaderData {
  success?: boolean;
  error?: string;
  contact: ContactDetail | null;
}

// 定义删除联系人操作返回数据类型
interface DeleteFetcherData {
  success?: boolean;
  error?: string;
}

const ContactDetailPage = () => {
  const navigate = useNavigate();
  const { contactId } = useParams<{ contactId: string }>();
  
  // 使用useLoaderData获取路由加载器提供的数据，使用泛型
  const data = useLoaderData<ContactDetailLoaderData>();
  
  // 兼容处理，确保能同时处理旧版和新版loader返回的数据
  const contact = data.contact || null;
  const hasError = data.success === false;
  const errorMessage = data.error;

  // 使用fetcher替代直接调用contactCommands
  const deleteFetcher = useFetcher<DeleteFetcherData>();
  
  // 返回联系人列表
  const handleBackToList = () => {
    navigate('/home/contacts');
  };

  // 删除联系人 - 使用fetcher代替直接调用
  const handleDeleteContact = () => {
    if (!contactId) return;
    
    // 使用fetcher提交删除请求
    deleteFetcher.submit(
      { id: contactId },
      { method: "delete", action: "/api/contacts/delete" }
    );
  };

  // 开始聊天
  const handleStartChat = () => {
    if (!contactId) return;
    navigate(`/chats/${contactId}`);
  };
  
  // 监听fetcher状态，成功时跳转
  useEffect(() => {
    if (deleteFetcher.state === "idle" && deleteFetcher.data?.success) {
      navigate('/home/contacts', { replace: true });
    }
  }, [deleteFetcher.state, deleteFetcher.data, navigate]);

  // 如果出现错误，显示错误信息
  if (hasError) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBackToList}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">联系人详情</h1>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="p-6 max-w-md bg-destructive/15 text-destructive rounded-lg">
            <div className="flex items-center mb-4">
              <AlertCircle size={24} className="mr-2" />
              <h2 className="text-lg font-medium">加载联系人失败</h2>
            </div>
            <p className="mb-4">{errorMessage || '无法加载联系人详情'}</p>
            <Button onClick={handleBackToList}>返回联系人列表</Button>
          </div>
        </div>
      </div>
    );
  }

  // 如果没有联系人数据，显示加载中
  if (!contact) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBackToList}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">联系人详情</h1>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">联系人信息加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 头部导航栏 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 flex items-center">
        <Button variant="ghost" size="icon" onClick={handleBackToList}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold ml-2">{contact.name}</h1>
      </div>
      
      {/* 联系人详情内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 联系人头像和名称 */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 flex items-center justify-center bg-blue-500 rounded-full text-white text-4xl font-medium mb-4">
            {contact.avatar}
          </div>
          <h2 className="text-xl font-medium text-gray-800 dark:text-white">
            {contact.name}
          </h2>
        </div>
        
        {/* 联系人信息 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            联系人信息
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {contact.description || '无描述'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              联系人ID: {contact.id}
            </p>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="space-y-4 mt-8">
          <Button 
            className="w-full"
            onClick={handleStartChat}
          >
            <MessageSquare size={16} className="mr-2" />
            开始聊天
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={handleDeleteContact}
            className="w-full"
            disabled={deleteFetcher.state === "submitting"}
          >
            <Trash2 size={16} className="mr-2" />
            {deleteFetcher.state === "submitting" ? "删除中..." : "删除联系人"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailPage; 