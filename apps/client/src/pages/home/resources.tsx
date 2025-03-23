import { useState } from 'react';
import { useNavigate, useLoaderData, useFetcher } from 'react-router-dom';
import { Search, Plus, FileText, Image, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { ResourceItem, ResourceType } from '@/types/resource';

// 定义加载器返回数据的类型
interface ResourceLoaderData {
  success?: boolean;
  error?: string;
  resources: ResourceItem[];
}

// 定义删除资源操作返回数据类型
interface DeleteFetcherData {
  success?: boolean;
  error?: string;
}

// 定义上传资源操作返回数据类型
interface UploadFetcherData {
  success?: boolean;
  error?: string;
  resource?: ResourceItem;
}

const ResourcesPage = () => {
  const navigate = useNavigate();
  
  // 使用useLoaderData获取路由加载器提供的数据，使用泛型而不是类型断言
  const data = useLoaderData<ResourceLoaderData>();
  
  // 兼容处理，确保能同时处理旧版和新版loader返回的数据
  const resources = data.resources || [];
  const hasError = data.success === false;
  const errorMessage = data.error;

  // 创建独立的fetcher实例处理数据操作
  const deleteFetcher = useFetcher<DeleteFetcherData>();
  const uploadFetcher = useFetcher<UploadFetcherData>();

  const [searchQuery, setSearchQuery] = useState('');

  // 搜索资源的函数
  const searchResources = (query: string): ResourceItem[] => {
    if (!query) return resources;
    
    return resources.filter(resource => 
      resource.name.toLowerCase().includes(query.toLowerCase()) ||
      (resource.description && resource.description.toLowerCase().includes(query.toLowerCase()))
    );
  };

  // 过滤后的资源列表
  const filteredResources = searchQuery ? searchResources(searchQuery) : resources;

  // 查看资源详情 - 跳转到详情页
  const handleResourceClick = (resource: ResourceItem) => {
    navigate(`/resources/${resource.id}`);
  };

  // 删除资源 - 使用fetcher代替直接调用commands
  const handleDeleteResource = (resourceId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    // 使用fetcher提交删除请求
    deleteFetcher.submit(
      { id: resourceId },
      { method: "delete", action: "/api/resources/delete" }
    );
  };

  // 处理添加图片资源 - 使用fetcher代替直接调用commands
  const handleAddImageResource = () => {
    // 打开文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      const file = files[0];
      
      // 创建FormData对象
      const formData = new FormData();
      formData.append("image", file);
      formData.append("name", file.name.split('.')[0]);
      formData.append("file_name", file.name);
      
      // 使用fetcher提交表单数据
      uploadFetcher.submit(formData, {
        method: "post",
        action: "/api/resources/upload-image",
        encType: "multipart/form-data"
      });
    };
    
    input.click();
  };

  // 处理添加文本资源
  const handleAddTextResource = () => {
    // 跳转到文本资源添加页面
    navigate('/resources/new-text');
  };

  // 资源类型图标组件
  const ResourceTypeIcon = ({ type }: { type: ResourceType }) => {
    switch (type) {
      case 'text':
        return <FileText size={16} className="text-blue-500" />;
      case 'image':
        return <Image size={16} className="text-green-500" />;
      default:
        return null;
    }
  };

  // 判断是否有fetcher正在提交
  const isLoading = deleteFetcher.state === "submitting" || uploadFetcher.state === "submitting";

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">资源库</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
              <Plus size={24} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleAddTextResource}>
              <FileText size={16} className="mr-2 text-blue-500" />
              <span>添加文本</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddImageResource}>
              <Image size={16} className="mr-2 text-green-500" />
              <span>添加图片</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 错误提示 */}
      {hasError && (
        <div className="mx-4 p-3 mb-2 bg-destructive/15 text-destructive rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2" />
          <span>{errorMessage || '加载资源列表失败'}</span>
        </div>
      )}

      {/* 搜索栏 */}
      <div className="px-4 pb-2 bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="搜索资源"
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 资源列表 */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
        {filteredResources.length > 0 ? (
          filteredResources.map(resource => (
            <div
              key={resource.id}
              className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 flex items-center"
              onClick={() => handleResourceClick(resource)}
            >
              {/* 资源类型图标 */}
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                <ResourceTypeIcon type={resource.type} />
              </div>
              
              {/* 资源信息 */}
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-800 dark:text-white">{resource.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {resource.description || resource.fileName}
                </div>
              </div>
              
              {/* 操作按钮 - 使用fetcher状态显示按钮状态 */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-red-500"
                onClick={(e) => handleDeleteResource(resource.id, e)}
                disabled={deleteFetcher.state === "submitting" && 
                          deleteFetcher.formData?.get('id') === resource.id}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {isLoading ? '正在处理...' : (hasError ? '加载失败' : '没有找到资源')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage; 