import React from 'react';

interface ThreeAvatarsLayoutProps {
  /**
   * 三个头像数据
   */
  avatars: string[];
  
  /**
   * 测试ID
   */
  testId?: string;
  
  /**
   * 获取字体大小样式
   */
  getFontSizeStyle: () => { fontSize: string };
}

/**
 * 专门用于显示三个头像的三角形布局组件
 * 一个头像在上，两个头像在下
 */
export const ThreeAvatarsLayout: React.FC<ThreeAvatarsLayoutProps> = ({
  avatars,
  testId = 'three-avatars',
  getFontSizeStyle
}) => {
  // 判断是否为图片URL
  const isImageUrl = (str: string) => {
    return str.startsWith('http://') || 
           str.startsWith('https://') || 
           str.startsWith('/');
  };
  
  return (
    <div className="w-full h-full flex flex-col justify-between gap-0.5">
      {/* 第一行 - 顶部单个头像 */}
      <div className="flex justify-center items-center">
        {avatars[0] && (
          <div className="w-1/2">
            {isImageUrl(avatars[0]) ? (
              <div 
                className="w-full h-0 pt-[100%] relative overflow-hidden"
                style={{ borderRadius: '8%' }}
                data-testid={`${testId}-0-img`}
              >
                <img 
                  src={avatars[0]} 
                  alt="头像" 
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
            ) : (
              <div 
                className="w-full h-0 pt-[100%] relative bg-gradient-to-br from-green-400 to-green-600 overflow-hidden"
                style={{ borderRadius: '8%' }}
                data-testid={`${testId}-0-text`}
              >
                <div 
                  className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white font-semibold"
                  style={getFontSizeStyle()}
                >
                  {avatars[0].charAt(0)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 第二行 - 底部两个头像 */}
      <div className="flex justify-between items-center gap-0.5">
        {/* 左下方头像 */}
        {avatars[1] && (
          <div className="w-1/2">
            {isImageUrl(avatars[1]) ? (
              <div 
                className="w-full h-0 pt-[100%] relative overflow-hidden"
                style={{ borderRadius: '8%' }}
                data-testid={`${testId}-1-img`}
              >
                <img 
                  src={avatars[1]} 
                  alt="头像" 
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
            ) : (
              <div 
                className="w-full h-0 pt-[100%] relative bg-gradient-to-br from-green-400 to-green-600 overflow-hidden"
                style={{ borderRadius: '8%' }}
                data-testid={`${testId}-1-text`}
              >
                <div 
                  className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white font-semibold"
                  style={getFontSizeStyle()}
                >
                  {avatars[1].charAt(0)}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 右下方头像 */}
        {avatars[2] && (
          <div className="w-1/2">
            {isImageUrl(avatars[2]) ? (
              <div 
                className="w-full h-0 pt-[100%] relative overflow-hidden"
                style={{ borderRadius: '8%' }}
                data-testid={`${testId}-2-img`}
              >
                <img 
                  src={avatars[2]} 
                  alt="头像" 
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
            ) : (
              <div 
                className="w-full h-0 pt-[100%] relative bg-gradient-to-br from-green-400 to-green-600 overflow-hidden"
                style={{ borderRadius: '8%' }}
                data-testid={`${testId}-2-text`}
              >
                <div 
                  className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white font-semibold"
                  style={getFontSizeStyle()}
                >
                  {avatars[2].charAt(0)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeAvatarsLayout; 