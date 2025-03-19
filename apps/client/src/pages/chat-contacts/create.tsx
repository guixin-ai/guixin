import { emit } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useCurrentUserOrThrow } from '../../hooks/use-current-user-or-throw';
import { useOllamaStore } from '../../models/routes/chat-settings-ollama.model';
import { contactGroupService, contactService } from '../../services';
import { CreateAIContactRequest } from '../../types';
import AIContactForm, {
  GroupOption,
  AgentFormValues,
} from '@/components/ai-contact-form/ai-contact-form';

const CreateContactPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [modelOptions, setModelOptions] = useState<{ value: string; label: string }[]>([]);
  const [serviceAvailable, setServiceAvailable] = useState(false);
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);

  // 使用Ollama模型store
  const {
    models,
    loadModels,
    serviceAvailable: ollamaServiceAvailable,
    checkServiceStatus,
  } = useOllamaStore();

  // 使用自定义hook获取当前用户
  const user = useCurrentUserOrThrow();

  // 组件加载时检查Ollama服务状态并加载模型列表
  useEffect(() => {
    const initOllama = async () => {
      try {
        // 检查Ollama服务是否可用
        const available = await checkServiceStatus();
        setServiceAvailable(available);

        if (available) {
          // 加载模型列表
          await loadModels();
        }
      } catch (err) {
        console.error('初始化Ollama失败:', err);
        setServiceAvailable(false);
      }
    };

    initOllama();
  }, [checkServiceStatus, loadModels]);

  // 当Ollama模型列表变化时，更新下拉选项
  useEffect(() => {
    if (ollamaServiceAvailable && models.length > 0) {
      // 从Ollama获取的模型列表
      const options = models.map(model => ({
        value: model.name,
        label:
          model.name + (model.details?.parameter_size ? ` (${model.details.parameter_size})` : ''),
      }));

      setModelOptions(options);
    }
  }, [models, ollamaServiceAvailable]);

  // 获取所有联系人分组
  const fetchContactGroups = async () => {
    try {
      setIsLoading(true);
      const groups = await contactGroupService.getAllContactGroups();

      const formattedGroups = groups.map(group => ({
        value: group.id,
        label: group.name,
      }));

      setGroupOptions(formattedGroups);
    } catch (error) {
      console.error('获取联系人分组出错:', error);
      toast.error('获取分组失败', {
        description: error instanceof Error ? error.message : '请检查网络连接或联系管理员',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 组件加载时获取联系人分组
  useEffect(() => {
    fetchContactGroups();
  }, []);

  // 关闭当前窗口的函数
  const closeCurrentWindow = async () => {
    try {
      const currentWindow = getCurrentWindow();
      await currentWindow.close();
    } catch (error) {
      console.error('关闭窗口失败:', error);
      toast.error('关闭窗口失败', {
        description: error instanceof Error ? error.message : '请检查网络连接或联系管理员',
      });
    }
  };

  // 处理添加新分组
  const handleAddGroup = async (name: string, description: string | null) => {
    try {
      const newGroup = await contactGroupService.createContactGroup({
        name,
        description,
      });

      // 更新分组列表
      setGroupOptions(prev => [...prev, { value: newGroup.id, label: newGroup.name }]);

      return { id: newGroup.id, name: newGroup.name };
    } catch (error) {
      console.error('创建联系人分组出错:', error);
      throw error;
    }
  };

  async function onSubmit(values: AgentFormValues) {
    // 创建AI联系人请求
    const contactRequest: CreateAIContactRequest = {
      name: values.name,
      model_name: values.modelName,
      system_prompt: values.systemPrompt,
      temperature: values.temperature,
      max_tokens: values.maxTokens,
      top_p: values.topP,
      avatar_url: values.avatarUrl,
      description: values.description,
      is_streaming: true, // 添加流式输出属性（始终为true）
      group_id: values.groupId,
      owner_user_id: user.id, // 使用当前用户的ID
    };

    try {
      setIsLoading(true);
      // 调用服务创建AI联系人
      const newContact = await contactService.createAIContact(contactRequest);

      // 发送事件通知，通知联系人列表刷新
      await emit('contact-created', {
        userId: user.id,
        contact: {
          id: newContact.id,
          name: newContact.name,
          description: newContact.description,
          group_id: newContact.group_id,
        },
      });

      toast.success('创建成功', {
        description: `机器人 "${values.name}" 已创建`,
      });
      // 提交成功后关闭当前窗口
      await closeCurrentWindow();
    } catch (error) {
      console.error('创建联系人出错:', error);
      toast.error('创建失败', {
        description: error instanceof Error ? error.message : '请检查网络连接或联系管理员',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <AIContactForm
            onSubmit={onSubmit}
            onCancel={closeCurrentWindow}
            onAddGroup={handleAddGroup}
            serviceAvailable={serviceAvailable}
            modelOptions={modelOptions.length > 0 ? modelOptions : undefined}
            groupOptions={groupOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateContactPage;
