/**
 * JS 타이머에서 쓰는 모션 duration(ms).
 * src/index.css :root의 --motion-duration-* 값과 같아야 한다 (motion.test.ts가 대조한다).
 */
export const MOTION_DURATION_MS = {
  fast: 200,
  normal: 400,
  slow: 640,
} as const;
