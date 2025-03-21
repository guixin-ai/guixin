import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useContactStore } from '../models/contact.model';
import { ContactDetail } from '@/types/contact';
import {
  ContactNotFoundException,
  ContactDetailInitFailedException,
} from '@/errors/contact.errors';
import { useShallow } from 'zustand/react/shallow';
import EditContactFieldComponent from './edit-contact-field';
import DelayedLoading from './delayed-loading';
import { contactService } from '@/services/contact.service';

interface ContactDetailProps {
  contactId: string;
  onBack: () => void;
}

const ContactDetailComponent = ({ contactId, onBack }: ContactDetailProps) => {
  // 使用 useShallow 和选择器获取需要的状态和方法
  const { initializeContactDetail, contactDetails, initializedDetailIds } = useContactStore(
    useShallow(state => ({
      initializeContactDetail: state.initializeContactDetail,
      contactDetails: state.contactDetails,
      initializedDetailIds: state.initializedDetailIds,
    }))
  );
  const [loading, setLoading] = useState(true);

  // 添加编辑状态
  const [editMode, setEditMode] = useState(false);
  const [editField, setEditField] = useState<keyof ContactDetail | null>(null);

  // 加载联系人数据
  useEffect(() => {
    if (contactId) {
      const loadContactData = async () => {
        setLoading(true);

        try {
          // 检查联系人详情是否已经初始化
          if (!initializedDetailIds[contactId]) {
            // 如果未初始化，调用服务获取联系人详情
            const response = await contactService.getContactDetail(contactId);
            if (!response) {
              throw new ContactNotFoundException(contactId);
            }

            // 调用同步的初始化方法设置详情
            initializeContactDetail(contactId, response.contact);
          }

          setLoading(false);
        } catch (error) {
          console.error('加载联系人详情失败:', error);
          if (error instanceof ContactNotFoundException) {
            console.error(`联系人未找到: ${error.message}`);
          } else if (error instanceof ContactDetailInitFailedException) {
            console.error(`联系人详情初始化失败: ${error.message}`);
          }
          setLoading(false);
        }
      };

      loadContactData();
    }
  }, [contactId, initializeContactDetail, initializedDetailIds]);

  // 获取联系人详情
  const contact = contactId ? contactDetails[contactId] || null : null;

  // 编辑字段
  const handleEditField = (field: keyof ContactDetail) => {
    if (field === 'avatar') return; // 头像暂不支持编辑
    setEditField(field);
    setEditMode(true);
  };

  // 关闭编辑模式
  const handleCloseEdit = () => {
    setEditMode(false);
    setEditField(null);
  };

  // 保存编辑成功后的回调
  const handleEditSaved = () => {
    setEditMode(false);
    setEditField(null);
  };

  // 如果联系人数据为空（非加载中状态）
  if (!loading && !contact) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
        <p className="text-gray-400">联系人不存在</p>
      </div>
    );
  }

  // 使用 DelayedLoading 组件包裹主要内容
  return (
    <>
      <DelayedLoading loading={loading}>
        <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
          {/* 头部 */}
          <div className="flex items-center p-4 border-b border-gray-800">
            <Button variant="ghost" size="icon" className="text-white mr-2" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>

            <h1 className="text-lg font-medium text-white flex-1 text-center">个人资料</h1>
          </div>

          {/* 联系人资料列表 */}
          {contact && (
            <div className="flex-1">
              {/* 头像项 */}
              <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <span className="text-white">头像</span>
                <div className="h-14 w-14 rounded overflow-hidden">
                  {contact.avatar &&
                    (typeof contact.avatar === 'string' && contact.avatar.length <= 2 ? (
                      <div className="w-full h-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xl font-semibold">
                        {contact.avatar}
                      </div>
                    ) : (
                      <img
                        src={typeof contact.avatar === 'string' ? contact.avatar : ''}
                        alt={contact.name}
                        className="w-full h-full object-cover"
                      />
                    ))}
                </div>
              </div>

              {/* 名称项 */}
              <div
                className="flex justify-between items-center p-4 border-b border-gray-800"
                onClick={() => handleEditField('name')}
              >
                <span className="text-white">名字</span>
                <div className="flex items-center">
                  <span className="text-white mr-2">{contact.name}</span>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </div>

              {/* 设定描述项 */}
              <div
                className="flex justify-between items-center p-4 border-b border-gray-800"
                onClick={() => handleEditField('description')}
              >
                <span className="text-white">设定描述</span>
                <div className="flex items-center">
                  <span className="text-white mr-2">{contact.description || '添加设定描述'}</span>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </DelayedLoading>
      {/* 如果处于编辑模式，则渲染编辑组件 */}
      {editMode && editField && (
        <EditContactFieldComponent
          contactId={contactId}
          field={editField}
          onBack={handleCloseEdit}
          onSaved={handleEditSaved}
        />
      )}
    </>
  );
};

export default ContactDetailComponent;
