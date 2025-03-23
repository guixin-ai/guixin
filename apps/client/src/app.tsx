import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useAIQueueStore } from './models/ai-queue.model';
import { aiProcessor } from './services/ai-processor.service';
import { userCommands } from '@/commands';
import { convertUserInfoToUser } from '@/converters';

// 定义 App 组件的属性类型
interface AppProps {
  children: ReactNode;
}

function App({ children }: AppProps) {
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);

  // 添加延迟加载逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (loading) {
      // 如果进入加载状态，设置延迟计时器
      timer = setTimeout(() => {
        setShowLoading(true);
      }, 300); // 300ms延迟
    } else {
      // 如果退出加载状态，立即隐藏加载UI
      setShowLoading(false);
    }

    // 清理函数，在组件卸载或依赖变化时清除计时器
    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [loading]);

  // 在应用加载时初始化基础数据
  useEffect(() => {
    const initializeAppData = async () => {
      try {
        setLoading(true);

        // 直接从命令层获取当前用户
        const userInfo = await userCommands.getCurrentUser();
        
        if (userInfo) {
          // 将UserInfo转换为User，然后传入初始化方法
          const user = convertUserInfoToUser(userInfo);
          console.log('应用基础数据初始化完成');
        } else {
          console.error('无法获取当前用户');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('应用基础数据初始化失败:', error);
        setLoading(false);
      }
    };

    initializeAppData();
  }, []);

  // 全局监听AI队列变化并并行处理
  useEffect(() => {
    // 处理单个聊天的消息队列
    const processChatQueue = async (chatId: string) => {
      const { queueItems, processingItems, getChatHistory, startProcessing, completeProcessing, errorProcessing, handleContent } =
        useAIQueueStore.getState();

      // 如果已经在处理这个聊天的队列，则跳过
      if (processingItems[chatId]) return;

      // 获取该聊天的队列
      const chatQueue = queueItems[chatId] || [];
      if (chatQueue.length === 0) return;

      // 获取队列头部项目
      const nextItem = chatQueue[0];

      // 获取该聊天的历史记录
      const messages = getChatHistory(chatId);

      await aiProcessor.process({
        chatId: nextItem.chatId,
        messageId: nextItem.messageId,
        aiMember: nextItem.aiMember,
        modelName: nextItem.modelName,
        messages,
        options: nextItem.options,
        abortController: nextItem.abortController,
        callbacks: {
          onStart: (chatId, messageId) => {
            startProcessing(chatId, messageId);
          },
          onContent: (chatId, messageId, content) => {
            // 使用模型层提供的方法处理内容更新，而不是直接调用注册的处理器
            handleContent(chatId, messageId, content);
          },
          onComplete: (chatId, messageId, content) => {
            completeProcessing(chatId, messageId, content);
            // 检查该聊天是否还有下一个队列项
            const currentState = useAIQueueStore.getState();
            if ((currentState.queueItems[chatId]?.length || 0) > 0) {
              // 继续处理该聊天的下一个队列项
              setTimeout(() => processChatQueue(chatId), 50);
            }
          },
          onError: (chatId, messageId, error) => {
            errorProcessing(chatId, messageId, error);
            // 检查是否还有下一个队列项
            const currentState = useAIQueueStore.getState();
            if ((currentState.queueItems[chatId]?.length || 0) > 0) {
              // 继续处理该聊天的下一个队列项
              setTimeout(() => processChatQueue(chatId), 50);
            }
          },
        },
      });
    };

    // 扫描所有聊天队列并启动处理
    const scanAndProcessQueues = () => {
      const { queueItems } = useAIQueueStore.getState();

      // 遍历所有聊天的队列，并行启动处理
      for (const chatId in queueItems) {
        if (queueItems[chatId].length > 0) {
          processChatQueue(chatId);
        }
      }
    };

    // 监听队列变化并处理队列
    let prevQueuedChats = '';

    const unsubscribe = useAIQueueStore.subscribe(state => {
      // 获取队列中有项目的聊天ID字符串
      const currentQueuedChats = Object.keys(state.queueItems)
        .filter(chatId => (state.queueItems[chatId]?.length || 0) > 0)
        .join(',');

      // 只有当队列发生变化时才处理
      if (currentQueuedChats !== prevQueuedChats) {
        prevQueuedChats = currentQueuedChats;
        if (currentQueuedChats) {
          scanAndProcessQueues();
        }
      }
    });

    // 初始扫描一次队列
    scanAndProcessQueues();

    // 返回清理函数
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      <Toaster richColors />
      {children}
      
      {/* 加载指示器 */}
      {loading && showLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/10">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">加载中...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
