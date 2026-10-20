import { useEffect, useState } from 'react';
import { SCORE_MAX } from '../constants/thresholds';
import { useAppRevealed } from '../hooks/useAppRevealed';

/** 링 크기 상수 */
const SIZE = 88;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ScoreRingProps {
  score: number;
}

/**
 * 활동 지수(100점 만점)를 원형 게이지로 보여준다. 카드는 바깥(HomeScoreCard)이 그린다.
 * 빈 링에서 시작해 점수만큼 차오르고, 점수가 바뀌면 부드럽게 이어서 움직인다.
 */
export default function ScoreRing({ score }: ScoreRingProps) {
  const isRevealed = useAppRevealed();
  // 마운트 직후 한 프레임 뒤에 목표 값을 넣어야 CSS transition이 빈 링에서 시작한다.
  const [shownScore, setShownScore] = useState(0);
  useEffect(() => {
    if (!isRevealed) return;
    const frame = requestAnimationFrame(() => setShownScore(score));
    return () => cancelAnimationFrame(frame);
  }, [score, isRevealed]);
  const offset = CIRCUMFERENCE * (1 - shownScore / SCORE_MAX);
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
          className="transition-[stroke-dashoffset] duration-(--motion-duration-slow) ease-(--motion-ease-main)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold leading-none">{score}</span>
        <span className="-mt-0.5 text-xs font-medium text-muted-foreground">/{SCORE_MAX}점</span>
      </div>
    </div>
  );
}
