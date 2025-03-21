# 图片上传功能使用说明

本项目实现了在Tauri 2.0应用中从本地文件系统上传图片并在前端显示的功能。

## 功能实现

1. 后端实现了两个主要命令：
   - `upload_image`: 上传图片数据到本地资源目录
   - `get_image_url`: 根据文件名获取图片的URL

2. 图片存储路径
   - 所有上传的图片保存在`$APPDATA/guixin/resources/images/`目录下
   - 文件名使用UUID自动生成，确保唯一性

3. 前端功能
   - 提供了选择本地图片并上传的功能
   - 上传后立即显示图片
   - 可以根据文件名再次获取图片URL

## 使用示例

```tsx
import { invoke } from '@tauri-apps/api/core';

// 上传图片
async function uploadImage(file: File) {
  // 读取文件为二进制数据
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // 调用后端上传命令
  const response = await invoke('upload_image', {
    image_data: Array.from(uint8Array),
    file_name: file.name
  });
  
  return response;
}

// 根据文件名获取图片URL
async function getImageUrl(fileName: string) {
  return await invoke('get_image_url', { file_name: fileName });
}
```

## 前端组件使用方法

已提供一个完整的示例组件`ImageUploadExample.tsx`，直接导入使用即可：

```tsx
import ImageUploadExample from './examples/image-upload-example';

function App() {
  return (
    <div>
      <h1>上传图片示例</h1>
      <ImageUploadExample />
    </div>
  );
}
```

## 注意事项

1. 确保前端已安装`@tauri-apps/api`依赖：
   ```bash
   pnpm add @tauri-apps/api
   ```

2. 在Tauri 2.0中，配置方式有所变化：
   - 不再使用`allowlist`，而是使用新的权限系统（capabilities）
   - 需要在`capabilities/images.json`中定义权限
   - 在`tauri.conf.json`中使用`assetScope`来定义资源访问范围

3. API导入路径有变化：
   - 从`@tauri-apps/api/tauri`改为`@tauri-apps/api/core` 