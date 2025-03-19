import type { Meta, StoryObj } from '@storybook/react';
import AIContactForm, { AIContactFormProps } from './ai-contact-form';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const meta: Meta<typeof AIContactForm> = {
  component: AIContactForm,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onSubmit: { action: 'submitted' },
    onCancel: { action: 'cancelled' },
  },
  decorators: [
    Story => (
      <div className="w-[800px] p-4 border-dashed border-2 border-gray-300 rounded-lg">
        <Toaster />
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AIContactForm>;

// 模拟提交函数
const handleSubmit: AIContactFormProps['onSubmit'] = async values => {
  console.log('表单提交:', values);
  toast.success('表单提交成功', {
    description: `创建了机器人: ${values.name}`,
  });
  return new Promise(resolve => setTimeout(resolve, 1000));
};

// 模拟取消操作
const handleCancel = () => {
  console.log('取消操作');
  toast.info('已取消操作');
};

// 基础示例
export const 基础示例: Story = {
  args: {
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    serviceAvailable: true,
    groupOptions: [
      { value: 'general', label: '通用' },
      { value: 'work', label: '工作' },
      { value: 'personal', label: '个人' },
    ],
    modelOptions: [
      { value: 'llama3', label: 'Llama 3' },
      { value: 'llama3:8b', label: 'Llama 3 (8B)' },
      { value: 'llama3:70b', label: 'Llama 3 (70B)' },
      { value: 'qwen:14b', label: 'Qwen (14B)' },
    ],
    onAddGroup: (name, description) => {
      console.log('添加新分组:', name, description);
      toast.success('添加分组', {
        description: `新建分组: ${name}`,
      });
      return Promise.resolve({ id: 'new-group-' + Date.now(), name });
    },
  },
};

// Ollama 服务不可用示例
export const Ollama服务不可用: Story = {
  args: {
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    serviceAvailable: false,
    groupOptions: [
      { value: 'general', label: '通用' },
      { value: 'work', label: '工作' },
    ],
    onAddGroup: (name, description) => {
      return Promise.resolve({ id: 'new-group-' + Date.now(), name });
    },
  },
};

// 预填充值示例
export const 预填充值: Story = {
  args: {
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    serviceAvailable: true,
    groupOptions: [
      { value: 'general', label: '通用' },
      { value: 'customer-service', label: '客服' },
    ],
    initialValues: {
      name: '客服助手',
      modelName: 'llama3',
      systemPrompt:
        '你是一个专业的客服助手，能够回答用户关于我们产品的问题。请保持礼貌和友好的态度，提供准确的信息和建议。',
      temperature: 0.5,
      maxTokens: 4096,
      topP: 0.95,
      description: '专业的客服助手，能够回答关于产品的各种问题',
      groupId: 'customer-service',
    },
    modelOptions: [
      { value: 'llama3', label: 'Llama 3' },
      { value: 'llama3:8b', label: 'Llama 3 (8B)' },
      { value: 'mistral', label: 'Mistral' },
    ],
    onAddGroup: (name, description) => {
      return Promise.resolve({ id: 'new-group-' + Date.now(), name });
    },
  },
};

// 黑暗模式
export const 暗色模式: Story = {
  args: {
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    serviceAvailable: true,
    groupOptions: [
      { value: 'general', label: '通用' },
      { value: 'development', label: '开发' },
    ],
    initialValues: {
      name: '代码助手',
      systemPrompt: '你是一个专业的代码助手，能够帮助用户编写和优化代码。',
      groupId: 'development',
    },
    onAddGroup: (name, description) => {
      return Promise.resolve({ id: 'new-group-' + Date.now(), name });
    },
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// 大量模型选项
export const 多模型选项: Story = {
  args: {
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    serviceAvailable: true,
    groupOptions: [
      { value: 'general', label: '通用' },
      { value: 'ai', label: 'AI模型' },
    ],
    modelOptions: [
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
      { value: 'openchat', label: 'OpenChat' },
      { value: 'stablelm', label: 'StableLM' },
      { value: 'wizardlm', label: 'WizardLM' },
      { value: 'llava', label: 'LLaVA' },
    ],
    onAddGroup: (name, description) => {
      return Promise.resolve({ id: 'new-group-' + Date.now(), name });
    },
  },
};
