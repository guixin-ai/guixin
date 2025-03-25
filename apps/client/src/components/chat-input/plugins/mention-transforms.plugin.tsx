import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  TextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  $createTextNode,
  $setSelection,
  $createRangeSelection,
} from 'lexical';
import { SELECT_MENTION_COMMAND } from '../commands';
import { $createMentionNodeWithZeroWidthSpaces, $isMentionNode } from '../nodes';
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
          
          // 创建提及节点（现在只会创建节点本身，不处理前后文本节点）
          const mentionNode = $createMentionNodeWithZeroWidthSpaces(
            contact.name,
            contact.id,
            anchorNode,
            lastAtPos,
            cursorOffset
          );
          
          // 检查提及节点前面是否有文本节点
          const prevNode = mentionNode.getPreviousSibling();
          const nextNode = mentionNode.getNextSibling();
          
          // 如果前面没有文本节点，或者前面的文本节点是空的，添加零宽字符节点
          if (!prevNode || !(prevNode instanceof TextNode) || prevNode.getTextContent() === '') {
            logger.debug('提及节点前没有文本节点，添加零宽字符节点');
            const beforeZWSNode = $createTextNode('\u200B');
            
            if (!prevNode) {
              // 如果没有前置节点，将零宽字符插入到提及节点前
              mentionNode.insertBefore(beforeZWSNode);
            } else if (!(prevNode instanceof TextNode)) {
              // 如果前置节点不是文本节点，在它后面插入零宽字符
              prevNode.insertAfter(beforeZWSNode);
              // 然后移动提及节点到零宽字符节点后
              beforeZWSNode.insertAfter(mentionNode);
            }
          }
          
          // 检查提及节点后面是否有文本节点
          // 如果没有，或文本不是以空格开头，添加一个包含空格的文本节点
          if (!nextNode) {
            logger.debug('提及节点后没有文本节点，添加空格节点');
            const afterSpaceNode = $createTextNode(' ');
            mentionNode.insertAfter(afterSpaceNode);
            
            // 设置光标位置在空格后
            const selection = $createRangeSelection();
            selection.anchor.set(afterSpaceNode.getKey(), 1, 'text');
            selection.focus.set(afterSpaceNode.getKey(), 1, 'text');
            $setSelection(selection);
          } else if (nextNode instanceof TextNode) {
            const nextNodeText = nextNode.getTextContent();
            
            // 如果后面的文本节点不是以空格开头，添加空格
            if (nextNodeText.length > 0 && nextNodeText[0] !== ' ') {
              nextNode.setTextContent(' ' + nextNodeText);
            } else if (nextNodeText.length === 0) {
              // 如果后面的文本节点是空的，设置为空格
              nextNode.setTextContent(' ');
            }
            
            // 设置光标位置在空格后
            const selection = $createRangeSelection();
            selection.anchor.set(nextNode.getKey(), 1, 'text');
            selection.focus.set(nextNode.getKey(), 1, 'text');
            $setSelection(selection);
          }
          
          logger.info('提及节点创建完成，并确保了前后文本节点');
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
