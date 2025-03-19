import React, { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

export interface ContactItemProps {
  id: string;
  name: string;
  avatar: string;
  description?: string;
  isSelected: boolean;
  isInGroup?: boolean;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export const ContactItem: React.FC<ContactItemProps> = ({
  id,
  name,
  avatar,
  description,
  isSelected,
  isInGroup = false,
  onSelect,
  onDelete,
  isDeleting = false,
}) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            onClick={() => onSelect(id)}
            className={`flex items-center p-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 ${
              isInGroup ? 'pl-6' : ''
            } ${isSelected ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
          >
            <div
              className={`${isInGroup ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl mr-3 shadow-sm`}
            >
              {avatar}
            </div>
            <div className="flex-1">
              <div className="font-medium dark:text-white">{name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {description || '无描述'}
              </div>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            variant="destructive"
            onClick={() => setIsAlertOpen(true)}
            disabled={isDeleting}
          >
            {isDeleting ? '删除中...' : '删除'}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除联系人</AlertDialogTitle>
            <AlertDialogDescription>
              删除{name}后，将同时删除与该联系人的聊天记录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete && onDelete(id);
                setIsAlertOpen(false);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ContactItem;
