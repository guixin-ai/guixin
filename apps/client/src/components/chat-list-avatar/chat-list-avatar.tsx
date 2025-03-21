import React, { useRef, useEffect, useState } from 'react';
import ThreeAvatarsLayout from './three-avatars-layout';

export interface ChatListAvatarProps {
  /**
   * 头像数组，可以是图片URL或者字符串（用于显示第一个字符）
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
}

// 布局类型枚举
type LayoutType = 'single' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine';

/**
 * 聊天列表头像组件
 * 
 * 用于显示聊天列表中的头像，支持单个头像和群聊头像（多个头像组合）
 * 当有多个头像时，使用网格布局，最多显示9个头像
 * 组件大小和字体大小完全响应式，会适应父容器大小
 * 头像圆角采用8%的百分比值，确保在任何尺寸下都保持一致的视觉效果
 * 所有头像都严格保持1:1的宽高比
 */
export const ChatListAvatar: React.FC<ChatListAvatarProps> = ({
  avatars,
  testId = 'chat-avatar',
  className = '',
}) => {
  // 容器引用，用于计算大小
  const containerRef = useRef<HTMLDivElement>(null);
  // 字体大小状态
  const [fontSize, setFontSize] = useState('');

  // 确保avatars始终是数组且不为空
  const safeAvatars = Array.isArray(avatars) && avatars.length > 0 
    ? avatars 
    : ['?'];
  
  // 最多显示9个头像
  const displayAvatars = safeAvatars.slice(0, 9);
  const avatarCount = displayAvatars.length;
  
  // 计算并设置响应式字体大小
  useEffect(() => {
    const updateFontSize = () => {
      if (!containerRef.current) return;
      
      // 获取容器尺寸
      const containerWidth = containerRef.current.clientWidth;
      
      // 根据容器尺寸和头像数量计算合适的字体大小
      let calculatedSize;
      if (avatarCount === 1) {
        calculatedSize = containerWidth * 0.5; // 单个头像时，字体大小为容器宽度的一半
      } else if (avatarCount <= 4) {
        calculatedSize = containerWidth * 0.25; // 2-4个头像时，字体大小更小
      } else {
        calculatedSize = containerWidth * 0.15; // 5-9个头像时，字体大小最小
      }
      
      // 设置字体大小（单位为px）
      setFontSize(`${calculatedSize}px`);
    };
    
    // 初始计算
    updateFontSize();
    
    // 监听窗口大小变化，以便在容器大小变化时更新字体大小
    window.addEventListener('resize', updateFontSize);
    
    // 清理监听器
    return () => {
      window.removeEventListener('resize', updateFontSize);
    };
  }, [avatarCount]);
  
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

  // 计算网格样式，根据布局类型返回对应的CSS类名
  const getGridStyles = (): string => {
    const layoutType = getLayoutType();
    
    switch (layoutType) {
      case 'single':
        return ''; // 单个头像不需要网格
      case 'two':
        return 'grid grid-cols-2 gap-0.5'; // 两个头像，2列
      case 'three':
        return ''; // 三个头像使用专门的组件
      case 'four':
        return 'grid grid-cols-2 gap-0.5'; // 四个头像，2x2网格
      default:
        return 'grid grid-cols-3 gap-0.5'; // 5-9个头像，3x3网格
    }
  };
  
  // 获取字体大小样式
  const getFontSizeStyle = () => {
    return { fontSize };
  };
  
  // 判断是否为图片URL
  const isImageUrl = (str: string): boolean => {
    return str.startsWith('http://') || 
           str.startsWith('https://') || 
           str.startsWith('/');
  };
  
  // 获取容器样式类
  const getContainerClass = (): string => {
    const layoutType = getLayoutType();
    let baseClass = `w-full h-full ${getGridStyles()} relative ${className}`;
    
    // 为不同布局添加特定样式
    if (layoutType === 'single') {
      baseClass += ' flex items-center justify-center';
    } else if (layoutType !== 'three') {
      // 三个头像使用专门组件，其他多头像情况使用网格并居中
      baseClass += ' items-center justify-center';
    }
    
    return baseClass;
  };
  
  // 渲染单个头像
  const renderAvatar = (avatar: string, index: number): React.ReactElement => {
    const testIdSuffix = avatarCount > 1 ? `-${index}` : '';
    
    // 共享的样式和结构
    const commonStyles = {
      borderRadius: '8%'
    };
    
    // 共享的容器类
    const containerClass = "w-full h-0 pt-[100%] relative overflow-hidden";
    
    // 内容渲染
    if (isImageUrl(avatar)) {
      // 图片头像
      return (
        <div 
          key={index}
          className={containerClass}
          style={commonStyles}
          data-testid={`${testId}${testIdSuffix}-img`}
        >
          <img 
            src={avatar} 
            alt="头像" 
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </div>
      );
    } else {
      // 文字头像
      return (
        <div 
          key={index}
          className={`${containerClass} bg-gradient-to-br from-green-400 to-green-600`}
          style={commonStyles}
          data-testid={`${testId}${testIdSuffix}-text`}
        >
          <div 
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white font-semibold"
            style={getFontSizeStyle()}
          >
            {avatar.charAt(0)}
          </div>
        </div>
      );
    }
  };
  
  // 针对三个头像的特殊情况，使用专门的布局组件
  if (avatarCount === 3) {
    return (
      <div ref={containerRef} className="w-full h-full">
        <ThreeAvatarsLayout 
          avatars={displayAvatars}
          testId={testId}
          getFontSizeStyle={getFontSizeStyle}
        />
      </div>
    );
  }
  
  // 渲染默认布局
  return (
    <div 
      ref={containerRef}
      className={getContainerClass()}
      data-testid={testId}
    >
      {displayAvatars.map((avatar, index) => renderAvatar(avatar, index))}
    </div>
  );
};

export default ChatListAvatar; 