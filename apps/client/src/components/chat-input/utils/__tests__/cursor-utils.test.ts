import { describe, test, expect, beforeEach } from 'vitest';
import {
  isCursorBeforeMentionNode,
  isCursorAfterMentionNode,
  isCursorBeforeMentionGap,
  isCursorAfterMentionGap,
  getMentionNodeBeforePosition,
  getMentionNodeAfterPosition
} from '../cursor-utils';
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  createEditor,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
  TextNode
} from 'lexical';
import { $createMentionNode, MentionNode } from '../../nodes/mention-node';

// 定义测试中使用到的节点结构类型
interface EditorNodes {
  // 基本结构: [零宽空格1] [提及节点] [零宽空格2]
  zws1: TextNode;
  mention: MentionNode;
  zws2: TextNode;
}

// 定义后混合节点结构
interface EditorNodesWithMixedAfter {
  // 混合结构: [零宽空格1] [提及节点] [零宽空格2其他字符]
  zws1: TextNode;
  mention: MentionNode;
  mixedZws2: TextNode;
}

// 定义前混合节点结构
interface EditorNodesWithMixedBefore {
  // 混合结构: [其他字符+零宽空格1] [提及节点] [零宽空格2]
  mixedZws1: TextNode; // 包含普通字符和零宽空格的混合节点
  mention: MentionNode;
  zws2: TextNode;
}

// 定义双侧混合节点结构
interface EditorNodesWithMixedBoth {
  // 混合结构: [其他字符+零宽空格1] [提及节点] [零宽空格2+空格]
  mixedZws1: TextNode; // 包含普通字符和零宽空格的混合节点
  mention: MentionNode;
  mixedZws2: TextNode; // 包含零宽空格和普通空格的混合节点
}

describe('光标工具函数测试', () => {
  let editor: LexicalEditor;
  let editorNodes: EditorNodes;
  
  // 创建一个实际的编辑器实例供测试使用
  beforeEach(async () => {
    editor = createEditor({
      namespace: 'cursor-utils-test',
      onError: (error) => {
        throw error;
      },
      // 注册自定义节点类型
      nodes: [MentionNode],
    });
    
    // 在每个测试前初始化编辑器结构
    await setupEditorWithMention();
  });
  
  /**
   * 辅助函数：准备包含提及节点的编辑器内容结构
   * 
   * 创建一个三明治结构，模拟函数中预期的节点关系：
   * [零宽空格1] [提及节点] [零宽空格2]
   */
  const setupEditorWithMention = async () => {
    // 因为editor.update的返回类型问题，我们使用副作用来保存节点引用
    await editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      
      // 创建零宽空格1
      const zws1 = $createTextNode('\u200B');
      // 创建一个提及节点
      const mention = $createMentionNode('test-user', '@test');
      // 创建零宽空格2
      const zws2 = $createTextNode('\u200B');
      
      paragraph.append(zws1, mention, zws2);
      root.append(paragraph);
      
      // 保存到外部变量，以便测试使用
      editorNodes = {
        zws1,
        mention,
        zws2
      };
    });
  };
  
  /**
   * 辅助函数：准备包含提及节点和后混合节点的编辑器内容结构
   * 
   * 创建一个结构，模拟包含后混合节点的情况：
   * [零宽空格1][提及节点][零宽空格2其他字符]
   */
  const setupEditorWithMixedNodeAfter = async () => {
    const mixedNodes: EditorNodesWithMixedAfter = {
      zws1: null as unknown as TextNode,
      mention: null as unknown as MentionNode,
      mixedZws2: null as unknown as TextNode
    };
    
    await editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      
      // 创建零宽空格1
      const zws1 = $createTextNode('\u200B');
      // 创建一个提及节点
      const mention = $createMentionNode('test-user', '@test');
      // 创建混合节点：零宽空格+普通文本
      const mixedZws2 = $createTextNode('\u200B其他');
      
      paragraph.append(zws1, mention, mixedZws2);
      root.append(paragraph);
      
      // 赋值到外部声明的变量
      mixedNodes.zws1 = zws1;
      mixedNodes.mention = mention;
      mixedNodes.mixedZws2 = mixedZws2;
    });
    
    return mixedNodes;
  };
  
  /**
   * 辅助函数：准备包含前混合节点和提及节点的编辑器内容结构
   * 
   * 创建一个结构，模拟包含前混合节点的情况：
   * [其他字符+零宽空格1] [提及节点] [零宽空格2]
   */
  const setupEditorWithMixedNodeBefore = async () => {
    const mixedNodes: EditorNodesWithMixedBefore = {
      mixedZws1: null as unknown as TextNode,
      mention: null as unknown as MentionNode,
      zws2: null as unknown as TextNode
    };
    
    await editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      
      // 创建前混合节点：文本+零宽空格
      const mixedZws1 = $createTextNode('文本\u200B');
      // 创建一个提及节点
      const mention = $createMentionNode('test-user', '@test');
      // 创建零宽空格2
      const zws2 = $createTextNode('\u200B');
      
      paragraph.append(mixedZws1, mention, zws2);
      root.append(paragraph);
      
      // 赋值到外部声明的变量
      mixedNodes.mixedZws1 = mixedZws1;
      mixedNodes.mention = mention;
      mixedNodes.zws2 = zws2;
    });
    
    return mixedNodes;
  };
  
  /**
   * 辅助函数：准备包含双侧混合节点的编辑器内容结构
   * 
   * 创建一个结构，模拟包含双侧混合节点的情况：
   * [其他字符+零宽空格1] [提及节点] [零宽空格2+空格]
   */
  const setupEditorWithMixedNodeBoth = async () => {
    const mixedNodes: EditorNodesWithMixedBoth = {
      mixedZws1: null as unknown as TextNode,
      mention: null as unknown as MentionNode,
      mixedZws2: null as unknown as TextNode
    };
    
    await editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      
      // 创建前混合节点：文本+零宽空格
      const mixedZws1 = $createTextNode('文本\u200B');
      // 创建一个提及节点
      const mention = $createMentionNode('test-user', '@test');
      // 创建后混合节点：零宽空格+空格
      const mixedZws2 = $createTextNode('\u200B ');
      
      paragraph.append(mixedZws1, mention, mixedZws2);
      root.append(paragraph);
      
      // 赋值到外部声明的变量
      mixedNodes.mixedZws1 = mixedZws1;
      mixedNodes.mention = mention;
      mixedNodes.mixedZws2 = mixedZws2;
    });
    
    return mixedNodes;
  };
  
  // 测试isCursorBeforeMentionNode函数
  describe('isCursorBeforeMentionNode', () => {
    test('当光标在提及节点前的位置时，应返回正确的位置信息', async () => {
      await editor.update(() => {
        // 根据isCursorBeforeMentionNode的实现，它期望光标在零宽空格1前面的位置
        // 由于在测试环境中很难直接定位到零宽空格1之前，
        // 我们可以通过模拟选择前一个节点末尾或父节点来间接测试
        
        // 选中段落，并将光标定位在开头，这样光标就位于零宽空格1之前
        const paragraph = $getRoot().getFirstChild();
        if (paragraph && paragraph instanceof ElementNode) {
          // 选择段落的开头位置
          const selection = paragraph.selectStart();
          $setSelection(selection);
        }
      });
      
      let result: any;
      await editor.update(() => {
        result = isCursorBeforeMentionNode();
      });
      
      expect(result).not.toBeNull();
      expect(result?.position).toBe('before');
    });
    
    test('当光标不在提及节点前位置时，应返回null', async () => {
      await editor.update(() => {
        // 将光标放在其他位置，例如提及节点和零宽空格1之间
        const zws1 = $getNodeByKey(editorNodes.zws1.getKey());
        if (zws1 instanceof TextNode) {
          const selection = zws1.select(1, 1);
          $setSelection(selection);
        }
      });
      
      let result: any;
      await editor.update(() => {
        result = isCursorBeforeMentionNode();
      });
      
      expect(result).toBeNull();
    });
    
    test('当光标在前混合节点（其他字符+零宽空格）的零宽空格前时，应返回正确位置信息', async () => {
      // 创建包含前混合节点的编辑器结构
      const mixedNodes = await setupEditorWithMixedNodeBefore();
      
      await editor.update(() => {
        // 将光标放在混合节点中的零宽空格前
        // 假设"文本\u200B"中，文本长度为2，零宽空格在位置2
        const mixedZws1 = $getNodeByKey(mixedNodes.mixedZws1.getKey());
        if (mixedZws1 instanceof TextNode) {
          // 将光标放在零宽空格前面
          const selection = mixedZws1.select(2, 2);
          $setSelection(selection);
        }
      });
      
      let result: any;
      await editor.update(() => {
        result = isCursorBeforeMentionNode();
      });
      
      expect(result).not.toBeNull();
      expect(result?.position).toBe('before');
    });
  });
  
  // 测试isCursorAfterMentionNode函数
  describe('isCursorAfterMentionNode', () => {
    test('当光标在纯零宽空格节点末尾时，应返回正确的位置信息', async () => {
      await editor.update(() => {
        // 将光标放在零宽空格2的末尾
        const zws2 = $getNodeByKey(editorNodes.zws2.getKey());
        if (zws2 instanceof TextNode) {
          const selection = zws2.select(1, 1);
          $setSelection(selection);
        }
      });
      
      let result: any;
      await editor.update(() => {
        result = isCursorAfterMentionNode();
      });
      
      expect(result).not.toBeNull();
      expect(result?.position).toBe('after');
    });
    
    test('当光标在混合节点中零宽空格后时，应返回正确的位置信息', async () => {
      // 创建包含混合节点的编辑器结构
      const mixedNodes = await setupEditorWithMixedNodeAfter();
      
      await editor.update(() => {
        // 将光标放在混合节点中的零宽空格后
        const mixedZws2 = $getNodeByKey(mixedNodes.mixedZws2.getKey());
        if (mixedZws2 instanceof TextNode) {
          // 零宽空格在第一个位置，所以设置offset=1
          const selection = mixedZws2.select(1, 1);
          $setSelection(selection);
        }
      });
      
      let result: any;
      await editor.update(() => {
        result = isCursorAfterMentionNode();
      });
      
      expect(result).not.toBeNull();
      expect(result?.position).toBe('after');
    });
    
    test('当光标在混合节点中普通字符后时，应返回null', async () => {
      // 创建包含混合节点的编辑器结构
      const mixedNodes = await setupEditorWithMixedNodeAfter();
      
      await editor.update(() => {
        // 将光标放在混合节点的末尾（普通字符后）
        const mixedZws2 = $getNodeByKey(mixedNodes.mixedZws2.getKey());
        if (mixedZws2 instanceof TextNode) {
          // 混合节点内容是'\u200B其他'，将光标放在末尾
          const textLength = mixedZws2.getTextContent().length;
          const selection = mixedZws2.select(textLength, textLength);
          $setSelection(selection);
        }
      });
      
      let result: any;
      await editor.update(() => {
        result = isCursorAfterMentionNode();
      });
      
      // 由于光标不在零宽空格上，应该返回null
      expect(result).toBeNull();
    });
  });
  
  // 测试isCursorBeforeMentionGap函数
  describe('isCursorBeforeMentionGap', () => {
    test('当光标在零宽字符末尾且与提及节点之间时，应返回正确位置信息', async () => {
      await editor.update(() => {
        // 将光标放在与提及节点紧邻的零宽字符末尾
        const zws1 = $getNodeByKey(editorNodes.zws1.getKey());
        if (zws1 instanceof TextNode) {
          const selection = zws1.select(1, 1);
          $setSelection(selection);
        }
      });
      
      let result: any;
      await editor.update(() => {
        result = isCursorBeforeMentionGap();
      });
      
      expect(result).not.toBeNull();
      expect(result?.position).toBe('beforeMention');
    });
    
    test('当光标在后混合节点中零宽空格后且与提及节点之间时，应返回正确位置信息', async () => {
      // 创建一个新的测试环境，其中零宽空格1是混合节点
      await editor.update(() => {
        const root = $getRoot();
        const paragraph = $createParagraphNode();
        
        // 创建混合零宽空格节点
        const mixedZws = $createTextNode('\u200B ');
        // 创建一个提及节点
        const mention = $createMentionNode('test-user', '@test');
        // 创建零宽空格2
        const zws2 = $createTextNode('\u200B');
        
        paragraph.append(mixedZws, mention, zws2);
        root.clear().append(paragraph);
        
        // 将光标放在混合节点的零宽空格后（offset=1）
        const selection = mixedZws.select(1, 1);
        $setSelection(selection);
      });
      
      let result: any;
      await editor.update(() => {
        result = isCursorBeforeMentionGap();
      });
      
      expect(result).not.toBeNull();
      expect(result?.position).toBe('beforeMention');
    });
    
    test('当光标在前混合节点末尾（零宽空格后）且与提及节点之间时，应返回正确位置信息', async () => {
      // 创建包含前混合节点的编辑器结构
      const mixedNodes = await setupEditorWithMixedNodeBefore();
      
      await editor.update(() => {
        // 将光标放在前混合节点的末尾（零宽空格后）
        const mixedZws1 = $getNodeByKey(mixedNodes.mixedZws1.getKey());
        if (mixedZws1 instanceof TextNode) {
          // 假设混合节点内容是"文本\u200B"，将光标放在末尾
          const textLength = mixedZws1.getTextContent().length;
          const selection = mixedZws1.select(textLength, textLength);
          $setSelection(selection);
        }
      });
      
      let result: any;
      await editor.update(() => {
        result = isCursorBeforeMentionGap();
      });
      
      expect(result).not.toBeNull();
      expect(result?.position).toBe('beforeMention');
    });
  });
  
  // 测试isCursorAfterMentionGap函数
  describe('isCursorAfterMentionGap', () => {
    test('当光标在零宽字符开头且与提及节点之间时，应返回正确位置信息', async () => {
      await editor.update(() => {
        // 将光标放在与提及节点紧邻的零宽字符开头
        const zws2 = $getNodeByKey(editorNodes.zws2.getKey());
        if (zws2 instanceof TextNode) {
          const selection = zws2.select(0, 0);
          $setSelection(selection);
        }
      });
      
      let result: any;
      await editor.update(() => {
        result = isCursorAfterMentionGap();
      });
      
      expect(result).not.toBeNull();
      expect(result?.position).toBe('afterMention');
    });
    
    test('当光标在后混合节点开头且与提及节点之间时，应返回正确位置信息', async () => {
      // 创建包含混合节点的编辑器结构
      const mixedNodes = await setupEditorWithMixedNodeAfter();
      
      await editor.update(() => {
        // 将光标放在混合节点的开头
        const mixedZws2 = $getNodeByKey(mixedNodes.mixedZws2.getKey());
        if (mixedZws2 instanceof TextNode) {
          const selection = mixedZws2.select(0, 0);
          $setSelection(selection);
        }
      });
      
      let result: any;
      await editor.update(() => {
        result = isCursorAfterMentionGap();
      });
      
      expect(result).not.toBeNull();
      expect(result?.position).toBe('afterMention');
    });
    
    test('当光标在前混合节点的情况下在零宽空格2开头且与提及节点之间时，应返回正确位置信息', async () => {
      // 创建包含前混合节点的编辑器结构
      const mixedNodes = await setupEditorWithMixedNodeBefore();
      
      await editor.update(() => {
        // 将光标放在零宽空格2的开头
        const zws2 = $getNodeByKey(mixedNodes.zws2.getKey());
        if (zws2 instanceof TextNode) {
          const selection = zws2.select(0, 0);
          $setSelection(selection);
        }
      });
      
      let result: any;
      await editor.update(() => {
        result = isCursorAfterMentionGap();
      });
      
      expect(result).not.toBeNull();
      expect(result?.position).toBe('afterMention');
    });
  });
  
  // 测试getMentionNodeBeforePosition函数
  describe('getMentionNodeBeforePosition', () => {
    test('当提及节点前有纯零宽空格时，应返回提及节点前方位置信息', async () => {
      let result: any;
      await editor.update(() => {
        const mention = $getNodeByKey(editorNodes.mention.getKey());
        if (mention) {
          result = getMentionNodeBeforePosition(mention);
        }
      });
      
      expect(result).not.toBeNull();
      expect(result.type).toBe('text');
      expect(result.offset).toBe(0);
    });
    
    test('当提及节点前有混合节点（其他字符+零宽空格）时，应返回零宽空格前的位置', async () => {
      // 创建包含前混合节点的编辑器结构
      const mixedNodes = await setupEditorWithMixedNodeBefore();
      
      let result: any;
      await editor.update(() => {
        const mention = $getNodeByKey(mixedNodes.mention.getKey());
        if (mention) {
          result = getMentionNodeBeforePosition(mention);
        }
      });
      
      expect(result).not.toBeNull();
      expect(result.type).toBe('text');
      // 由于混合节点内容是"文本\u200B"，零宽空格在位置2，应该返回2
      expect(result.offset).toBe(2);
    });
    
    test('当不是提及节点时应返回null', async () => {
      let result: any;
      await editor.update(() => {
        // 使用一个普通文本节点
        const textNode = $createTextNode('普通文本');
        result = getMentionNodeBeforePosition(textNode);
      });
      
      expect(result).toBeNull();
    });
  });
  
  // 测试getMentionNodeAfterPosition函数
  describe('getMentionNodeAfterPosition', () => {
    test('当提及节点后是纯零宽空格节点时，应返回正确位置信息', async () => {
      let result: any;
      await editor.update(() => {
        const mention = $getNodeByKey(editorNodes.mention.getKey());
        if (mention) {
          result = getMentionNodeAfterPosition(mention);
        }
      });
      
      expect(result).not.toBeNull();
      expect(result.type).toBe('text');
      expect(result.offset).toBe(1);
    });
    
    test('当提及节点后是混合节点时，应返回零宽空格后的位置', async () => {
      // 创建包含混合节点的编辑器结构
      const mixedNodes = await setupEditorWithMixedNodeAfter();
      
      let result: any;
      await editor.update(() => {
        const mention = $getNodeByKey(mixedNodes.mention.getKey());
        if (mention) {
          result = getMentionNodeAfterPosition(mention);
        }
      });
      
      expect(result).not.toBeNull();
      expect(result.type).toBe('text');
      // 应该是零宽空格后的位置，而不是节点末尾
      expect(result.offset).toBe(1);
    });
    
    test('当前后都是混合节点时，应返回后混合节点中零宽空格后的位置', async () => {
      // 创建包含双侧混合节点的编辑器结构
      const mixedNodes = await setupEditorWithMixedNodeBoth();
      
      let result: any;
      await editor.update(() => {
        const mention = $getNodeByKey(mixedNodes.mention.getKey());
        if (mention) {
          result = getMentionNodeAfterPosition(mention);
        }
      });
      
      expect(result).not.toBeNull();
      expect(result.type).toBe('text');
      // 应该是零宽空格后的位置
      expect(result.offset).toBe(1);
    });
  });
}); 