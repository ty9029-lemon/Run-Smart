import { SCORE_MAX } from '../constants/thresholds';

/** 링 크기 상수 */
const SIZE = 88;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ScoreRingProps {
  score: number;
}

/** 활동 지수(100점 만점)를 원형 게이지로 보여준다. 카드는 바깥(HomeScoreCard)이 그린다. */
export default function ScoreRing({ score }: ScoreRingProps) {
  const offset = CIRCUMFERENCE * (1 - score / SCORE_MAX);
  return (
    <div
      role="img"
      aria-label={`활동 지수 ${score}점`}
      className="relative shrink-0"
      style={{ width: SIZE, height: SIZE }}
    >
      <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden="true">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-lime-pulse)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold leading-none">{score}</span>
        <span className="-mt-0.5 text-xs font-medium text-muted-foreground">/{SCORE_MAX}점</span>
      </div>
    </div>
  );
}
