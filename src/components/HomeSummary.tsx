import ActivityChips from './ActivityChips';
import HomeScoreCard from './HomeScoreCard';
import type { ScoreReason } from '../lib/scoreReasons';
import type { Activity, Weather } from '../types';

interface HomeSummaryProps {
  activity: Activity;
  score: number;
  /** 점수 카드 위의 헤드라인 문구 */
  headline: string;
  weather: Weather;
  feelsLike: number;
  /** 항목별 점수 근거 */
  reasons: ScoreReason[];
  onOpenBreakdown: () => void;
  onSelectActivity: (activity: Activity) => void;
}

/** 첫 화면 요약: 활동 칩 → 가이드 헤드라인 → 활동 지수·지금 날씨 카드 */
export default function HomeSummary({
  activity,
  score,
  headline,
  weather,
  feelsLike,
  reasons,
  onOpenBreakdown,
  onSelectActivity,
}: HomeSummaryProps) {
  return (
    <div>
      <ActivityChips selected={activity} onSelect={onSelectActivity} />
      <h1 className="mb-4 mt-5 text-2xl font-bold leading-snug">{headline}</h1>
      <HomeScoreCard
        score={score}
        weather={weather}
        feelsLike={feelsLike}
        reasons={reasons}
        onOpenBreakdown={onOpenBreakdown}
      />
    </div>
  );
}
