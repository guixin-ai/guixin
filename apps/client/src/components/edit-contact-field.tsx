import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useContactStore } from '../models/contact.model';
import { ContactDetail } from '@/types/contact';
import { useShallow } from 'zustand/react/shallow';
import DelayedLoading from './delayed-loading';

interface EditContactFieldProps {
  contactId: string;
  field: keyof ContactDetail;
  onBack: () => void;
  onSaved?: () => void;
}

const EditContactFieldComponent = ({ contactId, field, onBack, onSaved }: EditContactFieldProps) => {
  // 使用 useShallow 和选择器获取需要的状态和方法
  const { contactDetails, initializeContactDetail, updateContactDetail } = useContactStore(
    useShallow(state => ({
      contactDetails: state.contactDetails,
      initializeContactDetail: state.initializeContactDetail,
      updateContactDetail: state.updateContactDetail
    }))
  );
  
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 加载联系人数据
  useEffect(() => {
    if (contactId) {
      const loadContactData = async () => {
        setLoading(true);
        
        try {
          await initializeContactDetail(contactId);
          const contact = contactDetails[contactId];
          
          if (contact && field in contact) {
            setValue(contact[field]?.toString() || '');
          }
          
          setLoading(false);
        } catch (error) {
          console.error('加载联系人详情失败:', error);
          setLoading(false);
        }
      };
      
      loadContactData();
    }
  }, [contactId, field, contactDetails, initializeContactDetail]);
  
  // 保存更改
  const handleSave = async () => {
    if (contactId) {
      try {
        await updateContactDetail(contactId, { 
          [field]: value 
        } as Partial<ContactDetail>);
        
        if (onSaved) {
          onSaved();
        } else {
          onBack();
        }
      } catch (error) {
        console.error('更新联系人字段失败:', error);
      }
    }
  };
  
  // 获取字段标签
  const getFieldLabel = (fieldName: keyof ContactDetail): string => {
    const labels: Record<string, string> = {
      name: '名称',
      description: '设定描述'
    };
    
    return labels[fieldName] || fieldName.toString();
  };
  
  return (
    <DelayedLoading loading={loading}>
      <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white"
            onClick={onBack}
          >
            <ArrowLeft size={18} className="mr-1" />
            取消
          </Button>
          
          <h1 className="text-md font-medium text-white">
            编辑{getFieldLabel(field)}
          </h1>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-500"
            onClick={handleSave}
          >
            保存
          </Button>
        </div>
        
        {/* 编辑内容 */}
        <div className="flex-1 p-4 bg-black">
          {field === 'description' ? (
            <textarea
              className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white resize-none h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`请输入${getFieldLabel(field)}`}
            />
          ) : (
            <input
              className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`请输入${getFieldLabel(field)}`}
            />
          )}
        </div>
      </div>
    </DelayedLoading>
  );
};

export default EditContactFieldComponent; 