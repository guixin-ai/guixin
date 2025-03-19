import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

// 定义分组表单验证模式
const groupFormSchema = z.object({
  name: z.string().min(2, {
    message: '名称至少需要2个字符',
  }),
  description: z
    .string()
    .max(500, {
      message: '描述不能超过500个字符',
    })
    .optional(),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

export interface GroupFormDialogProps {
  /**
   * 对话框是否打开
   */
  open: boolean;
  /**
   * 对话框打开状态改变时的回调
   */
  onOpenChange: (open: boolean) => void;
  /**
   * 创建分组时的回调
   */
  onSubmit: (name: string, description: string | null) => Promise<void>;
  /**
   * 是否处于加载状态
   */
  isLoading?: boolean;
  /**
   * 对话框标题
   */
  title?: string;
  /**
   * 对话框描述
   */
  description?: string;
}

const GroupFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  title = '新增分组',
  description = '创建一个新的分组来组织您的机器人联系人',
}: GroupFormDialogProps) => {
  // 使用 react-hook-form 和 zod 进行表单管理和验证
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // 处理提交表单
  const handleSubmit = async (values: GroupFormValues) => {
    try {
      await onSubmit(values.name.trim(), values.description ? values.description.trim() : null);

      // 提交成功后重置表单
      form.reset();
    } catch (error) {
      console.error('提交分组表单失败:', error);
      // 错误处理由调用方负责
    }
  };

  // 关闭对话框时重置表单
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="py-4 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    分组名称 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="请输入分组名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分组描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入分组描述（可选）"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>简短描述这个分组的用途</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={!form.formState.isValid || isLoading}
          >
            {isLoading ? '创建中...' : '确认添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupFormDialog;
