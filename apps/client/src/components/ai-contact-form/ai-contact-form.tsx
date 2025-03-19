import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import GroupFormDialog from '@/components/group-form-dialog/group-form-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';

// 卡片容器组件
interface CardContainerProps {
  title: string;
  children: ReactNode;
  dataTestId?: string;
}

const CardContainer = ({ title, children, dataTestId }: CardContainerProps) => {
  return (
    <div
      data-testid={dataTestId}
      className="bg-gray-50 dark:bg-gray-800 px-5 py-4 rounded-lg shadow-sm"
    >
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
};

// 定义 Agent 联系人表单验证模式
export const agentFormSchema = z.object({
  name: z.string().min(2, {
    message: '名称至少需要2个字符',
  }),
  modelName: z.string({
    required_error: '请选择模型',
  }),
  systemPrompt: z
    .string()
    .min(10, {
      message: '系统提示词至少需要10个字符',
    })
    .max(2000, {
      message: '系统提示词不能超过2000个字符',
    }),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().min(100).max(8192).optional(),
  topP: z.number().min(0).max(1).optional(),
  avatarUrl: z.string().optional(),
  groupId: z.string({
    required_error: '请选择分组',
  }),
  description: z
    .string()
    .max(500, {
      message: '描述不能超过500个字符',
    })
    .optional(),
});

export type AgentFormValues = z.infer<typeof agentFormSchema>;

// 常用的预设模型列表，用于当Ollama不可用时
export const FALLBACK_MODEL_OPTIONS = [
  { value: 'llama3', label: 'Llama 3' },
  { value: 'llama3:8b', label: 'Llama 3 (8B)' },
  { value: 'llama3:70b', label: 'Llama 3 (70B)' },
  { value: 'qwen:14b', label: 'Qwen (14B)' },
  { value: 'qwen:72b', label: 'Qwen (72B)' },
  { value: 'gemma:7b', label: 'Gemma (7B)' },
  { value: 'gemma:2b', label: 'Gemma (2B)' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'mixtral', label: 'Mixtral' },
  { value: 'codellama', label: 'CodeLlama' },
  { value: 'phi3', label: 'Phi-3' },
];

// 生成随机种子
const generateRandomSeed = () => Math.floor(Math.random() * 1000000);

export interface GroupOption {
  value: string;
  label: string;
}

export interface AIContactFormProps {
  onSubmit: (values: AgentFormValues) => Promise<void>;
  onCancel?: () => void;
  onAddGroup?: (name: string, description: string | null) => Promise<{ id: string; name: string }>;
  initialValues?: Partial<AgentFormValues>;
  serviceAvailable?: boolean;
  modelOptions?: { value: string; label: string }[];
  groupOptions: GroupOption[];
}

export const AIContactForm = ({
  onSubmit,
  onCancel,
  onAddGroup,
  initialValues,
  serviceAvailable = false,
  modelOptions: externalModelOptions,
  groupOptions,
}: AIContactFormProps) => {
  const [avatarSeed, setAvatarSeed] = useState(generateRandomSeed());
  const [isNewGroupDialogOpen, setIsNewGroupDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modelOptions, setModelOptions] = useState<{ value: string; label: string }[]>(
    externalModelOptions || FALLBACK_MODEL_OPTIONS
  );
  const [showOllamaWarning, setShowOllamaWarning] = useState(!serviceAvailable);

  // 生成头像URL
  const generateAvatarUrl = (seed: number) => {
    return `https://robohash.org/${seed}?set=set1&size=200x200`;
  };

  // 当前头像URL
  const currentAvatarUrl = generateAvatarUrl(avatarSeed);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: '',
      modelName: 'llama3',
      systemPrompt: '你是一个有用的AI助手。请提供准确、有帮助的回答。',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      avatarUrl: currentAvatarUrl,
      groupId: groupOptions.length > 0 ? groupOptions[0].value : '',
      description: '',
      ...initialValues,
    },
  });

  // 当头像变化时更新表单值
  useEffect(() => {
    form.setValue('avatarUrl', currentAvatarUrl);
  }, [avatarSeed, form]);

  // 当外部modelOptions变化时更新
  useEffect(() => {
    if (externalModelOptions && externalModelOptions.length > 0) {
      setModelOptions(externalModelOptions);

      // 如果有模型且当前没有选择模型，设置第一个为默认选项
      if (!form.getValues('modelName')) {
        form.setValue('modelName', externalModelOptions[0].value);
      }
    }
  }, [externalModelOptions, form]);

  // 当分组选项变化时，确保有默认值
  useEffect(() => {
    if (groupOptions.length > 0 && !form.getValues('groupId')) {
      form.setValue('groupId', groupOptions[0].value);
    }
  }, [groupOptions, form]);

  async function handleSubmit(values: AgentFormValues) {
    // 确保头像URL已设置
    values.avatarUrl = currentAvatarUrl;
    await onSubmit(values);
  }

  // 处理模型选择变化
  const handleModelChange = (value: string) => {
    form.setValue('modelName', value);
  };

  // 生成新的随机头像
  const generateNewAvatar = () => {
    setAvatarSeed(generateRandomSeed());
  };

  // 处理添加新分组
  const handleAddNewGroup = async (name: string, description: string | null) => {
    if (!onAddGroup) return;

    try {
      setIsLoading(true);
      const newGroup = await onAddGroup(name, description);

      // 关闭对话框
      setIsNewGroupDialogOpen(false);

      // 设置新创建的分组为当前选中的分组
      form.setValue('groupId', newGroup.id);

      toast.success('创建成功', {
        description: `分组 "${newGroup.name}" 已创建`,
      });
    } catch (error) {
      console.error('创建联系人分组出错:', error);
      toast.error('创建分组失败', {
        description: error instanceof Error ? error.message : '请检查网络连接或联系管理员',
      });
      throw error; // 将错误继续抛出，让GroupFormDialog处理
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-testid="ai-contact-form" className="space-y-6">
      {showOllamaWarning && (
        <Alert data-testid="ollama-warning-alert" variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ollama 服务不可用</AlertTitle>
          <AlertDescription>
            无法连接到 Ollama 服务。您可以继续创建机器人，但需要确保在运行时 Ollama 服务已启动。
            您可以前往设置页面的 Ollama 管理检查服务状态。
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <div className="space-y-6">
          {/* 基本信息部分 */}
          <CardContainer title="基本信息" dataTestId="basic-info-section">
            {/* 头像部分 - 单独一行 */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center space-y-2">
                <div
                  data-testid="avatar-container"
                  className="w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-500 shadow-md"
                >
                  <img
                    src={currentAvatarUrl}
                    alt="机器人头像"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    data-testid="change-avatar-button"
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateNewAvatar}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw size={14} />
                    <span>换一个</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* 名称部分 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>机器人名称</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="robot-name-input"
                      placeholder="请输入机器人名称"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>所属分组</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger data-testid="group-selector">
                          <SelectValue placeholder="请选择分组" />
                        </SelectTrigger>
                        <SelectContent>
                          {groupOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {onAddGroup && (
                      <Button
                        data-testid="add-group-button"
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsNewGroupDialogOpen(true)}
                      >
                        <Plus size={16} />
                      </Button>
                    )}
                  </div>
                  <FormDescription>选择机器人所属的分组，方便管理</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="robot-description-input"
                      placeholder="请输入机器人描述（可选）"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>简短描述这个机器人的功能和用途。</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContainer>

          {/* 模型配置部分 */}
          <CardContainer title="模型配置" dataTestId="model-config-section">
            <FormField
              control={form.control}
              name="modelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>模型</FormLabel>
                  <Select onValueChange={handleModelChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="model-selector">
                        <SelectValue placeholder="请选择模型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modelOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {serviceAvailable
                      ? '从已安装的 Ollama 模型中选择'
                      : '使用预设模型列表，需要确保在运行时 Ollama 中已安装该模型'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>系统提示词</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="system-prompt-input"
                      placeholder="请输入系统提示词"
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>定义机器人的角色、行为和能力的系统提示词</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContainer>

          {/* 高级参数部分 */}
          <CardContainer title="高级参数" dataTestId="advanced-params-section">
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>温度 (Temperature)</FormLabel>
                    <span className="text-sm text-gray-500">{field.value.toFixed(1)}</span>
                  </div>
                  <FormControl>
                    <Slider
                      data-testid="temperature-slider"
                      defaultValue={[field.value]}
                      min={0}
                      max={2}
                      step={0.1}
                      onValueChange={(vals: number[]) => field.onChange(vals[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    控制输出的随机性。较低的值使输出更确定，较高的值使输出更多样化。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxTokens"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>最大生成长度 (Max Tokens)</FormLabel>
                    <span className="text-sm text-gray-500">{field.value}</span>
                  </div>
                  <FormControl>
                    <Slider
                      data-testid="max-tokens-slider"
                      defaultValue={[field.value || 2048]}
                      min={100}
                      max={8192}
                      step={100}
                      onValueChange={(vals: number[]) => field.onChange(vals[0])}
                    />
                  </FormControl>
                  <FormDescription>模型一次生成的最大token数量。</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topP"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>Top P</FormLabel>
                    <span className="text-sm text-gray-500">
                      {field.value?.toFixed(2) || '0.90'}
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      data-testid="top-p-slider"
                      defaultValue={[field.value || 0.9]}
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={(vals: number[]) => field.onChange(vals[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    控制模型考虑的词汇范围。较低的值使输出更聚焦，较高的值使输出更多样化。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContainer>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          {onCancel && (
            <Button data-testid="cancel-button" type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button
            data-testid="create-robot-button"
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
          >
            创建机器人
          </Button>
        </div>
      </Form>

      {/* 使用提取出来的分组表单对话框组件 */}
      {onAddGroup && (
        <GroupFormDialog
          open={isNewGroupDialogOpen}
          onOpenChange={setIsNewGroupDialogOpen}
          onSubmit={handleAddNewGroup}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default AIContactForm;
