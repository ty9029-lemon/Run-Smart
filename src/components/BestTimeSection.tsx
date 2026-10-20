import { Badge } from '@/components/ui/badge';
import { SCORE_LEVEL_NAME, SCORE_LEVEL_TEXT_CLASS } from '../constants/levelStyles';
import type { BestTimeCard as BestTimeCardData } from '../lib/bestTimes';
import { scoreToLevel } from '../lib/runScore';

interface BestTimeSectionProps {
  /** 보여줄 카드 (최대 2장, 없으면 섹션을 그리지 않는다) */
  cards: BestTimeCardData[];
}

/** 정각 시각 표기 (예: 7 → 07:00) */
function formatClock(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/** 등급 배지와 점수 (좋음은 라임 면, 그 밖은 레벨 색 글자의 외곽선) */
function LevelRow({ score }: { score: number }) {
  const level = scoreToLevel(score);
  const isGood = level === 'good';
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isGood ? 'active' : 'outline'}
        className={isGood ? '' : SCORE_LEVEL_TEXT_CLASS[level]}
      >
        {SCORE_LEVEL_NAME[level]}
      </Badge>
      <span className="text-sm font-bold">{score}점</span>
    </div>
  );
}

/**
 * 베스트 시간 카드 한 장: 라벨, 큰 시각, 등급 배지, 점수.
 * 카드가 하나뿐이면 가로로 넓어서 시각과 배지·점수를 한 줄에 나란히 놓고 배지를 오른쪽 끝에 둔다.
 */
function BestTimeCard({ card, isWide }: { card: BestTimeCardData; isWide: boolean }) {
  const time = <p className="text-4xl font-bold leading-none">{formatClock(card.hour)}</p>;
  return (
    <div className="flex-1 space-y-2 rounded-panel bg-card p-4">
      <p className="text-sm font-medium">{card.label}</p>
      {isWide ? (
        <div className="flex items-center justify-between">
          {time}
          <LevelRow score={card.score} />
        </div>
      ) : (
        <>
          {time}
          <LevelRow score={card.score} />
        </>
      )}
    </div>
  );
}

/** 점수 카드 아래 "베스트 시간" 영역. 온보딩에서 고른 시간대의 카드가 먼저 나온다. */
export default function BestTimeSection({ cards }: BestTimeSectionProps) {
  if (cards.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">베스트 시간</h2>
      <div className="flex gap-3">
        {cards.map((card) => (
          <BestTimeCard key={`${card.label}-${card.hour}`} card={card} isWide={cards.length === 1} />
        ))}
      </div>
    </section>
  );
}
