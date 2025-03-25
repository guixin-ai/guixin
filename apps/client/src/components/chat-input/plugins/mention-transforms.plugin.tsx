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
  $isParagraphNode,
  ParagraphNode
} from 'lexical';
import { SELECT_MENTION_COMMAND } from '../commands';
import { $createMentionNode, $isMentionNode } from '../nodes';
import { ChatContact } from '..';
import { createLogger } from '../utils/logger';

// 创建日志记录器
const logger = createLogger('提及转换');

/**
 * 提及转换插件
 * 负责将选择的联系人转换为提及节点
 * 
 * 提及节点的标准结构：
 * [文本节点(零宽空格)] [提及节点] [文本节点(空格+其他内容)]
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
          
          // 创建提及节点
          const mentionNode = $createMentionNode(
            contact.name,
            contact.id
          );
          
          // 分割文本，保留@符号前的内容
          const textBeforeAt = textContent.substring(0, lastAtPos);
          const remainingText = textContent.substring(cursorOffset);
          
          // 处理前文本节点
          anchorNode.setTextContent(textBeforeAt);
          
          // 插入提及节点
          anchorNode.insertAfter(mentionNode);
          
          // 检查提及节点前面是否有文本节点
          const prevNode = mentionNode.getPreviousSibling();
          const nextNode = mentionNode.getNextSibling();

          logger.debug('提及节点前后的节点:', {
            prevNode,
            nextNode
          });
          
          // 前置节点处理
          // 判断当前节点是否在段落开始位置
          let isAtParagraphStart = false;
          const parentNode = mentionNode.getParent();
          
          if (parentNode && $isParagraphNode(parentNode)) {
            const firstChild = parentNode.getFirstChild();
            
            // 检查提及节点是否是段落的第一个子节点，或者其前置节点是空文本节点
            if (firstChild === mentionNode || 
                (prevNode instanceof TextNode && prevNode.getTextContent() === '')) {
              isAtParagraphStart = true;
              logger.debug('提及节点位于段落开始位置');
            }
          }
          
          // 简化判断，只检查前面是否有节点
          if (!prevNode || isAtParagraphStart) {
            // 如果前面没有节点或在段落开始位置，创建零宽字符节点
            logger.debug('提及节点前没有节点或在段落开始位置，创建零宽字符节点');
            const beforeZWSNode = $createTextNode('\u200B');
            mentionNode.insertBefore(beforeZWSNode);
          } else if (!(prevNode instanceof TextNode)) {
            // 如果前面的节点不是文本节点，在其后创建零宽字符节点
            logger.debug('提及节点前不是文本节点，创建零宽字符节点');
            const beforeZWSNode = $createTextNode('\u200B');
            prevNode.insertAfter(beforeZWSNode);
            beforeZWSNode.insertAfter(mentionNode);
          }
          
          // 后置节点处理
          let afterNode;
          
          if (remainingText.length > 0) {
            // 如果光标后还有文本，创建一个新节点
            logger.debug('光标后有文本，创建文本节点');
            afterNode = $createTextNode(remainingText);
            mentionNode.insertAfter(afterNode);
          }
          
          // 检查当前的后置节点
          const currentNextNode = mentionNode.getNextSibling();
          
          if (!currentNextNode) {
            // 如果后面没有节点，创建包含空格的文本节点
            logger.debug('提及节点后没有节点，创建空格文本节点');
            const afterSpaceNode = $createTextNode(' ');
            mentionNode.insertAfter(afterSpaceNode);
            
            // 设置光标位置在空格后
            const selection = $createRangeSelection();
            selection.anchor.set(afterSpaceNode.getKey(), 1, 'text');
            selection.focus.set(afterSpaceNode.getKey(), 1, 'text');
            $setSelection(selection);
          } else if (currentNextNode instanceof TextNode) {
            // 如果后面是文本节点，确保它以空格开头
            const nextNodeText = currentNextNode.getTextContent();
            
            if (nextNodeText.length === 0 || nextNodeText[0] !== ' ') {
              // 如果后面的文本节点不是以空格开头，添加空格
              logger.debug('后面文本节点不以空格开头，添加空格');
              currentNextNode.setTextContent(' ' + nextNodeText);
            }
            
            // 设置光标位置在空格后
            const selection = $createRangeSelection();
            selection.anchor.set(currentNextNode.getKey(), 1, 'text');
            selection.focus.set(currentNextNode.getKey(), 1, 'text');
            $setSelection(selection);
          } else {
            // 如果后面的节点不是文本节点，在其前创建空格文本节点
            logger.debug('提及节点后不是文本节点，创建空格文本节点');
            const afterSpaceNode = $createTextNode(' ');
            currentNextNode.insertBefore(afterSpaceNode);
            
            // 设置光标位置在空格后
            const selection = $createRangeSelection();
            selection.anchor.set(afterSpaceNode.getKey(), 1, 'text');
            selection.focus.set(afterSpaceNode.getKey(), 1, 'text');
            $setSelection(selection);
          }
          
          logger.info('提及节点创建完成，并确保了前后文本节点处理');
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
