import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { SerializedEditorState } from 'lexical';
import { useEffect } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('编辑器变化');

/**
 * 从EditorState JSON获取文本内容，包括处理提及节点
 */
function getTextContentFromEditorStateJSON(json: SerializedEditorState): string {
  let text = '';

  // 处理节点数组，递归提取文本
  const processNodes = (nodes: any[]) => {
    for (const node of nodes) {
      // 处理不同类型的节点
      if (node.type === 'mention') {
        // 提及节点转换为XML格式，包含id属性
        text += `<mention id="${node.mentionId}">${node.mentionName}</mention>`;
      } else if (node.type === 'text') {
        // 文本节点直接添加内容
        text += node.text;
      } else if (node.type === 'linebreak') {
        // 处理换行节点，转换为换行符
        text += '\n';
      } else if (node.type === 'paragraph' || node.type === 'root') {
        // 段落和根节点处理其子节点
        if (node.children && node.children.length > 0) {
          processNodes(node.children);
          
          // 段落后添加换行（除非是最后一个段落）
          if (node.type === 'paragraph') {
            text += '\n';
          }
        }
      }
    }
  };

  // 处理根节点的子节点
  if (json.root && json.root.children) {
    processNodes(json.root.children);
  }

  return text.trim();
}

// 内容变化插件
export function OnChangePlugin({
  onChange,
}: {
  onChange: (text: string, json: SerializedEditorState) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 使用registerUpdateListener可以在每次编辑器状态更新时触发
    // 包括所有类型的变化，如普通文本输入、格式变化、提及插入等
    logger.debug('注册编辑器更新监听器');
    return editor.registerUpdateListener(({ editorState }) => {
      // 将编辑器状态转换为JSON
      const editorStateJSON = editorState.toJSON();

      // 从JSON中提取文本内容，处理提及节点
      const textContent = getTextContentFromEditorStateJSON(editorStateJSON);

      logger.debug('编辑器内容已更新，JSON提取文本内容:', textContent);
      logger.debug('编辑器JSON数据:', JSON.stringify(editorStateJSON).substring(0, 200) + '...');

      // 触发onChange回调，传递提取的文本内容和JSON数据
      onChange(textContent, editorStateJSON);
    });
  }, [editor, onChange]);

  return null;
}
