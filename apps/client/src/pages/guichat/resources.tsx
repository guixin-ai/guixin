import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, FileText, Image, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useResourceStore, ResourceType } from '../../models/resource.model';
import DelayedLoading from '../../components/delayed-loading';
import { useShallow } from 'zustand/react/shallow';
import { ResourceItem } from '../../models/resource.model';
import { resourceService } from '@/services/resource.service';

const ResourcesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 从URL查询参数中获取资源ID
  const resourceId = searchParams.get('resourceId');

  // 使用状态钩子获取需要的状态和方法
  const { searchResources, resources, initializeList, initializedList, addResource, removeResource } = useResourceStore(
    useShallow(state => ({
      searchResources: state.searchResources,
      resources: state.resources,
      initializeList: state.initializeList,
      initializedList: state.initializedList,
      addResource: state.addResource,
      removeResource: state.removeResource,
    }))
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  // 初始化资源数据
  useEffect(() => {
    const loadResources = async () => {
      try {
        // 先检查模型层的初始化状态
        if (initializedList) {
          // 如果已经初始化，直接使用模型中的数据，不再调用服务
          console.log('资源列表已初始化，跳过服务调用');
          setLoading(false);
          return;
        }

        // 如果未初始化，才调用服务获取数据
        const response = await resourceService.getResources();
        // 调用模型层的初始化方法设置数据和初始化标记
        initializeList(response.resources);
        setLoading(false);
      } catch (error) {
        console.error('加载资源列表失败:', error);
        setLoading(false);
      }
    };

    loadResources();
  }, [initializeList, initializedList]);

  // 处理资源详情
  useEffect(() => {
    if (resourceId && initializedList) {
      const resource = resources.find(r => r.id === resourceId) || null;
      setSelectedResource(resource);
    } else {
      setSelectedResource(null);
    }
  }, [resourceId, resources, initializedList]);

  // 过滤后的资源列表
  const filteredResources = searchQuery ? searchResources(searchQuery) : resources;

  // 查看资源详情
  const handleResourceClick = (resource: ResourceItem) => {
    setSearchParams({ resourceId: resource.id });
  };

  // 关闭资源详情
  const handleCloseResourceDetail = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('resourceId');
    setSearchParams(newParams);
  };

  // 删除资源
  const handleDeleteResource = async (resourceId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      await resourceService.deleteResource(resourceId);
      removeResource(resourceId);
      
      // 如果删除的是当前查看的资源，关闭详情
      if (selectedResource && selectedResource.id === resourceId) {
        handleCloseResourceDetail();
      }
    } catch (error) {
      console.error('删除资源失败:', error);
    }
  };

  // 处理添加图片资源
  const handleAddImageResource = async () => {
    try {
      // 打开文件选择器
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length === 0) return;
        
        const file = files[0];
        
        // 上传图片资源
        const resource = await resourceService.uploadImageResource(
          file,
          file.name.split('.')[0] // 使用文件名作为资源名称
        );
        
        // 添加到状态管理
        addResource(resource);
      };
      
      input.click();
    } catch (error) {
      console.error('添加图片资源失败:', error);
    }
  };

  // 处理添加文本资源
  const handleAddTextResource = async () => {
    // 这里简化处理，实际应用中可能需要一个表单页面
    try {
      const name = prompt('请输入文本资源名称:');
      if (!name) return;
      
      const content = prompt('请输入文本内容:');
      if (!content) return;
      
      // 上传文本资源
      const resource = await resourceService.uploadTextResource(
        content,
        name
      );
      
      // 添加到状态管理
      addResource(resource);
    } catch (error) {
      console.error('添加文本资源失败:', error);
    }
  };

  // 资源类型图标组件
  const ResourceTypeIcon = ({ type }: { type: ResourceType }) => {
    switch (type) {
      case ResourceType.TEXT:
        return <FileText size={16} className="text-blue-500" />;
      case ResourceType.IMAGE:
        return <Image size={16} className="text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <DelayedLoading loading={loading}>
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

        {/* 资源列表和详情 */}
        <div className="flex-1 overflow-hidden flex">
          {/* 资源列表 */}
          <div className={`${selectedResource ? 'w-1/2' : 'w-full'} overflow-y-auto bg-white dark:bg-gray-800`}>
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
                  
                  {/* 操作按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-red-500"
                    onClick={(e) => handleDeleteResource(resource.id, e)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                {initializedList ? '没有找到资源' : '正在加载资源...'}
              </div>
            )}
          </div>
          
          {/* 资源详情 */}
          {selectedResource && (
            <div className="w-1/2 overflow-y-auto border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {selectedResource.name}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={handleCloseResourceDetail}>
                    关闭
                  </Button>
                </div>
                
                {/* 资源详情内容 */}
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {selectedResource.description || '无描述'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    文件名: {selectedResource.fileName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    创建时间: {new Date(selectedResource.createdAt).toLocaleString()}
                  </p>
                </div>
                
                {/* 根据资源类型显示不同内容 */}
                {selectedResource.type === ResourceType.IMAGE && (
                  <div className="mt-4">
                    <img 
                      src={selectedResource.url} 
                      alt={selectedResource.name}
                      className="max-w-full rounded-lg"
                    />
                  </div>
                )}
                
                {selectedResource.type === ResourceType.TEXT && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {/* 这里应该显示文本内容，示例中只显示URL */}
                      {selectedResource.url}
                    </p>
                  </div>
                )}
                
                {/* 操作按钮 */}
                <div className="mt-6 flex justify-end">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteResource(selectedResource.id)}
                  >
                    <Trash2 size={16} className="mr-2" />
                    删除资源
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DelayedLoading>
  );
};

export default ResourcesPage; 