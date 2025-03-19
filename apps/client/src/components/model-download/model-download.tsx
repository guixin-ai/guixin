import { Download } from 'lucide-react';
import { formatFileSize } from '../../lib/date-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * 下载队列中的模型项
 */
export interface QueueItem {
  /** 模型名称 */
  modelName: string;
  /** 下载状态 */
  status: 'pending' | 'downloading' | 'failed' | 'completed';
  /** 重试次数 */
  retryCount: number;
  /** 错误信息 */
  error?: string;
  /** 添加到队列的时间戳 */
  addedAt: number;
  /** 下载完成的时间戳 */
  completedAt?: number;
}

/**
 * 模型下载组件的属性
 */
export interface ModelDownloadProps {
  /** 当前输入的模型名称 */
  modelName: string;
  /** 模型名称变更回调 */
  onModelNameChange: (name: string) => void;
  /** 点击下载按钮的回调 */
  onDownload: (modelName: string) => void;
  /** 点击浏览模型库的回调 */
  onOpenModelLibrary?: () => void;
  /** 重试下载单个模型的回调 */
  onRetryDownload?: (modelName: string) => void;
  /** 重试所有失败模型的回调 */
  onRetryAllFailed?: () => void;
  /** 从队列中移除模型的回调 */
  onRemoveFromQueue?: (modelName: string) => void;
  /** 关闭已完成下载的回调 */
  onCloseCompleted?: (modelName: string) => void;

  /** Ollama 服务是否可用 */
  isServiceAvailable: boolean;
  /** 是否正在下载 */
  isDownloading: boolean;

  /** 当前下载进度 */
  downloadProgress?: {
    /** 正在下载的模型名称 */
    model: string;
    /** 已下载的字节数 */
    completed: number;
    /** 总字节数 */
    total: number;
  } | null;

  /** 下载队列 */
  downloadQueue?: QueueItem[];
}

/**
 * 模型下载组件
 *
 * 用于展示和管理 Ollama 模型的下载。功能包括：
 * - 输入模型名称或从模型库复制命令进行下载
 * - 显示下载队列和进度
 * - 支持失败重试和批量重试
 * - 实时显示下载进度和文件大小
 */
export const ModelDownload = ({
  modelName,
  onModelNameChange,
  onDownload,
  onOpenModelLibrary,
  onRetryDownload,
  onRetryAllFailed,
  onRemoveFromQueue,
  onCloseCompleted,
  isServiceAvailable,
  isDownloading,
  downloadProgress,
  downloadQueue = [],
}: ModelDownloadProps) => {
  // 计算下载进度百分比
  const calculateProgress = () => {
    if (!downloadProgress) return 0;
    const completed = downloadProgress.completed || 0;
    const total = downloadProgress.total || 1;
    return Math.min(Math.round((completed / total) * 100), 100);
  };

  // 检查是否所有任务都已处理完（完成或失败）
  const isAllProcessed =
    downloadQueue.length > 0 &&
    downloadQueue.every(item => item.status === 'completed' || item.status === 'failed');

  // 获取失败的任务数量
  const failedCount = downloadQueue.filter(item => item.status === 'failed').length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-800 dark:text-white">下载新模型</h3>
          {onOpenModelLibrary && (
            <Button
              variant="link"
              size="sm"
              onClick={onOpenModelLibrary}
              className="text-blue-500 dark:text-blue-400 p-0"
            >
              浏览模型库
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          输入模型名称或从模型库复制命令进行下载
        </p>
        {isDownloading && (
          <div className="mt-2 text-xs text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-2 rounded-md">
            提示: 即使刷新页面，下载也会自动继续
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex gap-2">
          <Input
            value={modelName}
            onChange={e => onModelNameChange(e.target.value)}
            placeholder="输入模型名称或粘贴命令 (例如: llama2 或 ollama run llama2)"
            disabled={!isServiceAvailable}
          />
          <Button
            onClick={() => onDownload(modelName)}
            disabled={!isServiceAvailable || !modelName.trim()}
          >
            <Download size={18} />
            {downloadQueue.length > 0 ? '加入队列' : '下载'}
          </Button>
        </div>

        {/* 下载队列 */}
        {downloadQueue.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">下载队列</h4>
              {isAllProcessed && failedCount > 0 && onRetryAllFailed && (
                <Button variant="ghost" size="sm" onClick={onRetryAllFailed} className="text-xs">
                  重试所有失败 ({failedCount})
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {downloadQueue.map(item => (
                <div
                  key={item.modelName}
                  className="flex flex-col p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {item.modelName}
                      </div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500">
                        {new Date(item.addedAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-0.5 gap-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.status === 'downloading' &&
                          downloadProgress?.model === item.modelName && (
                            <span>下载中 ({calculateProgress()}%)</span>
                          )}
                        {item.status === 'downloading' &&
                          downloadProgress?.model !== item.modelName &&
                          '下载中...'}
                        {item.status === 'pending' && '等待中'}
                        {item.status === 'completed' && (
                          <span className="text-green-500">
                            下载完成
                            {item.completedAt &&
                              ` (${new Date(item.completedAt).toLocaleTimeString()})`}
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <span className="text-red-500">
                            下载失败
                            {item.error && ` - ${item.error}`}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {item.status === 'failed' && onRetryDownload && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRetryDownload(item.modelName)}
                            className="h-6 text-xs px-2"
                          >
                            重试
                          </Button>
                        )}
                        {item.status === 'pending' && onRemoveFromQueue && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRemoveFromQueue(item.modelName)}
                            className="h-6 text-xs px-2"
                          >
                            移除
                          </Button>
                        )}
                        {item.status === 'completed' && onCloseCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onCloseCompleted(item.modelName)}
                            className="h-6 text-xs px-2"
                          >
                            关闭
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 下载进度条 */}
                  {item.status === 'downloading' && downloadProgress?.model === item.modelName && (
                    <div className="mt-2">
                      <div className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300 rounded-full"
                          style={{ width: `${calculateProgress()}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(downloadProgress.completed)} /{' '}
                        {formatFileSize(downloadProgress.total)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
