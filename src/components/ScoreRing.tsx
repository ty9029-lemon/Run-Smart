import { SCORE_MAX } from '../constants/thresholds';

/** 링 크기 상수 (2단 레이아웃의 절반 폭에 맞춤) */
const SIZE = 120;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ScoreRingProps {
  score: number;
}

/** 활동 지수(100점 만점)를 원형 게이지 카드로 보여준다. */
export default function ScoreRing({ score }: ScoreRingProps) {
  const offset = CIRCUMFERENCE * (1 - score / SCORE_MAX);
  return (
    <section
      aria-label={`활동 지수 ${score}점`}
      className="flex items-center justify-center rounded-panel border border-card-border-ink bg-card-charcoal p-6"
    >
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-card-border-ink)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-lime-pulse)"
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold leading-none">{score}</span>
          <span className="text-xs text-steel-border">/ {SCORE_MAX}</span>
        </div>
      </div>
    </section>
  );
}
