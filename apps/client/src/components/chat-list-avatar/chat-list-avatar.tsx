import React from 'react';

export interface ChatListAvatarProps {
  /**
   * 头像数组，应为图片URL
   */
  avatars: string[];
  
  /**
   * 测试ID，用于自动化测试
   */
  testId?: string;
  
  /**
   * 额外的CSS类名
   */
  className?: string;
  
  /**
   * 默认头像URL，当图片加载失败时使用
   */
  defaultAvatarUrl: string;
}

// 布局类型枚举
type LayoutType = 'single' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine';

/**
 * 聊天列表头像组件
 * 
 * 用于显示聊天列表中的头像，支持单个头像和群聊头像（多个头像组合）
 * 当有多个头像时，使用网格布局，最多显示9个头像
 * 组件大小完全响应式，会适应父容器大小
 * 头像圆角采用8%的百分比值，确保在任何尺寸下都保持一致的视觉效果
 * 所有头像都严格保持1:1的宽高比
 * 
 * @throws Error 当头像数量为2个时会抛出异常
 */
export const ChatListAvatar: React.FC<ChatListAvatarProps> = ({
  avatars,
  testId = 'chat-avatar',
  className = '',
  defaultAvatarUrl,
}) => {
  // 最多显示9个头像
  const displayAvatars = avatars?.slice(0, 9) || [];
  const avatarCount = displayAvatars.length;
  
  // 当头像数量为2时，抛出异常
  if (avatarCount === 2) {
    throw new Error('不支持两个头像的布局，请使用1个或3个及以上的头像数量');
  }
  
  // 获取布局类型，根据头像数量返回对应的布局分类
  const getLayoutType = (): LayoutType => {
    switch (avatarCount) {
      case 1: return 'single';
      case 2: return 'two';
      case 3: return 'three';
      case 4: return 'four';
      case 5: return 'five';
      case 6: return 'six';
      case 7: return 'seven';
      case 8: return 'eight';
      case 9: return 'nine';
      default: return 'single';
    }
  };

  // 渲染单个头像
  const renderAvatar = (avatar: string, index: number, className: string = ''): React.ReactElement => {
    const testIdSuffix = avatarCount > 1 ? `-${index}` : '';
    
    // 共享的容器类 - 使用aspect-square替代padding方案但保留容器结构
    const containerClass = `w-full aspect-square relative overflow-hidden ${className}`;
    
    // 图片头像
    return (
      <div 
        key={index}
        className={containerClass}
        style={{ borderRadius: '8%' }}
        data-testid={`${testId}${testIdSuffix}-img`}
      >
        <img 
          src={avatar}
          alt="头像" 
          className="absolute top-0 left-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = defaultAvatarUrl;
          }}
        />
        {/* 这里未来可以添加加载占位符 */}
      </div>
    );
  };
  
  // 根据布局类型获取内容
  const getContent = () => {
    const layoutType = getLayoutType();
    
    switch (layoutType) {
      case 'single':
        // 单个头像：占满整个容器
        return renderAvatar(displayAvatars[0], 0);
      
      case 'two':
        // 两个头像：左右并排
        // 注意：由于前面已经抛出异常，这段代码实际上不会被执行
        return (
          <div className="grid grid-cols-2 gap-0.5 w-full h-full">
            {displayAvatars.map((avatar, index) => renderAvatar(avatar, index))}
          </div>
        );
      
      case 'three':
        // 三个头像：品字形布局（上一下二）
        return (
          <div className="w-full h-full flex flex-col justify-between gap-0.5">
            {/* 上方头像 */}
            <div className="flex justify-center">
              <div className="w-1/2">
                {renderAvatar(displayAvatars[0], 0)}
              </div>
            </div>
            {/* 下方两个头像 */}
            <div className="flex justify-between gap-0.5">
              <div className="w-1/2">
                {renderAvatar(displayAvatars[1], 1)}
              </div>
              <div className="w-1/2">
                {renderAvatar(displayAvatars[2], 2)}
              </div>
            </div>
          </div>
        );
      
      case 'four':
        // 四个头像：2x2网格
        return (
          <div className="grid grid-cols-2 gap-0.5 w-full h-full">
            {displayAvatars.map((avatar, index) => renderAvatar(avatar, index))}
          </div>
        );
      
      default:
        // 5-9个头像：3x3网格
        return (
          <div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-full h-full">
            {displayAvatars.map((avatar, index) => renderAvatar(avatar, index))}
          </div>
        );
    }
  };
  
  // 处理空数组的情况
  if (avatarCount === 0) {
    return (
      <div 
        className={`w-full h-full relative ${className}`}
        data-testid={testId}
      >
        {renderAvatar(defaultAvatarUrl, 0)}
      </div>
    );
  }
  
  // 渲染组件
  return (
    <div 
      className={`w-full h-full relative ${className}`}
      data-testid={testId}
    >
      {getContent()}
    </div>
  );
};

export default ChatListAvatar; 