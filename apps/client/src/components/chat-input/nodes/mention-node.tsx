import React from 'react';
import { 
  ElementNode, 
  LexicalNode, 
  NodeKey, 
  SerializedElementNode, 
  LexicalEditor,
  EditorConfig,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  $createTextNode,
  TextNode,
} from 'lexical';
import { ChatContact } from '..';
import { createLogger } from '../utils/logger';

const logger = createLogger('提及节点');

export type SerializedMentionNode = SerializedElementNode & {
  mentionName: string;
  mentionId: string;
}

/**
 * 提及节点
 * 
 * 该节点是一个独立节点，包含@提及的用户信息
 * 在渲染时，节点前后会自动添加零宽空格，后面还会添加一个普通空格
 * 这样确保光标可以正确定位到节点前后
 */
export class MentionNode extends ElementNode {
  __mention: string;
  __mentionId: string;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mention, node.__mentionId, node.__key);
  }

  constructor(mentionName: string, mentionId: string, key?: NodeKey) {
    super(key);
    this.__mention = mentionName || '未知用户';
    this.__mentionId = mentionId || 'unknown';
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    dom.className = config.theme.mention || 
      'bg-blue-100 dark:bg-blue-800/30 rounded-md text-blue-700 dark:text-blue-300 px-1.5 py-0.5 mx-[1px] inline-flex items-center select-none';
    
    dom.innerHTML = `<span class="mr-0.5">@</span><span>${this.__mention}</span>`;
    dom.dataset.mentionId = this.__mentionId;
    dom.contentEditable = 'false';
    dom.setAttribute('data-lexical-mention', 'true');
    
    return dom;
  }

  updateDOM(prevNode: MentionNode, dom: HTMLElement, config: EditorConfig): boolean {
    const isUpdated = prevNode.__mention !== this.__mention || prevNode.__mentionId !== this.__mentionId;
    if (isUpdated) {
      dom.innerHTML = `<span class="mr-0.5">@</span><span>${this.__mention}</span>`;
      dom.dataset.mentionId = this.__mentionId;
    }
    return isUpdated;
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(
      serializedNode.mentionName,
      serializedNode.mentionId
    );
    return node;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      mentionId: this.__mentionId,
      type: 'mention',
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute('data-lexical-mention', 'true');
    element.className = 'bg-blue-100 dark:bg-blue-800/30 rounded-md text-blue-700 dark:text-blue-300 px-1.5 py-0.5 mx-[1px] inline-flex items-center';
    element.innerHTML = `<span class="mr-0.5">@</span><span>${this.__mention}</span>`;
    element.dataset.mentionId = this.__mentionId;
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-mention')) {
          return null;
        }
        return {
          conversion: convertMentionElement,
          priority: 1,
        };
      },
    };
  }

  decorate(): React.ReactElement {
    return (
      <span 
        className="bg-blue-100 dark:bg-blue-800/30 rounded-md text-blue-700 dark:text-blue-300 px-1.5 py-0.5 mx-[1px] inline-flex items-center select-none" 
        data-mention-id={this.__mentionId}
        data-lexical-mention="true"
        contentEditable="false"
      >
        <span className="mr-0.5">@</span>
        <span>{this.__mention}</span>
      </span>
    );
  }

  isInline(): boolean {
    return true;
  }

  isIsolated(): boolean {
    return true;
  }

  isTokenOrSegment(): boolean {
    return true;
  }

  getMention(): string {
    return this.__mention || '未知用户';
  }

  getMentionId(): string {
    return this.__mentionId || 'unknown';
  }
}

function convertMentionElement(domNode: HTMLElement): DOMConversionOutput {
  const mentionId = domNode.dataset.mentionId || 'unknown';
  let mentionName = '';
  const textContent = domNode.textContent || '';
  if (textContent.startsWith('@')) {
    mentionName = textContent.substring(1) || '未知用户';
  } else {
    mentionName = textContent || '未知用户';
  }
  
  const node = $createMentionNode(mentionName, mentionId);
  return { node };
}

/**
 * 创建提及节点
 * 
 * 不再自动创建前后的文本节点，只创建提及节点本身
 * 调用者需要自行处理前后的文本节点
 * 
 * @param mentionName 提及的用户名
 * @param mentionId 提及的用户ID
 * @param textNode 要替换的文本节点
 * @param atPosition @符号的位置
 * @param cursorOffset 光标位置
 * @returns 返回创建的提及节点
 */
export function $createMentionNodeWithZeroWidthSpaces(
  mentionName: string, 
  mentionId: string,
  textNode: TextNode,
  atPosition: number,
  cursorOffset: number
): MentionNode {
  // 创建提及节点
  const mentionNode = new MentionNode(mentionName || '未知用户', mentionId || 'unknown');
  
  // 分割文本，保留@符号前的内容
  const textBeforeAt = textNode.getTextContent().substring(0, atPosition);
  const remainingText = textNode.getTextContent().substring(cursorOffset);
  
  // 处理前文本节点
  textNode.setTextContent(textBeforeAt);
  
  // 插入提及节点
  textNode.insertAfter(mentionNode);
  
  // 如果光标后还有文本，创建一个新节点
  if (remainingText.length > 0) {
    const remainingTextNode = $createTextNode(remainingText);
    mentionNode.insertAfter(remainingTextNode);
  }
  
  return mentionNode;
}

/**
 * 创建提及节点
 */
export function $createMentionNode(mentionName: string, mentionId: string): MentionNode {
  const name = mentionName || '未知用户';
  const id = mentionId || 'unknown';
  return new MentionNode(name, id);
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode;
} 