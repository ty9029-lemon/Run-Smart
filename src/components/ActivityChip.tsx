import { useState } from 'react';
import { Check } from 'lucide-react';
import { COMING_SOON_MESSAGE } from '../constants/activities';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface ActivityChipProps {
  label: string;
  selected: boolean;
  enabled: boolean;
  onClick: () => void;
  /** 비활성 칩을 눌렀을 때 (분석 이벤트 수집용) */
  onDisabledClick?: () => void;
}

const BASE_CLASS = 'inline-flex items-center gap-1.5 rounded-full border py-2 text-sm font-bold';
/** 선택: 라임 면 + 선택 전과 같은 외곽선 + 앞쪽 체크 (좌 14 · 우 20, DESIGN.md) */
const SELECTED_CLASS = 'border-chip-border-selected bg-selected pl-3.5 pr-5 text-highlight';
const DEFAULT_CLASS = 'border-chip-border bg-transparent px-5 text-foreground';
const DISABLED_CLASS = 'cursor-not-allowed border-chip-border bg-transparent px-5 text-foreground opacity-40';

/** 선택 표시용 체크 아이콘 크기 클래스 (14px) */
const CHECK_ICON_CLASS = 'size-3.5';

/** 활동 칩. 비활성이면 흐리게 보이고 호버·클릭 시 "준비 중" 툴팁을 띄운다. */
export default function ActivityChip({
  label,
  selected,
  enabled,
  onClick,
  onDisabledClick,
}: ActivityChipProps) {
  const [open, setOpen] = useState(false);

  if (enabled) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={onClick}
        className={`${BASE_CLASS} ${selected ? SELECTED_CLASS : DEFAULT_CLASS}`}
      >
        {selected && <Check aria-hidden="true" strokeWidth={2.4} className={CHECK_ICON_CLASS} />}
        {label}
      </button>
    );
  }

  // disabled 속성 대신 aria-disabled를 써서 호버·클릭 이벤트(툴팁, 분석 수집)를 유지한다.
  const handleClick = (event: React.MouseEvent) => {
    // Radix 기본 동작(클릭 시 툴팁 닫기)을 막고 열어 둔다 (터치 환경 대응)
    event.preventDefault();
    setOpen(true);
    onDisabledClick?.();
  };

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-disabled="true"
          aria-pressed={false}
          onClick={handleClick}
          className={`${BASE_CLASS} ${DISABLED_CLASS}`}
        >
          {label}
        </button>
      </TooltipTrigger>
      <TooltipContent>{COMING_SOON_MESSAGE}</TooltipContent>
    </Tooltip>
  );
}
