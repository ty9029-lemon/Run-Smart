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
  onSelectActivity: (activity: Activity) => void;
}

/** 첫 화면 요약: 활동 칩 → 가이드 헤드라인 → 러닝 지수 → 오늘 추천 복장(1단) */
export default function HomeSummary({
  activity,
  score,
  headline,
  outfit,
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
      <OutfitPanel items={outfit} source={OUTFIT_SOURCES.home} activity={activity} />
    </div>
  );
}
