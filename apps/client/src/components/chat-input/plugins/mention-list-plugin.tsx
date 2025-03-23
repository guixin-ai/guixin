import { ChatContact } from '..';
import { MentionDisplayPlugin } from './mention-display-plugin';
import { MentionFilterPlugin } from './mention-filter-plugin';
import { MentionPositionPlugin } from './mention-position-plugin';

interface MentionListPluginProps {
  contacts: ChatContact[];
  onSelectMention?: (contact: ChatContact) => void;
}

/**
 * 提及列表插件（聚合插件）
 * 
 * 已被拆分为三个子插件:
 * 1. MentionDisplayPlugin：负责显示和隐藏联系人列表
 * 2. MentionFilterPlugin：负责过滤联系人列表
 * 3. MentionPositionPlugin：负责计算和更新列表位置
 */
export function MentionListPlugin(props: MentionListPluginProps) {
  return (
    <>
      <MentionDisplayPlugin contacts={props.contacts} onSelectMention={props.onSelectMention} />
      <MentionFilterPlugin contacts={props.contacts} />
      <MentionPositionPlugin />
    </>
  );
} 