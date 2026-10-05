import { OFFSET_MAX, OFFSET_MIN, OFFSET_STEP } from '../constants/thresholds';

interface OffsetSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

/** 보정값 표기 (예: +2°C) */
function formatOffset(value: number): string {
  return `${value > 0 ? '+' : ''}${value}°C`;
}

/** 활동별 체감 온도 보정 슬라이더 (-5 ~ +5, 1단계) */
export default function OffsetSlider({ label, value, onChange }: OffsetSliderProps) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{formatOffset(value)}</span>
      </div>
      <input
        type="range"
        aria-label={`${label} 체감 온도 보정`}
        min={OFFSET_MIN}
        max={OFFSET_MAX}
        step={OFFSET_STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-lime-pulse"
      />
      <div className="flex justify-between text-xs text-steel-border">
        <span>추위를 많이 탐</span>
        <span>더위를 많이 탐</span>
      </div>
    </div>
  );
}
