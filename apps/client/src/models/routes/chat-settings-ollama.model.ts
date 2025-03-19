/**
 * Ollama模型 - 定义Ollama相关的类型和状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { ollamaService } from '../../services';
import { formatFileSize, formatRelativeTime } from '../../lib/date-utils';
import {
  OllamaModel,
  OllamaShowResponse,
  OllamaPullRequest,
  OllamaProgressResponse,
  OllamaDeleteRequest,
} from '../../types';

// 下载状态类型
export type DownloadStatus = 'pending' | 'downloading' | 'failed' | 'completed';

// 下载队列项类型
export interface QueueItem {
  modelName: string;
  status: DownloadStatus;
  retryCount: number;
  error?: string;
  addedAt: number;
  completedAt?: number;
}

// 下载进度类型
export interface DownloadProgress {
  model: string;
  completed: number;
  total: number;
}

// 当前下载类型
export interface CurrentDownload {
  modelName: string;
  progress: DownloadProgress;
}

// 失败下载记录类型
export interface FailedDownload {
  modelName: string;
  error: string;
  retryCount: number;
  timestamp: number;
}

// Ollama状态接口
export interface OllamaState {
  // 模型列表
  models: OllamaModel[];
  // 服务可用状态
  serviceAvailable: boolean;
  // 加载状态
  isLoading: boolean;
  // 错误信息
  error: string | null;
  // Ollama版本
  version: string | null;
  // 选中的模型
  selectedModel: string | null;
  // 模型详情
  modelDetails: OllamaShowResponse | null;
  // 模型详情显示状态
  showModelInfo: boolean;
  // 正在删除的模型
  deletingModel: string | null;
  // 新模型名称输入
  newModelName: string;
  // 服务上次检查时间
  lastCheckedTime: number | null;
  // 模型列表上次同步时间
  lastSyncedModelsTime: number | null;

  // 下载队列相关状态
  downloadQueue: QueueItem[];
  currentDownload: CurrentDownload | null;
  failedDownloads: FailedDownload[];

  // 方法
  checkServiceStatus: () => Promise<boolean>;
  loadModels: () => Promise<void>;
  downloadModel: (modelName: string) => Promise<void>;
  deleteModel: (modelName: string) => Promise<void>;
  viewModelDetails: (modelName: string) => Promise<void>;
  setShowModelInfo: (show: boolean) => void;
  setNewModelName: (name: string) => void;
  resetError: () => void;

  // 下载队列相关方法
  addToQueue: (modelName: string) => void;
  removeFromQueue: (modelName: string) => void;
  retryDownload: (modelName: string) => void;
  retryAllFailed: () => void;
  processQueue: () => Promise<void>;
  restoreDownloadState: () => Promise<void>;

  // 请求下载新模型
  requestModelDownload: (modelName: string) => void;
}

// 创建Ollama状态存储
export const useOllamaStore = create(
  persist(
    immer<OllamaState>((set, get) => ({
      // 初始状态
      models: [],
      serviceAvailable: false,
      isLoading: false,
      error: null,
      version: null,
      selectedModel: null,
      modelDetails: null,
      showModelInfo: false,
      deletingModel: null,
      newModelName: '',
      lastCheckedTime: null,
      lastSyncedModelsTime: null,
      downloadQueue: [],
      currentDownload: null,
      failedDownloads: [],

      // 检查服务状态
      checkServiceStatus: async () => {
        try {
          const available = await ollamaService.isServiceAvailable();
          set(state => {
            state.serviceAvailable = available;
            // 更新检查时间
            state.lastCheckedTime = Date.now();
          });

          if (available) {
            try {
              const versionInfo = await ollamaService.getVersion();
              set(state => {
                state.version = versionInfo;
              });
            } catch (err) {
              console.error('获取Ollama版本失败:', err);
              const errorMessage = `获取Ollama版本失败: ${err instanceof Error ? err.message : String(err)}`;
              set(state => {
                state.error = errorMessage;
              });
              throw new Error(errorMessage);
            }
          }

          return available;
        } catch (err) {
          console.error('检查Ollama服务状态失败:', err);
          const errorMessage = '无法连接到Ollama服务，请确保服务已启动';
          set(state => {
            state.serviceAvailable = false;
            state.error = errorMessage;
            // 即使发生错误也更新检查时间
            state.lastCheckedTime = Date.now();
          });
          throw new Error(errorMessage);
        }
      },

      // 加载模型列表
      loadModels: async () => {
        set(state => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // 检查Ollama服务是否可用
          const available = await get().checkServiceStatus();

          if (available) {
            // 获取模型列表
            const modelList = await ollamaService.listModels();
            set(state => {
              state.models = modelList;
              state.lastSyncedModelsTime = Date.now();
            });
          }
        } catch (err) {
          console.error('加载Ollama模型失败:', err);
          const errorMessage = '无法连接到Ollama服务，请确保服务已启动';
          set(state => {
            state.error = errorMessage;
          });
          throw new Error(errorMessage);
        } finally {
          set(state => {
            state.isLoading = false;
          });
        }
      },

      // 下载新模型
      downloadModel: async (modelName: string) => {
        if (!modelName.trim()) {
          set(state => {
            state.error = '请输入有效的模型名称';
          });
          return;
        }

        try {
          set(state => {
            state.error = null;
          });

          // 处理模型名称
          let processedModelName = modelName;
          if (modelName.startsWith('ollama run ')) {
            processedModelName = modelName.replace('ollama run ', '');
          }

          const pullRequest: OllamaPullRequest = {
            model: processedModelName,
            stream: true,
          };

          await ollamaService.pullModel(pullRequest, (progress: OllamaProgressResponse) => {
            if (progress) {
              set(state => {
                if (state.currentDownload?.modelName === processedModelName) {
                  state.currentDownload.progress = {
                    model: processedModelName,
                    completed: progress.completed || 0,
                    total: progress.total || 1,
                  };
                }
              });
            }
          });

          // 下载完成后刷新模型列表
          await get().loadModels();
        } catch (err) {
          console.error('下载模型失败:', err);
          set(state => {
            state.error = `下载模型失败: ${err instanceof Error ? err.message : String(err)}`;
          });
          throw err; // 向上传递错误，让 processQueue 处理
        }
      },

      // 删除模型
      deleteModel: async (modelName: string) => {
        try {
          set(state => {
            state.deletingModel = modelName;
            state.error = null;
          });

          const deleteRequest: OllamaDeleteRequest = {
            model: modelName,
          };

          await ollamaService.deleteModel(deleteRequest);

          // 删除成功后刷新模型列表
          await get().loadModels();
        } catch (err) {
          console.error('删除模型失败:', err);
          const errorMessage = `删除模型失败: ${err instanceof Error ? err.message : String(err)}`;
          set(state => {
            state.error = errorMessage;
          });
          throw new Error(errorMessage);
        } finally {
          set(state => {
            state.deletingModel = null;
          });
        }
      },

      // 查看模型详情
      viewModelDetails: async (modelName: string) => {
        try {
          set(state => {
            state.selectedModel = modelName;
            state.showModelInfo = true;
          });

          const details = await ollamaService.showModel({
            name: modelName,
            verbose: true,
          });

          set(state => {
            state.modelDetails = details;
          });
        } catch (err) {
          console.error('获取模型详情失败:', err);
          const errorMessage = `获取模型详情失败: ${err instanceof Error ? err.message : String(err)}`;
          set(state => {
            state.error = errorMessage;
            state.showModelInfo = false;
          });
          throw new Error(errorMessage);
        }
      },

      // 设置模型详情显示状态
      setShowModelInfo: (show: boolean) => {
        set(state => {
          state.showModelInfo = show;
        });
      },

      // 设置新模型名称
      setNewModelName: (name: string) => {
        set(state => {
          state.newModelName = name;
        });
      },

      // 请求下载新模型
      requestModelDownload: async (modelName: string) => {
        console.log('请求下载模型:', modelName);
        if (!modelName) throw new Error('未指定模型名称');

        // 处理可能的 "ollama run" 命令格式
        let processedName = modelName.trim();
        if (processedName.startsWith('ollama run')) {
          processedName = processedName.replace('ollama run', '').trim();
          console.log('处理后的模型名称:', processedName);
        }

        // 检查是否已在队列中
        const isInQueue = get().downloadQueue.some(item => item.modelName === processedName);
        console.log('是否已在队列中:', isInQueue);
        if (isInQueue) {
          throw new Error(`模型 ${processedName} 已在下载队列中`);
        }

        // 检查是否正在下载
        const isCurrentlyDownloading = get().currentDownload?.modelName === processedName;
        console.log('是否正在下载:', isCurrentlyDownloading);
        if (isCurrentlyDownloading) {
          throw new Error(`模型 ${processedName} 正在下载中`);
        }

        // 检查是否已安装
        const isInstalled = get().models.some(model => model.name === processedName);
        console.log('是否已安装:', isInstalled);
        if (isInstalled) {
          throw new Error(`模型 ${processedName} 已安装`);
        }

        // 添加到下载队列
        console.log('添加到下载队列:', processedName);
        set(state => {
          state.downloadQueue.push({
            modelName: processedName,
            status: 'pending',
            retryCount: 0,
            addedAt: Date.now(),
          });
        });

        // 如果没有正在下载的任务，开始处理队列
        if (!get().currentDownload) {
          console.log('没有正在进行的下载，开始处理队列');
          return get().processQueue();
        } else {
          console.log('有下载任务在进行中，新任务将在队列中等待');
        }
      },

      // 重置错误
      resetError: () => {
        set(state => {
          state.error = null;
        });
      },

      // 添加到下载队列
      addToQueue: (modelName: string) => {
        set(state => {
          state.downloadQueue.push({
            modelName,
            status: 'pending',
            retryCount: 0,
            addedAt: Date.now(),
          });
        });
      },

      // 从下载队列中移除
      removeFromQueue: (modelName: string) => {
        set(state => {
          state.downloadQueue = state.downloadQueue.filter(item => item.modelName !== modelName);
        });
      },

      // 重试下载
      retryDownload: (modelName: string) => {
        set(state => {
          const index = state.downloadQueue.findIndex(
            item => item.modelName === modelName && item.status === 'failed'
          );
          if (index !== -1) {
            state.downloadQueue[index].status = 'pending';
            // 保留之前的信息，但清除错误信息
            state.downloadQueue[index].error = undefined;
          }
        });
        // 重新启动队列处理，Ollama 会自动续接之前的下载
        return get().processQueue();
      },

      // 重试所有失败的下载
      retryAllFailed: () => {
        set(state => {
          state.downloadQueue.forEach((item, index) => {
            if (item.status === 'failed') {
              state.downloadQueue[index].status = 'pending';
              // 保留之前的信息，但清除错误信息
              state.downloadQueue[index].error = undefined;
            }
          });
        });
        // 重新启动队列处理，Ollama 会自动续接之前的下载
        return get().processQueue();
      },

      // 处理下载队列
      processQueue: async () => {
        const state = get();
        console.log('处理下载队列 - 当前队列长度:', state.downloadQueue.length);

        // 如果有正在下载的任务或队列为空，不处理
        if (state.currentDownload) {
          console.log('已有下载任务在进行中:', state.currentDownload.modelName);
          return;
        }

        if (state.downloadQueue.length === 0) {
          console.log('队列为空，无需处理');
          return;
        }

        // 首先查找处于downloading状态但没有currentDownload的任务(表示刷新页面后的中断任务)
        let nextTaskIndex = state.downloadQueue.findIndex(item => item.status === 'downloading');

        // 如果没有中断的下载任务，再找等待中的任务
        if (nextTaskIndex === -1) {
          nextTaskIndex = state.downloadQueue.findIndex(item => item.status === 'pending');
        }

        console.log(
          '找到任务索引:',
          nextTaskIndex,
          '任务状态:',
          nextTaskIndex !== -1 ? state.downloadQueue[nextTaskIndex].status : '无'
        );

        if (nextTaskIndex === -1) {
          console.log('没有需要处理的任务');
          return;
        }

        const modelName = state.downloadQueue[nextTaskIndex].modelName;
        console.log('开始下载模型:', modelName);

        try {
          // 使用队列中的索引更新状态
          set(state => {
            console.log('设置当前下载任务:', modelName);
            state.currentDownload = {
              modelName: modelName,
              progress: {
                model: modelName,
                completed: 0,
                total: 0,
              },
            };
            // 通过索引修改状态
            if (nextTaskIndex >= 0 && nextTaskIndex < state.downloadQueue.length) {
              console.log('更新任务状态为下载中:', modelName);
              state.downloadQueue[nextTaskIndex].status = 'downloading';
            }
          });

          console.log('调用下载模型API:', modelName);
          await get().downloadModel(modelName);

          console.log('下载完成，从队列中移除:', modelName);
          set(state => {
            // 查找模型的最新索引，因为队列可能已经变化
            const currentIndex = state.downloadQueue.findIndex(
              item => item.modelName === modelName && item.status === 'downloading'
            );
            if (currentIndex !== -1) {
              // 更新为已完成状态而不是移除
              state.downloadQueue[currentIndex].status = 'completed';
              state.downloadQueue[currentIndex].completedAt = Date.now();
            }
            state.currentDownload = null;
          });

          // 继续处理队列中的下一个
          console.log('处理队列中的下一个任务');
          await get().processQueue();
        } catch (err) {
          console.error(`下载失败: ${modelName}`, err);
          set(state => {
            // 找到当前项的最新索引，因为队列可能已经变化
            const currentIndex = state.downloadQueue.findIndex(
              item => item.modelName === modelName
            );
            if (currentIndex !== -1) {
              console.log(`更新任务 ${modelName} 状态为失败`);
              state.downloadQueue[currentIndex].status = 'failed';
              state.downloadQueue[currentIndex].error =
                err instanceof Error ? err.message : String(err);
            }
            state.currentDownload = null;
          });

          // 失败后继续处理队列中的下一个任务
          console.log('继续处理队列中的下一个任务');
          await get().processQueue();
        }
      },

      // 恢复下载状态
      restoreDownloadState: async () => {
        console.log('尝试恢复下载状态');
        // 查找之前在下载中的任务
        const downloadingItems = get().downloadQueue.filter(item => item.status === 'downloading');

        if (downloadingItems.length > 0) {
          console.log('发现之前正在下载的任务:', downloadingItems);
          for (const item of downloadingItems) {
            try {
              // 检查模型是否已安装（下载可能已完成）
              console.log('检查模型是否已安装:', item.modelName);
              const isInstalled = get().models.some(model => model.name === item.modelName);

              if (isInstalled) {
                console.log('模型已安装，将状态更新为已完成:', item.modelName);
                set(state => {
                  const index = state.downloadQueue.findIndex(i => i.modelName === item.modelName);
                  if (index !== -1) {
                    state.downloadQueue[index].status = 'completed';
                    state.downloadQueue[index].completedAt = Date.now();
                  }
                });
              } else {
                // 如果模型未安装，继续下载
                console.log('模型未安装，继续下载任务:', item.modelName);

                // 恢复下载状态为进行中
                set(state => {
                  const index = state.downloadQueue.findIndex(i => i.modelName === item.modelName);
                  if (index !== -1) {
                    // 保持状态为downloading
                    state.currentDownload = {
                      modelName: item.modelName,
                      progress: {
                        model: item.modelName,
                        completed: 0,
                        total: 0,
                      },
                    };
                  }
                });

                // 重新执行下载 - 这会自动续接已经下载的部分
                try {
                  console.log('重新执行下载, Ollama 将自动续接进度:', item.modelName);
                  await get().downloadModel(item.modelName);

                  // 如果成功完成，更新状态
                  set(state => {
                    const index = state.downloadQueue.findIndex(
                      i => i.modelName === item.modelName
                    );
                    if (index !== -1) {
                      state.downloadQueue[index].status = 'completed';
                      state.downloadQueue[index].completedAt = Date.now();
                    }
                    state.currentDownload = null;
                  });
                } catch (err) {
                  // 如果下载失败，更新状态
                  console.error('恢复下载失败:', err);
                  set(state => {
                    const index = state.downloadQueue.findIndex(
                      i => i.modelName === item.modelName
                    );
                    if (index !== -1) {
                      state.downloadQueue[index].status = 'failed';
                      state.downloadQueue[index].error =
                        err instanceof Error ? err.message : String(err);
                    }
                    state.currentDownload = null;
                  });
                }
              }
            } catch (err) {
              console.error('恢复状态时出错:', err);
            }
          }
        } else {
          console.log('没有找到之前正在下载的任务');

          // 检查是否有处于"pending"状态的任务需要恢复
          const pendingItems = get().downloadQueue.filter(item => item.status === 'pending');
          if (pendingItems.length > 0) {
            console.log('发现等待中的任务，准备处理队列:', pendingItems);
          }
        }

        // 处理队列（如果有等待中的任务）
        await get().processQueue();
      },
    })),
    {
      name: 'ollama-store',
      // 只持久化下载队列相关的状态以及上次检查时间
      partialize: state => ({
        downloadQueue: state.downloadQueue,
        failedDownloads: state.failedDownloads,
        lastCheckedTime: state.lastCheckedTime,
        lastSyncedModelsTime: state.lastSyncedModelsTime,
      }),
    }
  )
);

// 导出格式化函数，用于兼容现有代码
export { formatFileSize, formatRelativeTime as formatCheckedTime };
