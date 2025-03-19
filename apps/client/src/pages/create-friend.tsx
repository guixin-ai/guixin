import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl,
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// 表单字段验证模式
const formSchema = z.object({
  name: z.string().min(1, { message: '名称是必填项' }),
  description: z.string().min(1, { message: '描述是必填项' }),
});

// 表单字段类型
type FormValues = z.infer<typeof formSchema>;

const CreateFriendPage = () => {
  const navigate = useNavigate();
  
  // 初始化表单
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  
  // 返回上一页
  const handleBack = () => {
    navigate('/guichat/chats');
  };
  
  // 处理提交
  const onSubmit = async (values: FormValues) => {
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 创建成功后生成新的聊天ID
      const newChatId = `ai-${Date.now()}`;
      
      // 跳转到聊天页面
      navigate(`/guichat/chat/${newChatId}`);
    } catch (error) {
      console.error('创建朋友失败:', error);
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 名称 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    名称 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="给你的AI朋友起个名字"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 描述 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    设定描述 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="简单描述这个AI朋友的特点和用途"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 提交按钮 */}
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? '创建中...' : '创建智能朋友'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateFriendPage; 