import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  TextNode,
  $getSelection,
  $isRangeSelection,
  $createRangeSelection,
  $setSelection,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { $isMentionNode } from '../nodes';
import { 
  isCursorBeforeMentionNode,
  isCursorAfterMentionNode,
  isCursorBeforeMentionGap,
  isCursorAfterMentionGap,
  getMentionNodeBeforePosition,
  getMentionNodeAfterPosition
} from '../utils/cursor-utils';

// 调试日志前缀
const LOG_PREFIX = '[提及导航]';

// 是否启用调试日志
const DEBUG_ENABLED = true;

// 打印调试日志
function debug(...args: any[]) {
  if (DEBUG_ENABLED) {
    console.log(LOG_PREFIX, ...args);
  }
}

/**
 * 提及导航插件
 * 负责处理提及节点周围的光标键盘左右移动
 * 
 * 主要解决的问题：
 * 1. 向左移动：无论光标在提及节点后方还是后方空隙，都直接跳到提及节点前方
 * 2. 向右移动：无论光标在提及节点前方还是前方空隙，都直接跳到提及节点后方
 * 
 * 这样在编辑过程中，提及节点就像一个整体，光标不会卡在中间状态
 */
export function MentionNavigationPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;

    debug('插件已初始化');

    // 监听左方向键事件
    const removeLeftArrowListener = editor.registerCommand(
      KEY_ARROW_LEFT_COMMAND,
      (event) => {
        debug('检测到左方向键按下');
        
        // 获取当前选择
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          debug('非范围选择或选择未折叠，跳过处理');
          return false;
        }

        // 获取并记录当前光标位置信息
        const anchor = selection.anchor;
        const currentNode = anchor.getNode();
        const offset = anchor.offset;
        debug('当前光标位置:', {
          nodeType: currentNode.getType(),
          nodeText: currentNode instanceof TextNode ? currentNode.getTextContent() : '非文本节点',
          offset
        });

        // 检查以下任一情况：
        // 1. 光标在提及节点后方的零宽空格中
        // 2. 光标在提及节点与后方零宽空格之间的空隙中
        const afterNodeInfo = isCursorAfterMentionNode();
        const afterGapInfo = isCursorAfterMentionGap();
        
        debug('检测结果:', {
          isCursorAfterMentionNode: !!afterNodeInfo,
          isCursorAfterMentionGap: !!afterGapInfo
        });
        
        if (afterNodeInfo || afterGapInfo) {
          // 获取相关的提及节点
          const mentionNode = afterNodeInfo ? 
                              afterNodeInfo.mentionNode : 
                              (afterGapInfo ? afterGapInfo.mentionNode : null);
          
          if (mentionNode) {
            debug('找到需要处理的提及节点:', mentionNode.getTextContent());
            
            // 获取提及节点前的位置信息
            const beforePosition = getMentionNodeBeforePosition(mentionNode);
            if (beforePosition) {
              debug('获取到提及节点前位置:', beforePosition);
              event?.preventDefault?.();
              
              editor.update(() => {
                const selection = $createRangeSelection();
                selection.anchor.set(
                  beforePosition.nodeKey, 
                  beforePosition.offset, 
                  beforePosition.type as 'text' | 'element'
                );
                selection.focus.set(
                  beforePosition.nodeKey, 
                  beforePosition.offset, 
                  beforePosition.type as 'text' | 'element'
                );
                $setSelection(selection);
                debug('已将光标设置到提及节点前');
              });
              
              return true;
            } else {
              debug('未找到提及节点前的位置信息');
            }
          } else {
            debug('未能获取有效的提及节点');
          }
        }
        
        // 检查光标是否在提及节点前面的"夹缝"中
        const beforeGapInfo = isCursorBeforeMentionGap();
        debug('检测光标是否在提及节点前面夹缝:', { isCursorBeforeMentionGap: !!beforeGapInfo });
        
        if (beforeGapInfo) {
          const { mentionNode } = beforeGapInfo;
          debug('找到提及节点:', mentionNode.getTextContent());
          
          // 获取提及节点前的位置信息
          const beforePosition = getMentionNodeBeforePosition(mentionNode);
          if (beforePosition) {
            debug('获取到提及节点前位置:', beforePosition);
            event?.preventDefault?.();
            
            editor.update(() => {
              const selection = $createRangeSelection();
              selection.anchor.set(
                beforePosition.nodeKey, 
                beforePosition.offset, 
                beforePosition.type as 'text' | 'element'
              );
              selection.focus.set(
                beforePosition.nodeKey, 
                beforePosition.offset, 
                beforePosition.type as 'text' | 'element'
              );
              $setSelection(selection);
              debug('已将光标设置到提及节点前');
            });
            
            return true;
          } else {
            debug('未找到提及节点前的位置信息');
          }
        }
        
        debug('未匹配到需要处理的情况，交由默认处理');
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    // 监听右方向键事件
    const removeRightArrowListener = editor.registerCommand(
      KEY_ARROW_RIGHT_COMMAND,
      (event) => {
        debug('检测到右方向键按下');
        
        // 获取当前选择
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          debug('非范围选择或选择未折叠，跳过处理');
          return false;
        }

        // 获取并记录当前光标位置信息
        const anchor = selection.anchor;
        const currentNode = anchor.getNode();
        const offset = anchor.offset;
        debug('当前光标位置:', {
          nodeType: currentNode.getType(),
          nodeText: currentNode instanceof TextNode ? currentNode.getTextContent() : '非文本节点',
          offset
        });

        // 检查以下任一情况：
        // 1. 光标在提及节点前方的零宽空格中
        // 2. 光标在提及节点与前方零宽空格之间的空隙中
        const beforeNodeInfo = isCursorBeforeMentionNode();
        const beforeGapInfo = isCursorBeforeMentionGap();
        
        debug('检测结果:', {
          isCursorBeforeMentionNode: !!beforeNodeInfo,
          isCursorBeforeMentionGap: !!beforeGapInfo
        });
        
        if (beforeNodeInfo || beforeGapInfo) {
          // 获取相关的提及节点
          const mentionNode = beforeNodeInfo ? 
                              beforeNodeInfo.mentionNode : 
                              (beforeGapInfo ? beforeGapInfo.mentionNode : null);
          
          if (mentionNode) {
            debug('找到需要处理的提及节点:', mentionNode.getTextContent());
            
            // 获取提及节点后的位置信息
            const afterPosition = getMentionNodeAfterPosition(mentionNode);
            if (afterPosition) {
              debug('获取到提及节点后位置:', afterPosition);
              event?.preventDefault?.();
              
              editor.update(() => {
                const selection = $createRangeSelection();
                selection.anchor.set(
                  afterPosition.nodeKey, 
                  afterPosition.offset, 
                  afterPosition.type as 'text' | 'element'
                );
                selection.focus.set(
                  afterPosition.nodeKey, 
                  afterPosition.offset, 
                  afterPosition.type as 'text' | 'element'
                );
                $setSelection(selection);
                debug('已将光标设置到提及节点后');
              });
              
              return true;
            } else {
              debug('未找到提及节点后的位置信息');
            }
          } else {
            debug('未能获取有效的提及节点');
          }
        }
        
        // 检查光标是否在提及节点后面的"夹缝"中
        const afterGapInfo = isCursorAfterMentionGap();
        debug('检测光标是否在提及节点后面夹缝:', { isCursorAfterMentionGap: !!afterGapInfo });
        
        if (afterGapInfo) {
          const { mentionNode } = afterGapInfo;
          debug('找到提及节点:', mentionNode.getTextContent());
          
          // 获取提及节点后的位置信息
          const afterPosition = getMentionNodeAfterPosition(mentionNode);
          if (afterPosition) {
            debug('获取到提及节点后位置:', afterPosition);
            event?.preventDefault?.();
            
            editor.update(() => {
              const selection = $createRangeSelection();
              selection.anchor.set(
                afterPosition.nodeKey, 
                afterPosition.offset, 
                afterPosition.type as 'text' | 'element'
              );
              selection.focus.set(
                afterPosition.nodeKey, 
                afterPosition.offset, 
                afterPosition.type as 'text' | 'element'
              );
              $setSelection(selection);
              debug('已将光标设置到提及节点后');
            });
            
            return true;
          } else {
            debug('未找到提及节点后的位置信息');
          }
        }
        
        debug('未匹配到需要处理的情况，交由默认处理');
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      debug('插件销毁');
      removeLeftArrowListener();
      removeRightArrowListener();
    };
  }, [editor]);

  return null;
} 