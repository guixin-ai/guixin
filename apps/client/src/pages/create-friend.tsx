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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/models/chat.model';
import { useContactStore } from '@/models/contact.model';

// 表单字段验证模式
const formSchema = z.object({
  name: z.string().min(1, { message: '名称是必填项' }),
  description: z.string().min(1, { message: '描述是必填项' }),
});

// 表单字段类型
type FormValues = z.infer<typeof formSchema>;

// 简单的中文转拼音首字母函数
const getFirstPinyin = (name: string): string => {
  // 简化处理，实际应该使用完整的中文转拼音库
  const pinyinMap: Record<string, string> = {
    阿: 'a',
    爱: 'a',
    安: 'a',
    白: 'b',
    百: 'b',
    班: 'b',
    爸: 'b',
    成: 'c',
    陈: 'c',
    程: 'c',
    大: 'd',
    杜: 'd',
    东: 'd',
    而: 'e',
    二: 'e',
    发: 'f',
    方: 'f',
    高: 'g',
    工: 'g',
    好: 'h',
    黄: 'h',
    就: 'j',
    见: 'j',
    开: 'k',
    看: 'k',
    来: 'l',
    老: 'l',
    李: 'l',
    马: 'm',
    没: 'm',
    你: 'n',
    年: 'n',
    哦: 'o',
    朋: 'p',
    平: 'p',
    去: 'q',
    钱: 'q',
    人: 'r',
    日: 'r',
    是: 's',
    时: 's',
    他: 't',
    天: 't',
    我: 'w',
    王: 'w',
    向: 'x',
    小: 'x',
    一: 'y',
    有: 'y',
    在: 'z',
    张: 'z',
    周: 'z',
  };

  // 获取第一个字符
  const firstChar = name.charAt(0);

  // 返回对应的拼音首字母，如果没有对应的则返回字符本身
  return pinyinMap[firstChar] || firstChar;
};

const CreateFriendPage = () => {
  const navigate = useNavigate();
  const { addChat } = useChatStore();
  const { addContact } = useContactStore();

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
    navigate(-1);
  };

  // 处理提交
  const onSubmit = async (values: FormValues) => {
    try {
      // 创建新的ID
      const newId = `ai-${Date.now()}`;
      const avatarChar = values.name.charAt(0);
      const pinyinFirstLetter = getFirstPinyin(values.name);

      // 添加到聊天列表
      addChat({
        id: newId,
        name: values.name,
        avatar: avatarChar,
        lastMessage: '你好，我是你创建的AI朋友',
        timestamp: '刚刚',
      });

      // 添加到联系人列表
      addContact({
        id: newId,
        name: values.name,
        avatar: avatarChar,
        pinyin: pinyinFirstLetter + values.name, // 确保排序正确
      });

      // 返回上一页
      navigate(-1);
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

        <h1 className="text-lg font-medium text-gray-800 dark:text-white flex-1">创造朋友</h1>
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
                    <Input placeholder="给你的AI朋友起个名字" {...field} />
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
            >
              创建智能朋友
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateFriendPage;
