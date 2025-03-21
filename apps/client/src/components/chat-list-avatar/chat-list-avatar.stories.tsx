import type { Meta, StoryObj } from '@storybook/react';
import { ChatListAvatar } from './chat-list-avatar';

const meta = {
  component: ChatListAvatar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    avatars: {
      description: '头像数组，可以是图片URL或者字符串（用于显示第一个字符）',
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

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 单个头像
 */
export const OneAvatar: Story = {
  args: {
    avatars: ['张'],
    testId: 'story-one-avatar',
  },
  parameters: {
    docs: {
      description: {
        story: '只有一个头像时，填满整个容器。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 两个头像
 */
export const TwoAvatars: Story = {
  args: {
    avatars: ['张', '李'],
    testId: 'story-two-avatars',
  },
  parameters: {
    docs: {
      description: {
        story: '两个头像时，从左上角开始，从左到右排列。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 三个头像
 */
export const ThreeAvatars: Story = {
  args: {
    avatars: ['张', '李', '王'],
    testId: 'story-three-avatars',
  },
  parameters: {
    docs: {
      description: {
        story: '三个头像时，使用三角形布局：上方一个居中，下方两个并排。所有头像在容器中垂直水平居中。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 四个头像
 */
export const FourAvatars: Story = {
  args: {
    avatars: ['张', '李', '王', '赵'],
    testId: 'story-four-avatars',
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
    avatars: ['张', '李', '王', '赵', '刘'],
    testId: 'story-five-avatars',
  },
  parameters: {
    docs: {
      description: {
        story: '五个头像时，使用3x3网格，前两行各三个，最后一个在第三行左侧。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 六个头像
 */
export const SixAvatars: Story = {
  args: {
    avatars: ['张', '李', '王', '赵', '刘', '陈'],
    testId: 'story-six-avatars',
  },
  parameters: {
    docs: {
      description: {
        story: '六个头像时，使用3x3网格，前两行各三个。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 七个头像
 */
export const SevenAvatars: Story = {
  args: {
    avatars: ['张', '李', '王', '赵', '刘', '陈', '钱'],
    testId: 'story-seven-avatars',
  },
  parameters: {
    docs: {
      description: {
        story: '七个头像时，使用3x3网格，前两行各三个，最后一个在第三行左侧。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 八个头像
 */
export const EightAvatars: Story = {
  args: {
    avatars: ['张', '李', '王', '赵', '刘', '陈', '钱', '孙'],
    testId: 'story-eight-avatars',
  },
  parameters: {
    docs: {
      description: {
        story: '八个头像时，使用3x3网格，前两行各三个，最后两个在第三行。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 九个头像
 */
export const NineAvatars: Story = {
  args: {
    avatars: ['张', '李', '王', '赵', '刘', '陈', '钱', '孙', '周'],
    testId: 'story-nine-avatars',
  },
  parameters: {
    docs: {
      description: {
        story: '九个头像时，使用3x3网格，填满所有位置。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 混合头像的群聊（文字和图片）
 */
export const MixedAvatarsGroup: Story = {
  args: {
    avatars: [
      '张', 
      'https://picsum.photos/200/200', 
      '王', 
      'https://picsum.photos/201/201', 
      '李', 
      'https://picsum.photos/202/202'
    ],
    testId: 'story-mixed-avatars-group',
  },
  parameters: {
    docs: {
      description: {
        story: '混合头像展示，同时包含文字头像和图片头像。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
};

/**
 * 超过上限的头像（只显示前9个）
 */
export const ExceedLimitAvatars: Story = {
  args: {
    avatars: ['张', '李', '王', '赵', '刘', '陈', '钱', '孙', '周', '吴', '郑', '冯'],
    testId: 'story-exceed-limit-avatars',
  },
  parameters: {
    docs: {
      description: {
        story: '当头像数量超过9个时，只显示前9个头像。上方为小容器(w-12 h-12)，下方为大容器(w-20 h-20)展示。'
      }
    }
  }
}; 