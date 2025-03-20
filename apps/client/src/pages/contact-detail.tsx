import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Phone, Video, MessageSquare, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useContactStore } from '../models/contact.model';
import { ContactDetail } from '@/types/contact';
import { ContactNotFoundException, ContactDetailInitFailedException } from '@/errors/contact.errors';
import { useShallow } from 'zustand/react/shallow';

// 模拟联系人数据 - 如果实际使用API，则可移除这部分
const mockContacts: Record<string, ContactDetail> = {
  'a1': { 
    id: 'a1', 
    name: '阿里巴巴', 
    avatar: '阿',
    phoneNumber: '13812345678',
    email: 'alibaba@example.com'
  },
  'a2': { 
    id: 'a2', 
    name: '阿童木', 
    avatar: '阿',
    description: '经典动漫角色',
    background: '未来世界的机器人小孩'
  },
  'b1': { 
    id: 'b1', 
    name: '白起', 
    avatar: '白',
    phoneNumber: '13987654321'
  },
  'b2': { 
    id: 'b2', 
    name: '班主任', 
    avatar: '班',
    phoneNumber: '13876543210',
    email: 'teacher@school.edu'
  },
  'ai-123': {
    id: 'ai-123',
    name: '智能助手',
    avatar: '智',
    description: '一个聪明的AI助手，可以解答各种问题',
    personality: '友善、耐心、专业',
    background: '由先进的大语言模型训练而成',
    expertise: ['数学', '编程', '写作', '历史'],
    isAI: true
  }
};

const ContactDetailPage = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  // 使用 useShallow 和选择器获取需要的状态和方法
  const { initializeContactDetail, contactDetails } = useContactStore(
    useShallow(state => ({
      initializeContactDetail: state.initializeContactDetail,
      contactDetails: state.contactDetails
    }))
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState<keyof ContactDetail | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 加载联系人数据
  useEffect(() => {
    if (contactId) {
      const loadContactData = async () => {
        setLoading(true);
        
        try {
          // 初始化联系人详情
          await initializeContactDetail(contactId);
          setLoading(false);
        } catch (error) {
          console.error('加载联系人详情失败:', error);
          if (error instanceof ContactNotFoundException) {
            console.error(`联系人未找到: ${error.message}`);
          } else if (error instanceof ContactDetailInitFailedException) {
            console.error(`联系人详情初始化失败: ${error.message}`);
          }
          setLoading(false);
        }
      };
      
      loadContactData();
    }
  }, [contactId, initializeContactDetail]);
  
  // 获取联系人详情（从模型层或模拟数据）
  const contact = contactId ? (
    contactDetails[contactId] || mockContacts[contactId] || null
  ) : null;
  
  // 返回上一页
  const handleBack = () => {
    navigate('/guichat/contacts');
  };
  
  // 开始编辑字段
  const handleEdit = (field: keyof ContactDetail, value: any) => {
    setEditField(field);
    setEditValue(value || '');
    setIsEditing(true);
  };
  
  // 保存编辑
  const handleSave = () => {
    if (contact && editField) {
      // 将更新的数据应用到本地状态，后续可以加入与后端同步的逻辑
      // TODO: 需要在模型层添加更新联系人详情的方法
      setIsEditing(false);
      setEditField(null);
    }
  };
  
  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    setEditField(null);
  };
  
  // 发送消息
  const handleSendMessage = () => {
    if (contact) {
      navigate(`/guichat/chat/${contact.id}`);
    }
  };
  
  // 音视频通话
  const handleVideoCall = () => {
    if (contact) {
      navigate(`/video-call/${contact.id}`);
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">正在加载联系人信息...</p>
      </div>
    );
  }
  
  if (!contact) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">联系人不存在</p>
      </div>
    );
  }
  
  // 编辑模式
  if (isEditing && editField) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
        {/* 编辑头部 */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 dark:text-gray-300"
            onClick={handleCancel}
          >
            取消
          </Button>
          
          <h1 className="text-md font-medium text-gray-800 dark:text-white">
            编辑{getFieldLabel(editField)}
          </h1>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-500"
            onClick={handleSave}
          >
            保存
          </Button>
        </div>
        
        {/* 编辑内容 */}
        <div className="flex-1 p-4 bg-white dark:bg-gray-800">
          {editField === 'expertise' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                请选择专业领域 (可多选)
              </p>
              <div className="flex flex-wrap gap-2">
                {['数学', '物理', '化学', '编程', '医学', '心理学', '历史', '文学', '艺术', '音乐', '法律', '金融', '营销', '写作', '教育'].map((item) => (
                  <button
                    key={item}
                    className={`px-3 py-1 rounded-full text-sm ${
                      (contact.expertise || []).includes(item)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            editField === 'description' || editField === 'background' ? (
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`请输入${getFieldLabel(editField)}`}
              />
            ) : (
              <input
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`请输入${getFieldLabel(editField)}`}
              />
            )
          )}
        </div>
      </div>
    );
  }
  
  // 查看模式
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="flex items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 dark:text-gray-300 mr-2"
          onClick={handleBack}
        >
          <ArrowLeft size={20} />
        </Button>
        
        <h1 className="text-lg font-medium text-gray-800 dark:text-white flex-1">
          {contact.isAI ? '智能朋友' : '联系人'}
        </h1>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 dark:text-gray-300"
          onClick={() => handleEdit('name', contact.name)}
        >
          <Edit2 size={20} />
        </Button>
      </div>
      
      {/* 联系人资料 */}
      <div className="flex-1 overflow-y-auto">
        {/* 基本信息 */}
        <div className="bg-white dark:bg-gray-800 p-6 flex flex-col items-center border-b border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 rounded-md bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-3xl font-semibold mb-4">
            {contact.avatar}
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {contact.name}
          </h2>
        </div>
        
        {/* 详细信息 */}
        <div className="mt-3 bg-white dark:bg-gray-800">
          {contact.isAI ? (
            // AI朋友详情
            <>
              {renderDetailItem('description', '描述', contact.description)}
              {renderDetailItem('personality', '性格', contact.personality)}
              {renderDetailItem('background', '背景故事', contact.background)}
              
              {/* 专业领域 */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2" onClick={() => handleEdit('expertise', contact.expertise)}>
                  <span className="text-gray-500 dark:text-gray-400">专业领域</span>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
                
                {contact.expertise && contact.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {contact.expertise.map(exp => (
                      <span key={exp} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300">
                        {exp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            // 普通联系人详情
            <>
              {contact.phoneNumber && renderDetailItem('phoneNumber', '电话号码', contact.phoneNumber)}
              {contact.email && renderDetailItem('email', '邮箱', contact.email)}
              {renderDetailItem('description', '备注', contact.description || '添加备注')}
            </>
          )}
        </div>
      </div>
      
      {/* 底部操作栏 */}
      <div className="p-4 bg-gray-900 text-white">
        <div className="grid grid-cols-2 gap-4">
          <button 
            className="flex flex-col items-center justify-center py-3 bg-gray-800 rounded-md"
            onClick={handleSendMessage}
          >
            <MessageSquare size={24} className="mb-1" />
            <span className="text-sm text-gray-300">发消息</span>
          </button>
          
          <button 
            className="flex flex-col items-center justify-center py-3 bg-gray-800 rounded-md"
            onClick={handleVideoCall}
          >
            <Video size={24} className="mb-1" />
            <span className="text-sm text-gray-300">音视频通话</span>
          </button>
        </div>
      </div>
    </div>
  );
  
  // 渲染详情项
  function renderDetailItem(field: keyof ContactDetail, label: string, value?: string | string[]) {
    return (
      <div 
        className="p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer"
        onClick={() => handleEdit(field, value)}
      >
        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">{label}</span>
          <div className="flex items-center">
            <span className="text-gray-800 dark:text-gray-200 mr-2">
              {value || `添加${label}`}
            </span>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </div>
      </div>
    );
  }
  
  // 获取字段标签
  function getFieldLabel(field: keyof ContactDetail): string {
    const labels: Record<string, string> = {
      name: '名称',
      description: '描述',
      personality: '性格',
      background: '背景故事',
      expertise: '专业领域',
      phoneNumber: '电话号码',
      email: '邮箱'
    };
    
    return labels[field] || field;
  }
};

export default ContactDetailPage; 