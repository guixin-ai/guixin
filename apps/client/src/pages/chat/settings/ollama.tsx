import { RefreshCw, Download, Trash2, Info, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useOllamaStore } from '../../../models/routes/chat-settings-ollama.model';
import { formatFileSize, formatRelativeTime } from '../../../lib/date-utils';
import { ModelDownload } from '../../../components/model-download';
import { toast } from 'sonner';

const OllamaPage = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Ollama 本地模型管理</h2>
      <OllamaManager />
    </div>
  );
};

// Ollama管理组件
const OllamaManager = () => {
  const {
    models,
    isLoading,
    serviceAvailable,
    newModelName,
    error,
    version,
    selectedModel,
    modelDetails,
    showModelInfo,
    deletingModel,
    currentDownload,
    lastCheckedTime,
    lastSyncedModelsTime,
    loadModels,
    checkServiceStatus,
    downloadModel,
    deleteModel,
    viewModelDetails,
    setShowModelInfo,
    setNewModelName,
    resetError,
    requestModelDownload,
  } = useOllamaStore();

  // 组件挂载时加载模型列表并启动定时检查
  useEffect(() => {
    // 首次加载模型列表
    loadModels().catch(err => {
      toast.error('加载模型列表失败', {
        description: err instanceof Error ? err.message : String(err),
      });
    });

    // 恢复下载状态 - 处理刷新页面时保持下载状态
    const state = useOllamaStore.getState();
    state.restoreDownloadState().catch(err => {
      toast.error('恢复下载状态失败', {
        description: err instanceof Error ? err.message : String(err),
      });
    });

    // 每5秒检查一次服务状态
    const timer = setInterval(() => {
      checkServiceStatus().catch(err => {
        // 服务状态错误很常见，只在控制台输出
        console.error('Ollama 服务状态检查失败:', err);
      });

      // 每隔30秒自动刷新模型列表（如果服务可用）
      const now = Date.now();
      const lastSync = state.lastSyncedModelsTime || 0;
      if (state.serviceAvailable && now - lastSync > 30000) {
        loadModels().catch(err => {
          console.error('自动刷新模型列表失败:', err);
        });
      }

      // 定时处理队列 - 仅处理等待中的任务及恢复下载中的任务
      if (
        state.downloadQueue.some(
          item => item.status === 'pending' || item.status === 'downloading'
        ) &&
        !state.currentDownload
      ) {
        state.processQueue().catch(err => {
          console.error('处理下载队列失败:', err);
        });
      }
    }, 5000);

    // 组件卸载时清除定时器
    return () => {
      clearInterval(timer);
      console.log('已停止 Ollama 服务状态检查');
    };
  }, [loadModels, checkServiceStatus]);

  // 监听错误状态变化
  useEffect(() => {
    if (error) {
      // 跳过"已安装"错误，因为它会在 onDownload 函数中单独处理
      if (!error.includes('已安装')) {
        toast.error(error);
      }
      resetError(); // 显示后重置错误
    }
  }, [error, resetError]);

  return (
    <div>
      {/* 服务状态 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100 dark:border-gray-700">
        <div className="p-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white">Ollama 服务状态</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isLoading ? '检查中...' : serviceAvailable ? '服务运行中' : '服务未运行'}
                {version && serviceAvailable && ` (版本: ${version})`}
              </p>
              {lastCheckedTime && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center">
                  <span className="mr-1">最近检查:</span>
                  <span
                    className="text-gray-500 dark:text-gray-400 font-medium cursor-help"
                    title={new Date(lastCheckedTime).toLocaleString()}
                  >
                    {formatRelativeTime(lastCheckedTime)}
                  </span>
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  checkServiceStatus().catch((err: unknown) => {
                    const errorMsg = err instanceof Error ? err.message : String(err);
                    console.error('手动检查服务状态失败:', errorMsg);
                  })
                }
                className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                title="刷新服务状态"
                disabled={isLoading}
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <div
                className={`px-3 py-1 rounded-full ${serviceAvailable ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'}`}
              >
                {serviceAvailable ? '在线' : '离线'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 模型下载 */}
      <div className="mb-6">
        <ModelDownload
          modelName={newModelName}
          onModelNameChange={setNewModelName}
          onDownload={async modelName => {
            try {
              await requestModelDownload(modelName);
              // 只有在成功添加到队列时才显示成功提示
              toast.success('已添加到下载队列');
              // 立即处理队列
              const state = useOllamaStore.getState();
              await state.processQueue();
            } catch (err: unknown) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              // 如果是已安装的错误，使用不同的提示样式
              if (errorMsg.includes('已安装')) {
                toast.error('模型已安装', {
                  description: errorMsg,
                });
              } else {
                toast.error('添加下载失败', {
                  description: errorMsg,
                });
              }
            }
          }}
          onOpenModelLibrary={() => window.open('https://ollama.ai/library', '_blank')}
          onRetryDownload={async modelName => {
            try {
              const state = useOllamaStore.getState();
              state.retryDownload(modelName);
              toast.success('已将模型重新加入下载队列');
              await state.processQueue();
            } catch (err: unknown) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              toast.error('重试下载失败', {
                description: errorMsg,
              });
            }
          }}
          onRetryAllFailed={async () => {
            try {
              const state = useOllamaStore.getState();
              state.retryAllFailed();
              toast.success('已将所有失败模型重新加入下载队列');
              await state.processQueue();
            } catch (err: unknown) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              toast.error('重试失败', {
                description: errorMsg,
              });
            }
          }}
          onRemoveFromQueue={modelName => {
            try {
              const state = useOllamaStore.getState();
              state.removeFromQueue(modelName);
              toast.success(`已从队列中移除: ${modelName}`);
            } catch (err: unknown) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              toast.error('移除失败', {
                description: errorMsg,
              });
            }
          }}
          onCloseCompleted={modelName => {
            try {
              const state = useOllamaStore.getState();
              state.removeFromQueue(modelName);
              toast.success(`已关闭下载通知: ${modelName}`);
            } catch (err: unknown) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              toast.error('关闭通知失败', {
                description: errorMsg,
              });
            }
          }}
          isServiceAvailable={serviceAvailable}
          isDownloading={!!currentDownload}
          downloadProgress={currentDownload?.progress}
          downloadQueue={useOllamaStore.getState().downloadQueue}
        />
      </div>

      {/* 模型列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white">已安装模型</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {models.length > 0 ? `共 ${models.length} 个模型` : '暂无安装模型'}
              </p>
              {lastSyncedModelsTime && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center">
                  <span className="mr-1">最近同步:</span>
                  <span
                    className="text-gray-500 dark:text-gray-400 font-medium cursor-help"
                    title={new Date(lastSyncedModelsTime).toLocaleString()}
                  >
                    {formatRelativeTime(lastSyncedModelsTime)}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={() =>
                loadModels().catch((err: unknown) => {
                  const errorMsg = err instanceof Error ? err.message : String(err);
                  toast.error('刷新模型列表失败', {
                    description: errorMsg,
                  });
                })
              }
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="刷新模型列表"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw size={24} className="animate-spin text-blue-500" />
            </div>
          ) : !serviceAvailable ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              Ollama服务未运行，无法获取模型列表
            </p>
          ) : models.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">未找到已安装的模型</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {models.map(model => (
                <div key={model.digest} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">{model.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        大小: {formatFileSize(model.size)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        修改时间: {new Date(model.modified_at).toLocaleString()}
                      </p>
                      {model.details && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {model.details.family && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded">
                              {model.details.family}
                            </span>
                          )}
                          {model.details.parameter_size && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded">
                              {model.details.parameter_size}
                            </span>
                          )}
                          {model.details.quantization_level && (
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-2 py-0.5 rounded">
                              {model.details.quantization_level}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          viewModelDetails(model.name).catch((err: unknown) => {
                            const errorMsg = err instanceof Error ? err.message : String(err);
                            toast.error('获取模型详情失败', {
                              description: errorMsg,
                            });
                          })
                        }
                        className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        title="查看详情"
                      >
                        <Info size={16} />
                      </button>
                      <button
                        onClick={() =>
                          deleteModel(model.name).catch((err: unknown) => {
                            const errorMsg = err instanceof Error ? err.message : String(err);
                            toast.error('删除模型失败', {
                              description: errorMsg,
                            });
                          })
                        }
                        disabled={deletingModel === model.name}
                        className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title="删除模型"
                      >
                        <Trash2
                          size={16}
                          className={deletingModel === model.name ? 'animate-pulse' : ''}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 模型详情弹窗 */}
      {showModelInfo && modelDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-medium text-lg text-gray-800 dark:text-white">
                {selectedModel} 详情
              </h3>
              <button
                onClick={() => setShowModelInfo(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              {modelDetails.details && (
                <div className="mb-4 grid grid-cols-2 gap-4">
                  {modelDetails.details.parent_model && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        基础模型
                      </h4>
                      <p className="text-gray-800 dark:text-white">
                        {modelDetails.details.parent_model}
                      </p>
                    </div>
                  )}
                  {modelDetails.details.family && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        模型家族
                      </h4>
                      <p className="text-gray-800 dark:text-white">{modelDetails.details.family}</p>
                    </div>
                  )}
                  {modelDetails.details.parameter_size && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        参数大小
                      </h4>
                      <p className="text-gray-800 dark:text-white">
                        {modelDetails.details.parameter_size}
                      </p>
                    </div>
                  )}
                  {modelDetails.details.quantization_level && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        量化级别
                      </h4>
                      <p className="text-gray-800 dark:text-white">
                        {modelDetails.details.quantization_level}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {modelDetails.license && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    许可证
                  </h4>
                  <p className="text-gray-800 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    {modelDetails.license}
                  </p>
                </div>
              )}

              {modelDetails.modelfile && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    模型文件
                  </h4>
                  <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-3 rounded overflow-auto max-h-60 text-gray-800 dark:text-white">
                    {modelDetails.modelfile}
                  </pre>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowModelInfo(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OllamaPage;
