import { invoke } from '@tauri-apps/api/core';

export interface UploadImageResponse {
  url: string;
  file_name: string;
  file_path: string;
}

export const imageService = {
  /**
   * 上传图片到应用资源目录
   * @param file 图片文件
   * @returns 包含图片URL的响应
   */
  async uploadImage(file: File): Promise<UploadImageResponse> {
    try {
      // 读取文件为ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // 调用Tauri命令上传图片
      const response = await invoke<UploadImageResponse>('upload_image', {
        imageData: Array.from(uint8Array),
        file_name: file.name
      });
      
      return response;
    } catch (error) {
      console.error('上传图片失败:', error);
      throw error;
    }
  },

  /**
   * 根据文件名获取图片URL
   * @param fileName 图片文件名
   * @returns 图片的URL
   */
  async getImageUrl(fileName: string): Promise<string> {
    try {
      return await invoke<string>('get_image_url', { file_name: fileName });
    } catch (error) {
      console.error('获取图片URL失败:', error);
      throw error;
    }
  }
}; 