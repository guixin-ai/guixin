import type { Meta, StoryObj } from '@storybook/react';
import { ModelDownload, type ModelDownloadProps } from './model-download';

const meta = {
  component: ModelDownload,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ModelDownload>;

export default meta;
type Story = StoryObj<typeof ModelDownload>;

// 基础状态
export const 默认状态: Story = {
  args: {
    modelName: '',
    isServiceAvailable: true,
    isDownloading: false,
    onModelNameChange: () => {},
    onDownload: () => {},
    onOpenModelLibrary: () => {
      console.log('打开模型库');
    },
    onRetryDownload: modelName => {
      console.log('重试下载:', modelName);
    },
    onRetryAllFailed: () => {
      console.log('重试所有失败的下载');
    },
    downloadQueue: [],
  },
};

// 服务不可用状态
export const 服务离线: Story = {
  args: {
    ...默认状态.args,
    isServiceAvailable: false,
  },
};

// 下载中状态
export const 下载进行中: Story = {
  args: {
    ...默认状态.args,
    modelName: 'llama2',
    isDownloading: true,
    downloadProgress: {
      model: 'llama2',
      completed: 1500000000,
      total: 4000000000,
    },
    downloadQueue: [
      {
        modelName: 'llama2',
        status: 'downloading',
        retryCount: 0,
        addedAt: Date.now(),
      },
    ],
  },
};

// 下载完成状态
export const 下载完成: Story = {
  args: {
    ...默认状态.args,
    modelName: 'llama2',
    isDownloading: false,
    onCloseCompleted: modelName => {
      console.log('关闭已完成的下载通知:', modelName);
    },
    downloadQueue: [
      {
        modelName: 'llama2',
        status: 'completed',
        retryCount: 0,
        addedAt: Date.now() - 60000,
        completedAt: Date.now(),
      },
    ],
  },
};

// 错误状态
export const 下载出错: Story = {
  args: {
    ...默认状态.args,
    downloadQueue: [
      {
        modelName: 'llama2',
        status: 'failed',
        retryCount: 1,
        error: '网络连接错误',
        addedAt: Date.now() - 30000,
      },
    ],
  },
};

// 有输入状态 - 直接输入模型名称
export const 输入模型名称: Story = {
  args: {
    ...默认状态.args,
    modelName: 'llama2:7b-chat',
  },
};

// 有输入状态 - 从模型库复制命令
export const 输入模型命令: Story = {
  args: {
    ...默认状态.args,
    modelName: 'ollama run mistral:7b-instruct',
  },
};

// 下载队列示例
export const 下载队列: StoryObj<ModelDownloadProps> = {
  render: args => <ModelDownload {...args} />,
  args: {
    ...默认状态.args,
    downloadQueue: [
      {
        modelName: 'llama2:7b',
        status: 'downloading',
        retryCount: 0,
        addedAt: Date.now() - 120000,
      },
      {
        modelName: 'mistral:latest',
        status: 'pending',
        retryCount: 0,
        addedAt: Date.now() - 60000,
      },
      {
        modelName: 'codellama:7b',
        status: 'failed',
        retryCount: 0,
        error: '网络连接错误',
        addedAt: Date.now() - 180000,
      },
    ],
    downloadProgress: {
      model: 'llama2:7b',
      completed: 1258291200,
      total: 2516582400,
    },
    isDownloading: true,
    onRetryDownload: (modelName: string) => console.log(`重试下载模型: ${modelName}`),
    onRetryAllFailed: () => console.log('重试所有失败的下载'),
    onRemoveFromQueue: (modelName: string) => console.log(`从队列中移除模型: ${modelName}`),
  },
};

// 下载队列完成状态
export const 下载队列完成: Story = {
  args: {
    ...默认状态.args,
    modelName: '',
    isDownloading: false,
    onCloseCompleted: modelName => {
      console.log('关闭已完成的下载通知:', modelName);
    },
    downloadQueue: [
      // 最近完成的模型
      {
        modelName: 'llama2',
        status: 'completed',
        retryCount: 0,
        addedAt: Date.now() - 300000,
        completedAt: Date.now(),
      },
      // 之前完成的模型
      {
        modelName: 'mistral:7b-instruct',
        status: 'completed',
        retryCount: 0,
        addedAt: Date.now() - 600000,
        completedAt: Date.now() - 300000,
      },
      // 失败的模型
      {
        modelName: 'yi:34b-chat',
        status: 'failed',
        retryCount: 1,
        error: '服务器响应错误',
        addedAt: Date.now() - 900000,
      },
    ],
  },
};

// 全部处理完毕状态
export const 队列处理完毕: Story = {
  args: {
    ...默认状态.args,
    modelName: '',
    isDownloading: false,
    onCloseCompleted: modelName => {
      console.log('关闭已完成的下载通知:', modelName);
    },
    downloadQueue: [
      // 完成的模型
      {
        modelName: 'llama2',
        status: 'completed',
        retryCount: 0,
        addedAt: Date.now() - 600000,
        completedAt: Date.now() - 300000,
      },
      // 失败的模型（可重试）
      {
        modelName: 'gemma:7b',
        status: 'failed',
        retryCount: 2,
        error: '网络连接超时',
        addedAt: Date.now() - 500000,
      },
      {
        modelName: 'yi:34b-chat',
        status: 'failed',
        retryCount: 1,
        error: '服务器响应错误',
        addedAt: Date.now() - 400000,
      },
      // 另一个完成的模型
      {
        modelName: 'mistral:7b-instruct',
        status: 'completed',
        retryCount: 0,
        addedAt: Date.now() - 300000,
        completedAt: Date.now() - 100000,
      },
    ],
  },
};
