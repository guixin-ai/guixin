import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createPortal } from 'react-dom';
import { ChatContact } from '../..';
import { COMMAND_PRIORITY_HIGH } from 'lexical';
import {
  SHOW_MENTIONS_COMMAND,
  SELECT_MENTION_COMMAND,
  CANCEL_MENTIONS_COMMAND,
  MENTION_POSITION_UPDATE_COMMAND,
  MENTION_FILTER_UPDATE_COMMAND,
  SELECT_HIGHLIGHTED_MENTION_COMMAND,
} from '../../commands';
import { MentionList } from '../../components/mention-list';
import { MOVE_MENTION_SELECTION_COMMAND } from './mention-dropdown-keyboard.plugin';

interface MentionDisplayPluginProps {
  contacts: ChatContact[];
  onSelectMention?: (contact: ChatContact) => void;
}

/**
 * 提及显示插件
 * 负责：
 * 1. 监听显示提及命令并显示联系人列表
 * 2. 监听取消命令并隐藏列表
 * 3. 处理联系人选择
 * 4. 创建和管理列表的DOM渲染
 * 5. 响应键盘导航命令并更新选中项
 */
export function MentionDisplayPlugin({ contacts }: MentionDisplayPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [searchText, setSearchText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [filteredContacts, setFilteredContacts] = useState<ChatContact[]>(contacts);

  // 处理联系人选择
  const handleSelectContact = useCallback(
    (contact: ChatContact) => {
      // 分发选择联系人命令
      editor.dispatchCommand(SELECT_MENTION_COMMAND, contact);

      // 关闭下拉列表
      setDropdownOpen(false);
    },
    [editor]
  );

  // 处理选择项移动
  const handleMoveSelection = useCallback(
    (direction: 'up' | 'down') => {
      if (filteredContacts.length === 0) return;

      setSelectedIndex(prevIndex => {
        if (direction === 'up') {
          return prevIndex > 0 ? prevIndex - 1 : filteredContacts.length - 1;
        } else {
          return prevIndex < filteredContacts.length - 1 ? prevIndex + 1 : 0;
        }
      });
    },
    [filteredContacts.length]
  );

  // 选择当前高亮的联系人
  const selectHighlightedContact = useCallback(() => {
    if (
      dropdownOpen &&
      filteredContacts.length > 0 &&
      selectedIndex >= 0 &&
      selectedIndex < filteredContacts.length
    ) {
      handleSelectContact(filteredContacts[selectedIndex]);
    }
  }, [dropdownOpen, filteredContacts, selectedIndex, handleSelectContact]);

  // 监听显示提及命令、取消命令和内容更新命令
  useEffect(() => {
    if (!editor) return;

    // 监听显示提及命令 - 从MentionTriggerPlugin触发
    const removeShowListener = editor.registerCommand(
      SHOW_MENTIONS_COMMAND,
      () => {
        // 初始化搜索文本和选中项
        setSearchText('');
        setSelectedIndex(0);
        setFilteredContacts(contacts);

        // 显示下拉列表
        setDropdownOpen(true);
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );

    // 监听位置更新命令 - 从MentionPositionPlugin触发
    const removePositionUpdateListener = editor.registerCommand(
      MENTION_POSITION_UPDATE_COMMAND,
      payload => {
        if (payload && typeof payload === 'object' && 'position' in payload) {
          setPosition(payload.position);
        }
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );

    // 监听过滤更新命令 - 从MentionFilterPlugin触发
    const removeFilterUpdateListener = editor.registerCommand(
      MENTION_FILTER_UPDATE_COMMAND,
      payload => {
        if (
          payload &&
          typeof payload === 'object' &&
          'searchText' in payload &&
          'filteredContacts' in payload
        ) {
          setSearchText(payload.searchText);
          setFilteredContacts(payload.filteredContacts);

          // 重置选中项
          setSelectedIndex(0);
        }
        return false; // 不阻止其他插件处理
      },
      COMMAND_PRIORITY_HIGH
    );

    // 监听取消提及命令 - 从MentionCancellationPlugin触发
    const removeCancelListener = editor.registerCommand(
      CANCEL_MENTIONS_COMMAND,
      () => {
        // 关闭下拉列表
        setDropdownOpen(false);
        return true; // 阻止其他处理，确保命令被消费
      },
      COMMAND_PRIORITY_HIGH // 提高优先级，确保命令被正确处理
    );

    // 选择联系人处理
    const removeSelectListener = editor.registerCommand(
      SELECT_MENTION_COMMAND,
      (contact: ChatContact) => {
        handleSelectContact(contact);
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    // 处理选择移动命令 - 从MentionKeyboardPlugin触发
    const removeMoveSelectionListener = editor.registerCommand(
      MOVE_MENTION_SELECTION_COMMAND,
      (direction: 'up' | 'down') => {
        handleMoveSelection(direction);
        return true; // 阻止其他处理，确保命令被消费
      },
      COMMAND_PRIORITY_HIGH
    );

    // 监听选择高亮提及命令 - 从MentionKeyboardPlugin触发
    const removeSelectHighlightedListener = editor.registerCommand(
      SELECT_HIGHLIGHTED_MENTION_COMMAND,
      () => {
        if (dropdownOpen && filteredContacts.length > 0) {
          // 选择当前高亮的联系人
          selectHighlightedContact();
          return true; // 阻止其他处理，确保命令被消费
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      removeShowListener();
      removePositionUpdateListener();
      removeFilterUpdateListener();
      removeCancelListener();
      removeSelectListener();
      removeMoveSelectionListener();
      removeSelectHighlightedListener();
    };
  }, [
    editor,
    handleSelectContact,
    contacts,
    handleMoveSelection,
    dropdownOpen,
    filteredContacts.length,
    selectHighlightedContact,
  ]);

  // 选中索引边界检查
  useEffect(() => {
    if (filteredContacts.length > 0) {
      // 确保选中索引不超出范围
      if (selectedIndex >= filteredContacts.length) {
        setSelectedIndex(filteredContacts.length - 1);
      }
    }
  }, [filteredContacts, selectedIndex]);

  return dropdownOpen
    ? createPortal(
        <div
          className="mention-list-portal"
          style={{
            position: 'fixed',
            left: `${position.left}px`,
            top: `${position.top}px`,
            zIndex: 9999,
            transformOrigin: 'top left',
            maxWidth: '90vw',
          }}
        >
          <MentionList
            contacts={filteredContacts}
            searchText={searchText}
            selectedIndex={selectedIndex}
            onSelectContact={handleSelectContact}
          />
        </div>,
        document.body
      )
    : null;
}
