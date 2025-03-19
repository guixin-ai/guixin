import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './button';
import { Input } from './input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { Checkbox } from './checkbox';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Textarea } from './textarea';

const meta = {
  component: Form,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

// 定义表单验证模式
const formSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: '用户名至少需要2个字符',
    })
    .max(50),
  email: z.string().email({
    message: '请输入有效的电子邮件地址',
  }),
  bio: z
    .string()
    .max(160, {
      message: '简介不能超过160个字符',
    })
    .optional(),
});

// 基本登录表单示例
export const 基本登录表单 = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      bio: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // 这里通常会处理表单提交
    alert(JSON.stringify(values, null, 2));
  }

  return (
    <div className="w-[400px]">
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>用户名</FormLabel>
                <FormControl>
                  <Input placeholder="请输入用户名" {...field} />
                </FormControl>
                <FormDescription>这是您的公开显示名称。</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>电子邮件</FormLabel>
                <FormControl>
                  <Input placeholder="请输入电子邮件" {...field} />
                </FormControl>
                <FormDescription>我们不会公开您的电子邮件地址。</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>个人简介</FormLabel>
                <FormControl>
                  <Input placeholder="请输入个人简介" {...field} />
                </FormControl>
                <FormDescription>简短介绍一下您自己。</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" onClick={form.handleSubmit(onSubmit)}>
            提交
          </Button>
        </div>
      </Form>
    </div>
  );
};

// 表单验证示例
export const 表单验证演示 = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      bio: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    alert(JSON.stringify(values, null, 2));
  }

  return (
    <div className="w-[400px]">
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>用户名</FormLabel>
                <FormControl>
                  <Input placeholder="请输入用户名" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>电子邮件</FormLabel>
                <FormControl>
                  <Input placeholder="请输入电子邮件" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="button" onClick={form.handleSubmit(onSubmit)}>
              提交
            </Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              重置
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

// 表单组件分解演示
export const 表单组件分解 = () => {
  // 创建一个表单实例以提供上下文
  const form = useForm({
    defaultValues: {
      example: '',
    },
  });

  return (
    <div className="w-[400px] space-y-8">
      <Form {...form}>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">FormItem 完整示例</h3>
            <FormField
              control={form.control}
              name="example"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标签示例</FormLabel>
                  <FormControl>
                    <Input placeholder="输入框示例" {...field} />
                  </FormControl>
                  <FormDescription>描述文本示例</FormDescription>
                  <FormMessage>错误消息示例</FormMessage>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">各组件单独展示</h3>
            <div className="border p-4 rounded-md space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">FormLabel:</p>
                <FormField
                  control={form.control}
                  name="example"
                  render={() => <FormLabel>标签示例</FormLabel>}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">FormControl + Input:</p>
                <FormField
                  control={form.control}
                  name="example"
                  render={({ field }) => (
                    <FormControl>
                      <Input placeholder="输入框示例" {...field} />
                    </FormControl>
                  )}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">FormDescription:</p>
                <FormField
                  control={form.control}
                  name="example"
                  render={() => <FormDescription>描述文本示例</FormDescription>}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">FormMessage:</p>
                <FormField
                  control={form.control}
                  name="example"
                  render={() => <FormMessage>错误消息示例</FormMessage>}
                />
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

// 高级注册表单示例
export const 高级注册表单 = () => {
  // 定义更复杂的表单验证模式
  const advancedFormSchema = z.object({
    name: z.string().min(2, {
      message: '姓名至少需要2个字符',
    }),
    email: z.string().email({
      message: '请输入有效的电子邮件地址',
    }),
    phone: z.string().min(11, {
      message: '请输入有效的手机号码',
    }),
    gender: z.enum(['male', 'female', 'other'], {
      required_error: '请选择性别',
    }),
    role: z.string({
      required_error: '请选择角色',
    }),
    bio: z
      .string()
      .max(500, {
        message: '简介不能超过500个字符',
      })
      .optional(),
    terms: z.boolean().refine(value => value === true, {
      message: '您必须同意服务条款',
    }),
  });

  type AdvancedFormValues = z.infer<typeof advancedFormSchema>;

  const form = useForm<AdvancedFormValues>({
    resolver: zodResolver(advancedFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      bio: '',
      terms: false,
    },
  });

  function onSubmit(values: AdvancedFormValues) {
    alert(JSON.stringify(values, null, 2));
  }

  return (
    <div className="w-[500px]">
      <Form {...form}>
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">个人信息</h2>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入姓名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>电子邮件</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入电子邮件" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机号码</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入手机号码" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>性别</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="male" />
                        </FormControl>
                        <FormLabel className="font-normal">男</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="female" />
                        </FormControl>
                        <FormLabel className="font-normal">女</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">其他</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择角色" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">管理员</SelectItem>
                      <SelectItem value="user">普通用户</SelectItem>
                      <SelectItem value="guest">访客</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>个人简介</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请简短介绍一下您自己"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>您可以写下您的兴趣爱好、专业技能等信息。</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>接受服务条款</FormLabel>
                    <FormDescription>您必须同意我们的服务条款才能继续。</FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="button" onClick={form.handleSubmit(onSubmit)} className="w-full">
            注册
          </Button>
        </div>
      </Form>
    </div>
  );
};

// 动态表单字段示例
export const 动态表单字段 = () => {
  // 定义动态表单验证模式
  const dynamicFormSchema = z.object({
    projectName: z.string().min(2, {
      message: '项目名称至少需要2个字符',
    }),
    tasks: z
      .array(
        z.object({
          name: z.string().min(1, { message: '任务名称不能为空' }),
          description: z.string().optional(),
        })
      )
      .min(1, { message: '至少需要添加一个任务' }),
  });

  type DynamicFormValues = z.infer<typeof dynamicFormSchema>;

  const form = useForm<DynamicFormValues>({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: {
      projectName: '',
      tasks: [{ name: '', description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tasks',
  });

  function onSubmit(values: DynamicFormValues) {
    alert(JSON.stringify(values, null, 2));
  }

  return (
    <div className="w-[500px]">
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>项目名称</FormLabel>
                <FormControl>
                  <Input placeholder="请输入项目名称" {...field} />
                </FormControl>
                <FormDescription>为您的任务列表指定一个项目名称。</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>任务列表</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '', description: '' })}
              >
                添加任务
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-md relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={() => fields.length > 1 && remove(index)}
                  disabled={fields.length <= 1}
                >
                  ✕
                </Button>

                <FormField
                  control={form.control}
                  name={`tasks.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>任务名称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入任务名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`tasks.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>任务描述</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="请输入任务描述（可选）"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            {form.formState.errors.tasks?.root && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.tasks.root.message}
              </p>
            )}
          </div>

          <Button type="button" onClick={form.handleSubmit(onSubmit)}>
            提交项目
          </Button>
        </div>
      </Form>
    </div>
  );
};

// 表单状态管理示例
export const 表单状态管理 = () => {
  const [serverResponse, setServerResponse] = useState<string | null>(null);

  // 定义表单验证模式
  const formSchema = z
    .object({
      username: z
        .string()
        .min(2, {
          message: '用户名至少需要2个字符',
        })
        .max(50),
      password: z.string().min(8, {
        message: '密码至少需要8个字符',
      }),
      confirmPassword: z.string(),
      receiveUpdates: z.boolean().default(false),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: '密码不匹配',
      path: ['confirmPassword'],
    });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      receiveUpdates: false,
    },
    mode: 'onChange', // 实时验证
  });

  // 监听表单字段变化
  const watchUsername = form.watch('username');
  const watchPassword = form.watch('password');
  const watchReceiveUpdates = form.watch('receiveUpdates');

  // 获取表单状态
  const { isDirty, isValid, isSubmitting, isSubmitted, errors } = form.formState;

  function onSubmit(values: FormValues) {
    // 模拟API请求
    setServerResponse(null);
    setTimeout(() => {
      setServerResponse(JSON.stringify(values, null, 2));
    }, 1500);
  }

  return (
    <div className="w-[600px] grid grid-cols-2 gap-8">
      <div>
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入用户名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="请输入密码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认密码</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="请再次输入密码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receiveUpdates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>接收更新</FormLabel>
                    <FormDescription>是否接收产品更新和营销邮件。</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={!isDirty || !isValid || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? '提交中...' : '注册'}
            </Button>
          </div>
        </Form>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">表单状态</h3>
          <div className="p-4 border rounded-md space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">isDirty:</div>
              <div className="text-sm">{isDirty ? '是' : '否'}</div>

              <div className="text-sm font-medium">isValid:</div>
              <div className="text-sm">{isValid ? '是' : '否'}</div>

              <div className="text-sm font-medium">isSubmitting:</div>
              <div className="text-sm">{isSubmitting ? '是' : '否'}</div>

              <div className="text-sm font-medium">isSubmitted:</div>
              <div className="text-sm">{isSubmitted ? '是' : '否'}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">监听的字段值</h3>
          <div className="p-4 border rounded-md space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">用户名:</div>
              <div className="text-sm">{watchUsername || '(空)'}</div>

              <div className="text-sm font-medium">密码长度:</div>
              <div className="text-sm">{watchPassword ? watchPassword.length : 0} 个字符</div>

              <div className="text-sm font-medium">接收更新:</div>
              <div className="text-sm">{watchReceiveUpdates ? '是' : '否'}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">错误信息</h3>
          <div className="p-4 border rounded-md">
            {Object.keys(errors).length > 0 ? (
              <pre className="text-xs text-destructive whitespace-pre-wrap">
                {JSON.stringify(errors, null, 2)}
              </pre>
            ) : (
              <div className="text-sm">无错误</div>
            )}
          </div>
        </div>

        {serverResponse && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">服务器响应</h3>
            <div className="p-4 border rounded-md">
              <pre className="text-xs whitespace-pre-wrap">{serverResponse}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 表单组件结构示例
export const 表单组件结构 = () => {
  // 创建一个简单的表单实例
  const form = useForm({
    defaultValues: {
      example: '',
    },
  });

  return (
    <div className="w-[500px] space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">表单组件结构</h2>
        <p className="text-sm text-muted-foreground">
          下面是一个完整的表单组件结构示例，展示了各个组件的嵌套关系。
        </p>

        <div className="border-2 border-dashed border-gray-300 p-4 rounded-md">
          <div className="text-xs text-gray-500 mb-2">Form</div>
          <Form {...form}>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-md">
              <div className="text-xs text-gray-500 mb-2">FormField</div>
              <FormField
                control={form.control}
                name="example"
                render={({ field }) => (
                  <div className="border-2 border-dashed border-blue-500 p-4 rounded-md">
                    <div className="text-xs text-blue-500 mb-2">FormItem</div>
                    <FormItem>
                      <div className="border-2 border-dashed border-green-500 p-3 rounded-md mb-3">
                        <div className="text-xs text-green-500 mb-1">FormLabel</div>
                        <FormLabel>字段标签</FormLabel>
                      </div>

                      <div className="border-2 border-dashed border-amber-500 p-3 rounded-md mb-3">
                        <div className="text-xs text-amber-500 mb-1">FormControl</div>
                        <FormControl>
                          <Input placeholder="输入框示例" {...field} />
                        </FormControl>
                      </div>

                      <div className="border-2 border-dashed border-purple-500 p-3 rounded-md mb-3">
                        <div className="text-xs text-purple-500 mb-1">FormDescription</div>
                        <FormDescription>这是字段的描述信息</FormDescription>
                      </div>

                      <div className="border-2 border-dashed border-red-500 p-3 rounded-md">
                        <div className="text-xs text-red-500 mb-1">FormMessage</div>
                        <FormMessage>这里会显示验证错误信息</FormMessage>
                      </div>
                    </FormItem>
                  </div>
                )}
              />
            </div>
          </Form>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">组件说明</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
              <strong>Form</strong>: 表单容器，提供表单上下文
            </li>
            <li className="flex items-center">
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
              <strong>FormField</strong>: 表单字段，连接表单控制器和字段
            </li>
            <li className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <strong>FormItem</strong>: 表单项容器，包含标签、控件、描述和错误消息
            </li>
            <li className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <strong>FormLabel</strong>: 表单标签，用于描述表单字段
            </li>
            <li className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <strong>FormControl</strong>: 表单控件包装器，提供无障碍属性
            </li>
            <li className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <strong>FormDescription</strong>: 表单字段描述，提供额外信息
            </li>
            <li className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <strong>FormMessage</strong>: 表单错误消息，显示验证错误
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
