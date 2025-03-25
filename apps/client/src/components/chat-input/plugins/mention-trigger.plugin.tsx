import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  KEY_DOWN_COMMAND, 
  COMMAND_PRIORITY_NORMAL,
  $getSelection,
  $isRangeSelection,
  TextNode,
  ParagraphNode,
  $isParagraphNode
} from 'lexical';
import { SHOW_MENTIONS_COMMAND } from '../commands';
import { createLogger } from '../utils/logger';
import { isAnchorAndFocusOverlapping } from '../utils';

// 创建日志记录器
const logger = createLogger('提及触发');

/**
 * 提及触发插件
 * 专门负责监听@符号的键盘输入，并发出触发命令
 * 条件：
 * 1. 文本节点：
 *    a. @符号前面是空格，或者
 *    b. @符号在文本的开头位置
 * 2. 段落节点：
 *    a. @符号只能在段落开头位置触发
 */
export function MentionTriggerPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 检测键盘@符号输入，在满足条件时触发提及功能
    const removeKeyDownListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key === '@') {
          logger.debug('检测到@符号输入');
          
          // 直接获取当前选择
          const selection = $getSelection();
          
          // 只处理范围选择（光标选择）的情况
          if (!$isRangeSelection(selection)) {
            logger.debug('非范围选择，跳过处理');
            return false;
          }
          
          // 检查锚点和焦点是否重叠（无文本选择范围）
          if (!isAnchorAndFocusOverlapping(selection)) {
            logger.debug('锚点和焦点不重叠（存在文本选择范围），跳过处理');
            return false;
          }
          
          const anchor = selection.anchor;
          const anchorNode = anchor.getNode();
          const offset = anchor.offset;
          
          logger.debug('光标位置信息:', {
            nodeType: anchorNode.getType(),
            nodeText: anchorNode instanceof TextNode ? anchorNode.getTextContent() : '非文本节点',
            offset
          });
          
          // 处理文本节点情况
          if (anchorNode instanceof TextNode) {
            // 获取文本内容
            const textContent = anchorNode.getTextContent();
            
            // 条件1：@符号在文本的开头位置
            if (offset === 0) {
              logger.info('触发提及菜单 - 文本开头位置');
              editor.dispatchCommand(SHOW_MENTIONS_COMMAND, undefined);
              return true;
            }
            
            // 条件2：@符号前面是空格
            if (offset > 0) {
              const charBeforeCursor = textContent.charAt(offset - 1);
              logger.debug('光标前的字符:', {
                char: charBeforeCursor,
                charCode: charBeforeCursor.charCodeAt(0)
              });
              
              if (charBeforeCursor === ' ') {
                logger.info('触发提及菜单 - 空格后位置');
                editor.dispatchCommand(SHOW_MENTIONS_COMMAND, undefined);
                return true;
              } else {
                logger.debug('前一个字符不是空格，不触发提及');
              }
            }
          } 
          // 处理段落节点情况
          else if ($isParagraphNode(anchorNode)) {
            // 段落节点只有在开头位置才触发提及
            if (offset === 0) {
              logger.info('触发提及菜单 - 段落开头位置');
              editor.dispatchCommand(SHOW_MENTIONS_COMMAND, undefined);
              return true;
            } else {
              logger.debug('不在段落开头位置，不触发提及');
            }
          } else {
            logger.debug('不支持的节点类型，跳过处理', anchorNode);
          }
          
          logger.debug('不满足触发条件，忽略@符号');
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL
    );

    logger.debug('提及触发插件已初始化');

    return () => {
      removeKeyDownListener();
      logger.debug('提及触发插件已销毁');
    };
  }, [editor]);

  return null;
}
