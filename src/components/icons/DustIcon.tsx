import type { SVGProps } from 'react';

/** 점 하나의 반지름 */
const DOT_RADIUS = 1;

/** 점 좌표 (16x16 격자, 다이아몬드 배치) */
const DOTS = [
  [8, 8],
  [4, 10],
  [4, 6],
  [8, 12],
  [8, 4],
  [12, 10],
  [12, 6],
] as const;

/** 미세먼지 커스텀 아이콘. 색은 currentColor를 따른다 */
export default function DustIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      {DOTS.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={DOT_RADIUS} />
      ))}
    </svg>
  );
}
