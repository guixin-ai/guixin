import { useState } from 'react';
import { useNavigate, useLoaderData, useRevalidator } from 'react-router-dom';
import { Search, Plus, FileText, Image, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import DelayedLoading from '../../components/delayed-loading';
import { resourceCommands } from '@/commands/resource.commands';
import { ResourceItem, ResourceType } from '@/types/resource';

// 定义加载器返回数据的类型
interface ResourceLoaderData {
  resources: ResourceItem[];
}

const ResourcesPage = () => {
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();
  
  // 使用useLoaderData获取路由加载器提供的数据，使用泛型而不是类型断言
  const { resources = [] } = useLoaderData<ResourceLoaderData>();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

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

  // 删除资源
  const handleDeleteResource = async (resourceId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      setLoading(true);
      // 直接调用指令层删除资源
      await resourceCommands.deleteResource({ id: resourceId });
      
      // 刷新loader数据而不是跳转页面
      revalidate();
    } catch (error) {
      console.error('删除资源失败:', error);
    } finally {
      setLoading(false);
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
        setLoading(true);
        
        try {
          // 读取文件为ArrayBuffer
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // 直接调用指令层上传图片
          await resourceCommands.uploadCurrentUserImage({
            imageData: Array.from(uint8Array),
            name: file.name.split('.')[0], // 使用文件名作为资源名称
            file_name: file.name
          });
          
          // 刷新loader数据而不是跳转页面
          revalidate();
        } catch (error) {
          console.error('添加图片资源失败:', error);
        } finally {
          setLoading(false);
        }
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
      
      setLoading(true);
      
      try {
        // 直接调用指令层上传文本
        await resourceCommands.uploadCurrentUserText({
          content,
          name
        });
        
        // 刷新loader数据而不是跳转页面
        revalidate();
      } catch (error) {
        console.error('添加文本资源失败:', error);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('添加文本资源失败:', error);
    }
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
              {loading ? '正在加载资源...' : '没有找到资源'}
            </div>
          )}
        </div>
      </div>
    </DelayedLoading>
  );
};

export default ResourcesPage; 