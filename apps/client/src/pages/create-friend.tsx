import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

// 表单字段类型
interface FormFields {
  name: string;
  description: string;
  personality: string;
  avatar: string;
  background: string;
  expertise: string[];
}

const CreateFriendPage = () => {
  const navigate = useNavigate();
  
  // 表单状态
  const [formData, setFormData] = useState<FormFields>({
    name: '',
    description: '',
    personality: '',
    avatar: '',
    background: '',
    expertise: [],
  });
  
  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 预设专业领域选项
  const expertiseOptions = [
    '数学', '物理', '化学', '编程', '医学',
    '心理学', '历史', '文学', '艺术', '音乐',
    '法律', '金融', '营销', '写作', '教育'
  ];
  
  // 返回上一页
  const handleBack = () => {
    navigate('/guichat/chats');
  };
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // 处理多选变化
  const handleExpertiseChange = (expertise: string) => {
    if (formData.expertise.includes(expertise)) {
      setFormData({
        ...formData,
        expertise: formData.expertise.filter(item => item !== expertise)
      });
    } else {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, expertise]
      });
    }
  };
  
  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 创建成功后生成新的聊天ID
      const newChatId = `ai-${Date.now()}`;
      
      // 跳转到聊天页面
      navigate(`/guichat/chat/${newChatId}`);
    } catch (error) {
      console.error('创建朋友失败:', error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
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
          创造朋友
        </h1>
      </div>
      
      {/* 表单内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 名称 */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="给你的AI朋友起个名字"
            />
          </div>
          
          {/* 描述 */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="简单描述这个AI朋友的特点和用途"
            />
          </div>
          
          {/* 性格 */}
          <div className="space-y-2">
            <label htmlFor="personality" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              性格
            </label>
            <input
              type="text"
              id="personality"
              name="personality"
              value={formData.personality}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="友善、幽默、专业、认真..."
            />
          </div>
          
          {/* 头像 */}
          <div className="space-y-2">
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              头像形象
            </label>
            <input
              type="text"
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="描述AI朋友的外貌特征"
            />
          </div>
          
          {/* 背景故事 */}
          <div className="space-y-2">
            <label htmlFor="background" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              背景故事
            </label>
            <textarea
              id="background"
              name="background"
              value={formData.background}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="丰富AI朋友的背景故事，让对话更加生动"
            />
          </div>
          
          {/* 专业领域 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              专业领域 (可多选)
            </label>
            <div className="flex flex-wrap gap-2">
              {expertiseOptions.map((expertise) => (
                <button
                  key={expertise}
                  type="button"
                  onClick={() => handleExpertiseChange(expertise)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.expertise.includes(expertise)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {expertise}
                </button>
              ))}
            </div>
          </div>
          
          {/* 提交按钮 */}
          <Button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
            disabled={isSubmitting || !formData.name || !formData.description}
          >
            {isSubmitting ? '创建中...' : '创建智能朋友'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateFriendPage; 