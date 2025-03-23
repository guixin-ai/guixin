import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLoaderData, useFetcher } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ResourceItem } from '@/types/resource';
import { resourceCommands } from '@/commands/resource.commands';

// 定义加载器返回数据的类型
interface ResourceDetailLoaderData {
  success?: boolean;
  error?: string;
  resource: ResourceItem | null;
}

// 定义删除资源操作返回数据类型
interface DeleteFetcherData {
  success?: boolean;
  error?: string;
}

const ResourceDetailPage = () => {
  const navigate = useNavigate();
  const { resourceId } = useParams<{ resourceId: string }>();
  
  // 使用useLoaderData获取路由加载器提供的数据，使用泛型
  const data = useLoaderData<ResourceDetailLoaderData>();
  
  // 兼容处理，确保能同时处理旧版和新版loader返回的数据
  const resource = data.resource || null;
  const hasError = data.success === false;
  const errorMessage = data.error;

  // 使用fetcher替代直接调用resourceCommands
  const deleteFetcher = useFetcher<DeleteFetcherData>();
  
  // 文本内容状态
  const [textContent, setTextContent] = useState<string>('');
  const [loadingText, setLoadingText] = useState(false);

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
  
  // 加载文本内容
  useEffect(() => {
    const loadTextContent = async () => {
      if (resource?.type === 'text' && resourceId) {
        try {
          setLoadingText(true);
          // 直接调用指令层读取文本内容
          const content = await resourceCommands.readTextResource({ id: resourceId });
          setTextContent(content);
        } catch (error) {
          console.error('读取文本内容失败:', error);
        } finally {
          setLoadingText(false);
        }
      }
    };
    
    if (resource) {
      loadTextContent();
    }
  }, [resource?.type, resourceId, resource]);

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
              {loadingText ? (
                <p className="text-gray-500 dark:text-gray-400">正在加载文本内容...</p>
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