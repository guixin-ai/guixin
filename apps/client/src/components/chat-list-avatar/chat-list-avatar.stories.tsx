import type { Meta, StoryObj } from '@storybook/react';
import { ChatListAvatar } from './chat-list-avatar';

const meta = {
  component: ChatListAvatar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    avatars: {
      description: '头像图片URL数组',
      control: { type: 'object' },
    },
    testId: {
      description: '测试ID，用于自动化测试',
      control: 'text',
    },
    className: {
      description: '额外的CSS类名',
      control: 'text',
    },
    defaultAvatarUrl: {
      description: '默认头像URL，当图片加载失败时使用',
      control: 'text',
    },
  },
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-4 items-center">
        <div className="w-12 h-12 border-2 border-blue-300">
          <Story />
        </div>
        <div className="w-20 h-20 border-2 border-red-300">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ChatListAvatar>;

// 默认头像URL，使用线上头像
const defaultAvatarUrl = 'https://ui-avatars.com/api/?background=ff5733&color=ffffff&name=默认';

// 随机图片URLs的示例数组
const sampleAvatarUrls = [
  'https://picsum.photos/200/200',
  'https://picsum.photos/201/201',
  'https://picsum.photos/202/202',
  'https://picsum.photos/203/203',
  'https://picsum.photos/204/204',
  'https://picsum.photos/205/205',
  'https://picsum.photos/206/206',
  'https://picsum.photos/207/207',
  'https://picsum.photos/208/208',
  'https://picsum.photos/209/209',
  'https://picsum.photos/210/210',
  'https://picsum.photos/211/211'
];

// 故意设置一个无效的图片URL以展示fallback功能
const invalidImageUrl = 'https://invalid-image-url/404.jpg';

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 单个头像
 */
export const OneAvatar: Story = {
  args: {
    avatars: [sampleAvatarUrls[0]],
    testId: 'story-one-avatar',
    defaultAvatarUrl: defaultAvatarUrl,
  },
  parameters: {
    docs: {
      description: {
        story: '只有一个头像时，填满整个容器。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

// 注意：两个头像会抛出异常，因此不提供演示示例
// 使用时请避免传入恰好两个头像的数组

/**
 * 三个头像
 */
export const ThreeAvatars: Story = {
  args: {
    avatars: [sampleAvatarUrls[0], sampleAvatarUrls[1], sampleAvatarUrls[2]],
    testId: 'story-three-avatars',
    defaultAvatarUrl: defaultAvatarUrl,
  },
  parameters: {
    docs: {
      description: {
        story: '三个头像时，使用品字形布局：上方一个居中，下方两个并排。所有头像在容器中垂直水平居中。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 四个头像
 */
export const FourAvatars: Story = {
  args: {
    avatars: [sampleAvatarUrls[0], sampleAvatarUrls[1], sampleAvatarUrls[2], sampleAvatarUrls[3]],
    testId: 'story-four-avatars',
    defaultAvatarUrl: defaultAvatarUrl,
  },
  parameters: {
    docs: {
      description: {
        story: '四个头像时，两行两列填满。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 五个头像
 */
export const FiveAvatars: Story = {
  args: {
    avatars: [sampleAvatarUrls[0], sampleAvatarUrls[1], sampleAvatarUrls[2], sampleAvatarUrls[3], sampleAvatarUrls[4]],
    testId: 'story-five-avatars',
    defaultAvatarUrl: defaultAvatarUrl,
  },
  parameters: {
    docs: {
      description: {
        story: '五个头像时，使用3×3网格布局，从左到右、从上到下排列。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 六个头像
 */
export const SixAvatars: Story = {
  args: {
    avatars: [sampleAvatarUrls[0], sampleAvatarUrls[1], sampleAvatarUrls[2], sampleAvatarUrls[3], sampleAvatarUrls[4], sampleAvatarUrls[5]],
    testId: 'story-six-avatars',
    defaultAvatarUrl: defaultAvatarUrl,
  },
  parameters: {
    docs: {
      description: {
        story: '六个头像时，使用3×3网格布局，从左到右、从上到下排列。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 七个头像
 */
export const SevenAvatars: Story = {
  args: {
    avatars: [sampleAvatarUrls[0], sampleAvatarUrls[1], sampleAvatarUrls[2], sampleAvatarUrls[3], sampleAvatarUrls[4], sampleAvatarUrls[5], sampleAvatarUrls[6]],
    testId: 'story-seven-avatars',
    defaultAvatarUrl: defaultAvatarUrl,
  },
  parameters: {
    docs: {
      description: {
        story: '七个头像时，使用3×3网格布局，从左到右、从上到下排列。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 八个头像
 */
export const EightAvatars: Story = {
  args: {
    avatars: [sampleAvatarUrls[0], sampleAvatarUrls[1], sampleAvatarUrls[2], sampleAvatarUrls[3], sampleAvatarUrls[4], sampleAvatarUrls[5], sampleAvatarUrls[6], sampleAvatarUrls[7]],
    testId: 'story-eight-avatars',
    defaultAvatarUrl: defaultAvatarUrl,
  },
  parameters: {
    docs: {
      description: {
        story: '八个头像时，使用3×3网格布局，从左到右、从上到下排列。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 九个头像
 */
export const NineAvatars: Story = {
  args: {
    avatars: [sampleAvatarUrls[0], sampleAvatarUrls[1], sampleAvatarUrls[2], sampleAvatarUrls[3], sampleAvatarUrls[4], sampleAvatarUrls[5], sampleAvatarUrls[6], sampleAvatarUrls[7], sampleAvatarUrls[8]],
    testId: 'story-nine-avatars',
    defaultAvatarUrl: defaultAvatarUrl,
  },
  parameters: {
    docs: {
      description: {
        story: '九个头像时，使用3×3网格布局，填满所有位置。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 图片加载失败时使用默认头像
 */
export const FallbackAvatar: Story = {
  args: {
    avatars: [sampleAvatarUrls[0], invalidImageUrl, sampleAvatarUrls[2]],
    testId: 'story-fallback-avatar',
    defaultAvatarUrl: defaultAvatarUrl,
  },
  parameters: {
    docs: {
      description: {
        story: '当图片加载失败时，会显示默认头像（橙色背景的头像）。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 空头像数组（使用默认头像）
 */
export const EmptyAvatars: Story = {
  args: {
    avatars: [],
    testId: 'story-empty-avatars',
    defaultAvatarUrl: defaultAvatarUrl,
  },
  parameters: {
    docs: {
      description: {
        story: '当提供空头像数组时，会显示默认头像（橙色背景的头像）。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 超过上限的头像（只显示前9个）
 */
export const ExceedLimitAvatars: Story = {
  args: {
    avatars: sampleAvatarUrls,
    testId: 'story-exceed-limit-avatars',
    defaultAvatarUrl: defaultAvatarUrl,
  },
  parameters: {
    docs: {
      description: {
        story: '当头像数量超过9个时，只显示前9个头像。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
}; 