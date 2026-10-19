import { Badge } from '@/components/ui/badge';
import {
  SCORE_LEVEL_NAME,
  SCORE_LEVEL_TEXT_CLASS,
} from '../constants/levelStyles';
import type { HourScore } from '../lib/bestHour';
import { scoreToLevel } from '../lib/runScore';

interface BestTimeSectionProps {
  /** 오늘 가장 좋은 시간대 (없으면 섹션을 그리지 않는다) */
  best: HourScore | null;
}

/** 정각 시각 표기 (예: 7 → 07:00) */
function formatClock(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/** 베스트 시간 카드 한 장: 라벨, 큰 시각, 등급 배지, 점수 */
function BestTimeCard({ best }: { best: HourScore }) {
  const level = scoreToLevel(best.score);
  const isGood = level === 'good';
  return (
    <div className="space-y-2 rounded-panel bg-card-charcoal p-4">
      <p className="text-sm font-medium">오늘 가장 좋은 시간</p>
      <p className="text-4xl font-bold leading-none">{formatClock(best.hour)}</p>
      <div className="flex items-center gap-2">
        <Badge
          variant={isGood ? 'active' : 'outline'}
          className={isGood ? '' : SCORE_LEVEL_TEXT_CLASS[level]}
        >
          {SCORE_LEVEL_NAME[level]}
        </Badge>
        <span className="text-sm font-bold">{best.score}점</span>
      </div>
    </div>
  );
}

/** 점수 카드 아래 "베스트 시간" 영역. 온보딩 시간대 기반 카드는 2단계에서 이어서 붙인다. */
export default function BestTimeSection({ best }: BestTimeSectionProps) {
  if (!best) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">베스트 시간</h2>
      <BestTimeCard best={best} />
    </section>
  );
}
