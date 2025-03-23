import { useEffect } from 'react';
import { useNavigate, useParams, useLoaderData, useFetcher } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ResourceItem } from '@/types/resource';
import { ResourceDetailLoaderData } from '@/loaders/resource-detail.loader';

// 定义删除资源操作返回数据类型
interface DeleteFetcherData {
  success?: boolean;
  error?: string;
}

const ResourceDetailPage = () => {
  const navigate = useNavigate();
  const { resourceId } = useParams<{ resourceId: string }>();
  
  // 使用useLoaderData获取路由加载器提供的数据
  const data = useLoaderData<ResourceDetailLoaderData>();
  
  // 提取共同属性
  const resource = data.resource;
  const hasError = data.success === false;
  const errorMessage = hasError ? data.error : undefined;
  
  // 判断是否有文本内容错误
  const hasTextError = data.success === true && 'textError' in data;
  const textError = hasTextError ? data.textError : undefined;
  
  // 获取文本内容（如果有）
  const textContent = data.success === true && 'textContent' in data ? data.textContent || '' : '';

  // 使用fetcher替代直接调用resourceCommands
  const deleteFetcher = useFetcher<DeleteFetcherData>();

  // 返回资源列表
  const handleBackToList = () => {
    navigate('/home/resources');
  };

  // 删除资源 - 使用fetcher代替直接调用
  const handleDeleteResource = () => {
    if (!resourceId) return;
    
    // 使用fetcher提交删除请求
    deleteFetcher.submit(
      { id: resourceId },
      { method: "delete", action: "/api/resources/delete" }
    );
  };
  
  // 监听fetcher状态，成功时跳转
  useEffect(() => {
    if (deleteFetcher.state === "idle" && deleteFetcher.data?.success) {
      navigate('/home/resources', { replace: true });
    }
  }, [deleteFetcher.state, deleteFetcher.data, navigate]);

  // 如果出现错误，显示错误信息
  if (hasError) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBackToList}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">资源详情</h1>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="p-6 max-w-md bg-destructive/15 text-destructive rounded-lg">
            <div className="flex items-center mb-4">
              <AlertCircle size={24} className="mr-2" />
              <h2 className="text-lg font-medium">加载资源失败</h2>
            </div>
            <p className="mb-4">{errorMessage || '无法加载资源详情'}</p>
            <Button onClick={handleBackToList}>返回资源列表</Button>
          </div>
        </div>
      </div>
    );
  }

  // 如果没有资源数据，显示加载中
  if (!resource) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBackToList}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">资源详情</h1>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">资源信息加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 头部导航栏 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 flex items-center">
        <Button variant="ghost" size="icon" onClick={handleBackToList}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold ml-2">{resource.name}</h1>
      </div>
      
      {/* 资源详情内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            资源信息
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {resource.description || '无描述'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              文件名: {resource.fileName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              创建时间: {new Date(resource.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* 资源内容展示 */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            资源内容
          </h2>
          
          {resource.type === 'image' && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <img 
                src={resource.url} 
                alt={resource.name}
                className="max-w-full rounded"
              />
            </div>
          )}
          
          {resource.type === 'text' && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {hasTextError ? (
                <div className="p-3 bg-destructive/15 text-destructive rounded-md">
                  <div className="flex items-center mb-2">
                    <AlertCircle size={18} className="mr-2" />
                    <span className="font-medium">文本内容加载失败</span>
                  </div>
                  <p>{textError}</p>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {textContent || '无内容'}
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="mt-8">
          <Button 
            variant="destructive" 
            onClick={handleDeleteResource}
            className="w-full"
            disabled={deleteFetcher.state === "submitting"}
          >
            <Trash2 size={16} className="mr-2" />
            {deleteFetcher.state === "submitting" ? "删除中..." : "删除资源"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailPage; 