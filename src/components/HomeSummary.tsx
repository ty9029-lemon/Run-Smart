import ActivityChips from './ActivityChips';
import OutfitPanel from './OutfitPanel';
import ScoreRing from './ScoreRing';
import { LEVEL_LABEL } from '../constants/messages';
import type { Activity, OutfitItem, WarningLevel } from '../types';

interface HomeSummaryProps {
  activities: Activity[];
  activity: Activity;
  score: number;
  level: WarningLevel;
  outfit: OutfitItem[];
  onSelectActivity: (activity: Activity) => void;
}

/** 첫 화면 요약: 활동 칩 → 가이드 헤드라인 → 러닝 지수 → 오늘의 복장(1단) */
export default function HomeSummary({
  activities,
  activity,
  score,
  level,
  outfit,
  onSelectActivity,
}: HomeSummaryProps) {
  return (
    <div className="space-y-4">
      <ActivityChips
        activities={activities}
        selected={activity}
        onSelect={onSelectActivity}
      />
      <h1 className="text-3xl font-bold leading-tight">{LEVEL_LABEL[level]}</h1>
      <ScoreRing score={score} />
      <OutfitPanel items={outfit} />
    </div>
  );
}
