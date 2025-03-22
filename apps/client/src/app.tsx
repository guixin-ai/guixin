import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import DelayedLoading from './components/delayed-loading';
import { useAppStore } from './models/app.model';
import { useAIQueueStore } from './models/ai-queue.model';
import { aiProcessor } from './services/ai-processor.service';

// 定义 App 组件的属性类型
interface AppProps {
  children: ReactNode;
}

function App({ children }: AppProps) {
  const { initialize } = useAppStore();
  const [loading, setLoading] = useState(true);

  // 在应用加载时初始化基础数据
  useEffect(() => {
    const initializeAppData = async () => {
      try {
        setLoading(true);

        // 初始化应用
        await initialize();

        console.log('应用基础数据初始化完成');
        setLoading(false);
      } catch (error) {
        console.error('应用基础数据初始化失败:', error);
        setLoading(false);
      }
    };

    initializeAppData();
  }, [initialize]);

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

  // 使用DelayedLoading组件来处理加载状态，避免闪烁
  return (
    <>
      <Toaster richColors />
      <DelayedLoading
        loading={loading}
        delay={300} // 300毫秒的延迟，可根据需要调整
      >
        {children}
      </DelayedLoading>
    </>
  );
}

export default App;
