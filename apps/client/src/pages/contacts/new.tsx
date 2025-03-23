import { useState, useEffect } from "react";
import { useNavigate, useFetcher } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

// 表单提交数据类型
interface ContactFormData {
  name: string;
  description?: string;
  isAi: boolean;
}

// 错误数据类型
interface ActionErrorData {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, any>;
}

const NewContactPage = () => {
  const navigate = useNavigate();
  const fetcher = useFetcher<ActionErrorData>();

  // 获取fetcher中的错误数据
  const actionData = fetcher.data;

  // 表单状态
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    description: "",
    isAi: true, // 默认创建AI联系人
  });

  // 监听fetcher状态，成功时跳转
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success === true) {
      // 提交成功，手动导航到联系人列表页面
      navigate("/home/contacts");
    }
  }, [fetcher.state, fetcher.data, navigate]);

  // 返回联系人列表
  const handleBackToList = () => {
    navigate("/home/contacts");
  };

  // 表单字段变更处理
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 切换开关
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAi: checked }));
  };

  // 表单提交处理
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    fetcher.submit(formData, {
      method: "post",
      action: "/api/contacts/create",
      encType: "application/x-www-form-urlencoded",
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 头部导航栏 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 flex items-center">
        <Button variant="ghost" size="icon" onClick={handleBackToList}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold ml-2">添加联系人</h1>
      </div>

      {/* 表单内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-xl mx-auto">
          {actionData?.error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{actionData.error}</span>
            </div>
          )}

          {/* 使用fetcher处理表单提交 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">联系人名称</Label>
              <Input
                id="name"
                name="name"
                placeholder="输入联系人名称"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={
                  actionData?.fieldErrors?.name ? "border-destructive" : ""
                }
              />
              {actionData?.fieldErrors?.name && (
                <p className="text-destructive text-sm">
                  {actionData.fieldErrors.name._errors.join(", ")}
                </p>
              )}
              <p className="text-muted-foreground text-sm">
                为您的联系人取一个有意义的名称
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">联系人描述 (可选)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="输入联系人描述"
                value={formData.description}
                onChange={handleInputChange}
                className={
                  actionData?.fieldErrors?.description
                    ? "border-destructive"
                    : ""
                }
              />
              {actionData?.fieldErrors?.description && (
                <p className="text-destructive text-sm">
                  {actionData.fieldErrors.description._errors.join(", ")}
                </p>
              )}
              <p className="text-muted-foreground text-sm">
                描述该联系人的特点或用途
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isAi"
                name="isAi"
                checked={formData.isAi}
                onCheckedChange={handleSwitchChange}
                value={String(formData.isAi)}
              />
              <Label htmlFor="isAi">创建AI联系人</Label>
            </div>
            <p className="text-muted-foreground text-sm">
              {formData.isAi
                ? "AI联系人可以进行智能对话"
                : "暂不支持创建普通联系人"}
            </p>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleBackToList}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={fetcher.state === "submitting" || !formData.isAi}
              >
                {fetcher.state === "submitting" ? "保存中..." : "保存联系人"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewContactPage; 