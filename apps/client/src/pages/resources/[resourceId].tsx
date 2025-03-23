import { useNavigate, useParams, useLoaderData, useRevalidator } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ResourceItem } from '@/types/resource';
import { resourceService } from '@/services/resource.service';

// 定义加载器返回数据的类型
interface ResourceDetailLoaderData {
  resource: ResourceItem;
}

const ResourceDetailPage = () => {
  const navigate = useNavigate();
  const { resourceId } = useParams<{ resourceId: string }>();
  const { revalidate } = useRevalidator();
  
  // 使用useLoaderData获取路由加载器提供的数据，使用泛型
  const { resource } = useLoaderData<ResourceDetailLoaderData>();

  // 返回资源列表
  const handleBackToList = () => {
    navigate('/home/resources');
  };

  // 删除资源
  const handleDeleteResource = async () => {
    if (!resourceId) return;
    
    try {
      await resourceService.deleteResource(resourceId);
      
      // 删除后返回列表页
      navigate('/home/resources', { replace: true });
    } catch (error) {
      console.error('删除资源失败:', error);
    }
  };

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
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {/* 这里应该显示文本内容，示例中只显示URL */}
                {resource.url}
              </p>
            </div>
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="mt-8">
          <Button 
            variant="destructive" 
            onClick={handleDeleteResource}
            className="w-full"
          >
            <Trash2 size={16} className="mr-2" />
            删除资源
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailPage; 