/**
 * JS 타이머에서 쓰는 모션 duration(ms).
 * src/index.css :root의 --motion-duration-* 값과 같아야 한다 (motion.test.ts가 대조한다).
 */
export const MOTION_DURATION_MS = {
  fast: 200,
  normal: 400,
  slow: 640,
} as const;

/** 홈 화면 첫 진입 등장 모션을 구분하는 키 (한 번 보여주면 다시 보여주지 않는다) */
export const HOME_INTRO_KEY = 'home';

/** 로딩이 이 시간(ms)보다 오래 걸릴 때만 스켈레톤을 보여준다. 짧은 로딩에서 깜빡이지 않게 하려는 값이다. */
export const SKELETON_DELAY_MS = MOTION_DURATION_MS.fast;

/** 콘텐츠가 자리에 나타날 때의 페이드 (tw-animate 사용). 로딩 문구가 본문으로 바뀌는 순간 등에 쓴다. */
export const FADE_IN_CLASS =
  'animate-in fade-in-0 duration-(--motion-duration-normal) ease-(--motion-ease-main)';

/**
 * 탭을 옮길 때 새 페이지가 나타나는 페이드. opacity만 쓰는 전용 애니메이션이다(index.css의 --animate-page-in).
 * tw-animate의 animate-in은 transform도 애니메이션해, 래퍼가 홈의 하단 고정 버튼(fixed)의
 * 기준이 되어 버튼이 페이지 아래로 튄다.
 */
export const PAGE_FADE_CLASS = 'animate-page-in';
