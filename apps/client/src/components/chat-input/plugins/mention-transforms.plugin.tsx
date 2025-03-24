import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  TextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { SELECT_MENTION_COMMAND } from '../commands';
import { $createMentionNodeWithZeroWidthSpaces } from '../nodes';
import { ChatContact } from '..';
import { createLogger } from '../utils/logger';

// 创建日志记录器
const logger = createLogger('提及转换');

/**
 * 提及转换插件
 * 负责将选择的联系人转换为提及节点
 * 
 * 提及节点的标准结构：
 * [文本节点(零宽空格)] [提及节点] [文本节点(零宽空格+空格)]
 * 
 * 在提及节点前后都添加零宽空格，确保光标可以正确定位
 */
export function MentionTransformsPlugin({ contacts }: { contacts: ChatContact[] }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;

    // 监听选择联系人命令
    const removeSelectMentionListener = editor.registerCommand(
      SELECT_MENTION_COMMAND,
      (contact: ChatContact) => {
        logger.info('收到提及选择命令:', contact.name);
        
        // 在编辑器中插入提及节点
        editor.update(() => {
          const selection = $getSelection();
          
          if (!$isRangeSelection(selection)) {
            logger.warn('无效的选择类型，无法创建提及节点');
            return;
          }
          
          const anchor = selection.anchor;
          const anchorNode = anchor.getNode();
          
          // 确保我们在文本节点中
          if (!(anchorNode instanceof TextNode)) {
            logger.warn('不在文本节点中，无法创建提及节点');
            return;
          }
          
          // 获取当前节点内容
          const textContent = anchorNode.getTextContent();
          const nodeKey = anchorNode.getKey();
          const cursorOffset = anchor.offset;
          
          logger.debug('当前节点和光标信息:', {
            nodeKey,
            textContent,
            cursorOffset
          });
          
          // 查找@符号位置 - 必须在连续的文本节点中
          // 在当前文本节点中从光标位置向前查找@符号
          // 如果遇到非文本节点则立即停止查找
          const lastAtPos = textContent.lastIndexOf('@', cursorOffset - 1);
          
          if (lastAtPos === -1) {
            logger.warn('未找到@符号，无法创建提及节点');
            return;
          }
          
          logger.debug('找到@符号位置:', {
            lastAtPos,
            textAfterAt: textContent.substring(lastAtPos, cursorOffset)
          });
          
          // 使用封装的方法创建标准提及节点结构
          // 这个方法会自动创建:
          // 1. 前文本节点：仅包含一个零宽空格
          // 2. 提及节点：包含联系人信息
          // 3. 后文本节点：零宽空格+空格字符
          $createMentionNodeWithZeroWidthSpaces(
            contact.name,
            contact.id,
            anchorNode,
            lastAtPos,
            cursorOffset
          );
          
          logger.info('提及节点创建完成');
        });

        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    logger.debug('提及转换插件已初始化');

    return () => {
      removeSelectMentionListener();
      logger.debug('提及转换插件已销毁');
    };
  }, [editor, contacts]);

  return null;
}
