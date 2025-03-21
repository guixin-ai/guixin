import React, { useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface UploadImageResponse {
  url: string;
  file_name: string;
  file_path: string;
}

const ImageUploadExample: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);

      // 读取文件为 ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      // 转换为 Uint8Array (Tauri需要这种格式)
      const uint8Array = new Uint8Array(arrayBuffer);

      // 调用Tauri上传图片命令
      const response = await invoke<UploadImageResponse>('upload_image', {
        image_data: Array.from(uint8Array),
        file_name: file.name
      });

      // 设置图片URL
      setImageUrl(response.url);
    } catch (err) {
      console.error('上传图片失败:', err);
      setError(typeof err === 'string' ? err : '上传图片失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 通过文件名获取图片URL
  const getImageByName = async () => {
    if (!imageUrl) return;
    
    try {
      setIsLoading(true);
      // 从imageUrl中获取文件名
      const fileName = imageUrl.split('/').pop();
      if (!fileName) throw new Error('无效的图片URL');
      
      // 调用获取图片URL的命令
      const url = await invoke<string>('get_image_url', { file_name: fileName });
      
      // 更新图片URL
      setImageUrl(url);
    } catch (err) {
      console.error('获取图片失败:', err);
      setError(typeof err === 'string' ? err : '获取图片失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">图片上传示例</h2>
      
      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
          disabled={isLoading}
        >
          {isLoading ? '上传中...' : '选择图片'}
        </button>
        
        <button
          onClick={getImageByName}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          disabled={isLoading || !imageUrl}
        >
          根据文件名获取图片
        </button>
      </div>
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      
      {imageUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">上传的图片</h3>
          <img 
            src={imageUrl} 
            alt="上传的图片" 
            className="max-w-md border rounded shadow-md" 
          />
          <p className="mt-2 text-sm text-gray-600">
            图片URL: {imageUrl}
          </p>
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">使用说明</h3>
        <ul className="list-disc list-inside text-sm text-gray-700">
          <li>点击"选择图片"按钮上传一张图片</li>
          <li>图片将保存到应用程序的资源目录中</li>
          <li>上传成功后会显示图片和资源URL</li>
          <li>可以使用"根据文件名获取图片"按钮测试根据文件名获取URL功能</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploadExample; 