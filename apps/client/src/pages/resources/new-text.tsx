import { useNavigate } from "react-router-dom";
import { useFetcher } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// 表单验证Schema
const formSchema = z.object({
  name: z.string().min(1, "资源名称不能为空").max(50, "资源名称不能超过50个字符"),
  content: z.string().min(1, "文本内容不能为空"),
  description: z.string().optional(),
});

// 表单提交数据类型
export type NewTextFormData = z.infer<typeof formSchema>;

// 错误数据类型
type ActionErrorData = {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: Array<{path: string[], message: string}>;
};

const NewTextResourcePage = () => {
  const navigate = useNavigate();
  const fetcher = useFetcher<ActionErrorData>();
  
  // 获取fetcher中的错误数据
  const actionData = fetcher.data;
  
  // 监听fetcher状态，成功时跳转
  useEffect(() => {
    // 检查API路由的成功响应
    if (fetcher.state === "idle" && fetcher.data?.success === true) {
      // 提交成功，手动导航到资源列表页面
      navigate("/home/resources");
    }
  }, [fetcher.state, fetcher.data, navigate]);
  
  // 返回资源列表
  const handleBackToList = () => {
    navigate("/home/resources");
  };

  // 查找特定字段的错误信息
  const getFieldError = (fieldName: string) => {
    if (!actionData?.errors) return null;
    return actionData.errors.find(err => 
      err.path.length > 0 && err.path[0] === fieldName
    )?.message;
  };

  // 表单提交处理
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    fetcher.submit(formData, {
      method: "post",
      action: "/api/resources/create-text",
      encType: "application/x-www-form-urlencoded"
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 头部导航栏 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 flex items-center">
        <Button variant="ghost" size="icon" onClick={handleBackToList}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold ml-2">添加文本资源</h1>
      </div>
      
      {/* 表单内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-xl mx-auto">
          {actionData?.error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
              {actionData.error}
            </div>
          )}
          
          {/* 使用fetcher处理表单提交 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                资源名称
              </label>
              <Input 
                id="name" 
                name="name" 
                placeholder="输入资源名称" 
                required 
                aria-invalid={getFieldError('name') ? 'true' : 'false'}
                className={getFieldError('name') ? 'border-destructive' : ''}
              />
              {getFieldError('name') && (
                <p className="text-destructive text-sm">{getFieldError('name')}</p>
              )}
              <p className="text-muted-foreground text-sm">
                为您的文本资源取一个有意义的名称
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                资源描述 (可选)
              </label>
              <Input 
                id="description" 
                name="description" 
                placeholder="输入资源描述" 
                aria-invalid={getFieldError('description') ? 'true' : 'false'}
                className={getFieldError('description') ? 'border-destructive' : ''}
              />
              {getFieldError('description') && (
                <p className="text-destructive text-sm">{getFieldError('description')}</p>
              )}
              <p className="text-muted-foreground text-sm">
                简短描述该文本资源的用途
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                文本内容
              </label>
              <Textarea 
                id="content" 
                name="content" 
                placeholder="输入文本内容" 
                className={`min-h-[200px] ${getFieldError('content') ? 'border-destructive' : ''}`}
                required 
                aria-invalid={getFieldError('content') ? 'true' : 'false'}
              />
              {getFieldError('content') && (
                <p className="text-destructive text-sm">{getFieldError('content')}</p>
              )}
              <p className="text-muted-foreground text-sm">
                您想要保存的文本内容
              </p>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" type="button" onClick={handleBackToList}>
                取消
              </Button>
              <Button 
                type="submit"
                disabled={fetcher.state === "submitting"}
              >
                {fetcher.state === "submitting" ? "保存中..." : "保存资源"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTextResourcePage; 