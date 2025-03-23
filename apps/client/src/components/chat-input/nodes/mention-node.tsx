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
} from 'lexical';
import { ChatContact } from '..';

export type SerializedMentionNode = SerializedElementNode & {
  mentionName: string;
  mentionId: string;
}

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
    this.__mention = mentionName;
    this.__mentionId = mentionId;
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
    const isUpdated = prevNode.__mention !== this.__mention;
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
    element.className = 'bg-blue-100 rounded-md text-blue-700 px-1.5 py-0.5 mx-[1px] inline-flex items-center';
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
    return this.__mention;
  }

  getMentionId(): string {
    return this.__mentionId;
  }
}

function convertMentionElement(domNode: HTMLElement): DOMConversionOutput {
  const mentionId = domNode.dataset.mentionId || '';
  let mentionName = '';
  const textContent = domNode.textContent || '';
  if (textContent.startsWith('@')) {
    mentionName = textContent.substring(1);
  } else {
    mentionName = textContent;
  }
  
  const node = $createMentionNode(mentionName, mentionId);
  return { node };
}

export function $createMentionNode(mentionName: string, mentionId: string): MentionNode {
  return new MentionNode(mentionName, mentionId);
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode;
} 