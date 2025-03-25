import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection,
  $isRangeSelection,
  TextNode,
  $isParagraphNode
} from 'lexical';
import { SHOW_MENTIONS_COMMAND } from '../commands';
import { createLogger } from '../utils/logger';

// 创建日志记录器
const logger = createLogger('提及触发');

/**
 * 提及触发插件
 * 专门负责检测编辑器内容变化，检查是否输入了@符号，并发出触发命令
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
    // 使用registerUpdateListener监听编辑器内容变化
    const removeUpdateListener = editor.registerUpdateListener(() => {
      // 在编辑器更新完成后检查@符号
      editor.read(() => {
        // 获取当前选择
        const selection = $getSelection();
        
        // 只处理范围选择（光标选择）的情况
        if (!$isRangeSelection(selection)) {
          logger.debug('非范围选择，跳过处理');
          return;
        }
        
        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        const offset = anchor.offset;
        
        // 只在光标位置为0时或者前一个字符是@时做处理
        if (offset === 0) {
          // 在段落或文本节点开头位置，不需要检查@符号
          return;
        }

        // 处理文本节点情况
        if (anchorNode instanceof TextNode) {
          // 获取文本内容
          const textContent = anchorNode.getTextContent();
          
          // 检查当前光标前一个字符是不是@
          if (offset > 0 && textContent.charAt(offset - 1) === '@') {
            // 判断@前一个字符
            // 如果@是文本的第一个字符或者@前面是空格，则触发提及
            if (offset === 1 || textContent.charAt(offset - 2) === ' ') {
              logger.info('触发提及菜单 - 检测到@符号');
              editor.dispatchCommand(SHOW_MENTIONS_COMMAND, undefined);
            }
          }
        }
        // 处理段落节点情况
        else if ($isParagraphNode(anchorNode)) {
          // 对于段落节点，检查第一个子节点
          const children = anchorNode.getChildren();
          if (children.length > 0) {
            const firstChild = children[0];
            if (firstChild instanceof TextNode) {
              const textContent = firstChild.getTextContent();
              // 如果文本以@开头，则触发提及
              if (textContent.length > 0 && textContent.charAt(0) === '@' && offset === 1) {
                logger.info('触发提及菜单 - 段落开头位置@符号');
                editor.dispatchCommand(SHOW_MENTIONS_COMMAND, undefined);
              }
            }
          }
        }
      });
    });

    logger.debug('提及触发插件已初始化');

    return () => {
      removeUpdateListener();
      logger.debug('提及触发插件已销毁');
    };
  }, [editor]);

  return null;
}
