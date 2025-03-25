import { EditorState, LexicalNode, TextNode } from 'lexical';

declare module '@lexical/markdown' {
  export interface Transformer {
    export: (node: LexicalNode) => string | null;
    regExp: RegExp;
    replace: (textNode: TextNode, match: RegExpMatchArray) => void;
    type: string;
  }

  export function $convertFromMarkdownString(
    markdown: string,
    transformers: Transformer[]
  ): EditorState;

  export function $convertToMarkdownString(
    transformers: Transformer[],
    node?: LexicalNode
  ): string;

  export const TRANSFORMERS: Transformer[];
}

declare module '@lexical/react/LexicalMarkdownShortcutPlugin' {
  export interface MarkdownShortcutPluginProps {
    transformers: Transformer[];
  }

  export const MarkdownShortcutPlugin: React.FC<MarkdownShortcutPluginProps>;
}

declare module '@lexical/react/LexicalComposerContext' {
  import { LexicalEditor } from 'lexical';
  
  export function useLexicalComposerContext(): [LexicalEditor];
}

declare module '@lexical/react/LexicalComposer' {
  import { InitialConfigType } from 'lexical';

  export interface LexicalComposerProps {
    initialConfig: InitialConfigType;
    children: React.ReactNode;
  }

  export const LexicalComposer: React.FC<LexicalComposerProps>;
}

declare module '@lexical/react/LexicalRichTextPlugin' {
  export interface RichTextPluginProps {
    contentEditable: React.ReactElement;
    placeholder?: React.ReactElement;
    ErrorBoundary?: React.ComponentType<any>;
  }

  export const RichTextPlugin: React.FC<RichTextPluginProps>;
}

declare module '@lexical/react/LexicalContentEditable' {
  export interface ContentEditableProps extends React.HTMLAttributes<HTMLDivElement> {
    'data-placeholder'?: string;
  }

  export const ContentEditable: React.ForwardRefExoticComponent<
    ContentEditableProps & React.RefAttributes<HTMLDivElement>
  >;
}

declare module '@lexical/react/LexicalAutoFocusPlugin' {
  export const AutoFocusPlugin: React.FC;
}

declare module '@lexical/react/LexicalHistoryPlugin' {
  export const HistoryPlugin: React.FC;
} 