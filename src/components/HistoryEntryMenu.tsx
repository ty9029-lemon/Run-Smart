import { EllipsisVertical } from 'lucide-react';
import { useState } from 'react';
import { DropdownMenu } from 'radix-ui';
import { buttonVariants } from '@/components/ui/button';
import { HISTORY_MENU_MESSAGES } from '../constants/messages';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { useHistoryStore } from '../store/historyStore';
import type { FeedbackDetail, HistoryEntry } from '../types';
import DeleteEntryDialog from './DeleteEntryDialog';
import HistoryEditSheet from './HistoryEditSheet';

/** 메뉴 항목 공통 모양 */
const ITEM_CLASS =
  'flex w-full cursor-default items-center rounded-lg px-3 py-2.5 text-sm outline-none data-highlighted:bg-card-charcoal';

interface HistoryEntryMenuProps {
  entry: HistoryEntry;
  /** 기록 날짜가 오늘로부터 며칠 전인지 (삭제 이벤트 속성) */
  daysAgo: number;
}

/** 기록 카드 오른쪽 위 ⋮ 메뉴: 거리·복장 수정(시트)과 삭제(확인 팝업) */
export default function HistoryEntryMenu({ entry, daysAgo }: HistoryEntryMenuProps) {
  const [dialog, setDialog] = useState<'edit' | 'delete' | null>(null);
  const updateEntryDetail = useHistoryStore((s) => s.updateEntryDetail);
  const removeEntry = useHistoryStore((s) => s.removeEntry);

  /** 거리·복장을 저장하고 시트를 닫는다. */
  const handleSave = (detail: FeedbackDetail) => {
    updateEntryDetail(entry.id, detail);
    trackEvent(ANALYTICS_EVENTS.historyEntryEdited, {
      activity: entry.activity,
      hasDistance: detail.distanceKm !== undefined,
      hasActualOutfit: detail.actualOutfit !== undefined,
    });
    setDialog(null);
  };

  /** 확인을 받은 뒤 기록을 지운다. */
  const handleDelete = () => {
    trackEvent(ANALYTICS_EVENTS.historyEntryDeleted, { activity: entry.activity, daysAgo });
    setDialog(null);
    removeEntry(entry.id);
  };

  return (
    <>
      {/* 메뉴가 닫힌 뒤 시트·팝업이 열려도 화면이 잠기지 않도록 modal을 끈다 */}
      <DropdownMenu.Root modal={false}>
        {/* 이 프로젝트의 Button은 ref를 전달하지 않아 Trigger의 asChild와 함께 쓸 수 없다 */}
        <DropdownMenu.Trigger
          aria-label={HISTORY_MENU_MESSAGES.trigger}
          className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
        >
          <EllipsisVertical />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={4}
            className="z-50 min-w-40 rounded-[12px] bg-card-border-ink p-1 text-foreground"
          >
            <DropdownMenu.Item className={ITEM_CLASS} onSelect={() => setDialog('edit')}>
              {HISTORY_MENU_MESSAGES.edit}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className={`${ITEM_CLASS} text-level-bad`}
              onSelect={() => setDialog('delete')}
            >
              {HISTORY_MENU_MESSAGES.remove}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {dialog === 'edit' && (
        <HistoryEditSheet entry={entry} onSave={handleSave} onClose={() => setDialog(null)} />
      )}
      {dialog === 'delete' && (
        <DeleteEntryDialog onCancel={() => setDialog(null)} onConfirm={handleDelete} />
      )}
    </>
  );
}
