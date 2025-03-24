import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  TextNode,
  $getSelection,
  $isRangeSelection,
  $createTextNode,
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { SELECT_MENTION_COMMAND } from '../commands';
import { $createMentionNode } from '../nodes';
import { ChatContact } from '..';

/**
 * 提及转换插件
 * 负责将选择的联系人转换为提及节点
 * 
 * 提及节点的结构：
 * 1. 提及节点前: 零宽空格节点 (\u200B)
 * 2. 提及节点
 * 3. 提及节点后: 零宽空格节点 (\u200B)
 * 4. 普通空格节点 (' ')
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
        console.log('SELECT_MENTION_COMMAND received');
        // 在编辑器中插入提及节点
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            const anchor = selection.anchor;
            const focus = selection.focus;
            const anchorNode = anchor.getNode();

            if (anchorNode instanceof TextNode) {
              const textContent = anchorNode.getTextContent();
              const lastAtPos = textContent.lastIndexOf('@');

              if (lastAtPos !== -1) {
                // 创建提及节点
                const mentionNode = $createMentionNode(contact.name, contact.id);

                // 分割文本节点，确保在@符号处进行分割
                let textBeforeAt = '';
                if (lastAtPos > 0) {
                  // 保存@符号前的文本内容
                  textBeforeAt = textContent.substring(0, lastAtPos);
                  // 在@符号处分割节点
                  anchorNode.splitText(lastAtPos);
                }

                // 获取最新的文本节点引用
                const textNode = anchorNode.getLatest();

                if (textNode && textNode instanceof TextNode) {
                  // 如果@符号前有内容，保留该内容，否则移除整个节点
                  if (textBeforeAt.length > 0) {
                    textNode.setTextContent(textBeforeAt);
                    
                    // 在提及节点前插入零宽空格节点
                    const beforeZeroWidthSpaceNode = $createTextNode('\u200B');
                    textNode.insertAfter(beforeZeroWidthSpaceNode);
                    
                    // 插入提及节点
                    beforeZeroWidthSpaceNode.insertAfter(mentionNode);
                  } else {
                    // 如果@符号在开头，直接移除节点并替换为提及节点
                    // 先创建零宽空格节点
                    const beforeZeroWidthSpaceNode = $createTextNode('\u200B');
                    
                    // 将零宽空格节点插入到文本节点之前
                    textNode.insertBefore(beforeZeroWidthSpaceNode);
                    
                    // 将提及节点插入到零宽空格节点之后
                    beforeZeroWidthSpaceNode.insertAfter(mentionNode);
                    
                    // 移除包含@符号的原始文本节点
                    textNode.remove();
                  }

                  // 在提及节点后插入零宽空格节点
                  const afterZeroWidthSpaceNode = $createTextNode('\u200B');
                  mentionNode.insertAfter(afterZeroWidthSpaceNode);

                  // 再插入一个普通空格节点
                  const spaceNode = $createTextNode(' ');
                  afterZeroWidthSpaceNode.insertAfter(spaceNode);

                  // 将选择移到普通空格节点后
                  spaceNode.select();
                }
              }
            }
          }
        });

        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      removeSelectMentionListener();
    };
  }, [editor, contacts]);

  return null;
}
