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
  const [processingChats, setProcessingChats] = useState<Set<string>>(new Set());

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
      // 如果已经在处理这个聊天的队列，则跳过
      if (processingChats.has(chatId)) return;
      
      const { queueItems, getChatHistory, startProcessing, completeProcessing, errorProcessing } = useAIQueueStore.getState();
      
      // 获取该聊天的队列
      const chatQueue = queueItems[chatId] || [];
      if (chatQueue.length === 0) return;
      
      // 标记该聊天正在处理
      setProcessingChats(prev => new Set(prev).add(chatId));
      
      // 获取队列头部项目
      const nextItem = chatQueue[0];
      
      // 获取该聊天的历史记录
      const messages = getChatHistory(chatId);
      
      // 进行处理，不再需要try/catch，使用回调处理所有错误
      const result = await aiProcessor.process({
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
            // 内容更新无需特殊处理，模型层会处理UI更新
          },
          onComplete: (chatId, messageId, content) => {
            completeProcessing(chatId, messageId, content);
            // 移除处理标记
            setProcessingChats(prev => {
              const newSet = new Set(prev);
              newSet.delete(chatId);
              return newSet;
            });
            // 检查该聊天是否还有下一个队列项
            const currentState = useAIQueueStore.getState();
            if ((currentState.queueItems[chatId]?.length || 0) > 0) {
              // 继续处理该聊天的下一个队列项
              setTimeout(() => processChatQueue(chatId), 50);
            }
          },
          onError: (chatId, messageId, error) => {
            errorProcessing(chatId, messageId, error);
            // 移除处理标记
            setProcessingChats(prev => {
              const newSet = new Set(prev);
              newSet.delete(chatId);
              return newSet;
            });
            // 检查是否还有下一个队列项
            const currentState = useAIQueueStore.getState();
            if ((currentState.queueItems[chatId]?.length || 0) > 0) {
              // 继续处理该聊天的下一个队列项
              setTimeout(() => processChatQueue(chatId), 50);
            }
          }
        }
      });
      
      // 如果返回为空，说明处理失败，但这已经通过onError回调处理了
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
    
    // 监听队列变化
    const unsubscribe = useAIQueueStore.subscribe(
      (state) => {
        // 返回队列中有项目的聊天ID数组，用于检测变化
        return Object.keys(state.queueItems).filter(
          chatId => (state.queueItems[chatId]?.length || 0) > 0
        ).join(',');
      }
    );
    
    // 手动实现监听逻辑
    let prevQueuedChats = '';
    const checkQueueChanges = () => {
      const state = useAIQueueStore.getState();
      const currentQueuedChats = Object.keys(state.queueItems).filter(
        chatId => (state.queueItems[chatId]?.length || 0) > 0
      ).join(',');
      
      if (currentQueuedChats !== prevQueuedChats) {
        prevQueuedChats = currentQueuedChats;
        if (currentQueuedChats) {
          scanAndProcessQueues();
        }
      }
      
      // 定期检查队列变化
      requestAnimationFrame(checkQueueChanges);
    };
    
    // 启动检查
    const animationId = requestAnimationFrame(checkQueueChanges);
    
    // 初始扫描一次队列
    scanAndProcessQueues();
    
    // 返回清理函数
    return () => {
      unsubscribe();
      cancelAnimationFrame(animationId);
    };
  }, [processingChats]);

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
