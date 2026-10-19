import ActivityChips from './ActivityChips';
import OutfitPanel from './OutfitPanel';
import ScoreRing from './ScoreRing';
import { OUTFIT_SOURCES } from '../constants/analytics';
import type { Activity, OutfitItem } from '../types';

interface HomeSummaryProps {
  activity: Activity;
  score: number;
  /** 점수 링 위의 헤드라인 문구 */
  headline: string;
  outfit: OutfitItem[];
  /** 추천 시간대 한 줄 요약 (계산할 수 없으면 표시하지 않음) */
  recommendSummary?: string;
  onSelectActivity: (activity: Activity) => void;
}

/** 첫 화면 요약: 활동 칩 → 가이드 헤드라인 → 러닝 지수 → 추천 시간대 요약 → 오늘 추천 복장(1단) */
export default function HomeSummary({
  activity,
  score,
  headline,
  outfit,
  recommendSummary,
  onSelectActivity,
}: HomeSummaryProps) {
  return (
    <div className="space-y-4">
      <ActivityChips
        selected={activity}
        onSelect={onSelectActivity}
      />
      <h1 className="text-3xl font-bold leading-tight">{headline}</h1>
      <ScoreRing score={score} />
      {recommendSummary && (
        <p className="text-center text-sm font-medium text-pure-white">{recommendSummary}</p>
      )}
      <OutfitPanel items={outfit} source={OUTFIT_SOURCES.home} activity={activity} />
    </div>
  );
}
