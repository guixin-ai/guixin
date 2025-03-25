import React, { ReactNode } from 'react';
import { MentionNodeDeletionPlugin } from './mention-node-deletion.plugin';
import { MentionAdjacentTextBackspacePlugin } from './mention-adjacent-text-backspace.plugin';

/**
 * 提及删除插件
 * 
 * 这是一个组合插件，包含两个子插件:
 * 1. MentionNodeDeletionPlugin - 处理提及节点的删除
 * 2. MentionAdjacentTextBackspacePlugin - 处理提及节点相邻文本的退格行为
 * 
 * 提及节点的结构：
 * 1. 提及节点前: 可能有零宽空格节点 (\u200B)
 * 2. 提及节点
 * 3. 提及节点后: 空格节点 (' ')
 */
export function MentionDeletionPlugin(): ReactNode {
  return (
    <>
      <MentionNodeDeletionPlugin />
      <MentionAdjacentTextBackspacePlugin />
    </>
  );
} 