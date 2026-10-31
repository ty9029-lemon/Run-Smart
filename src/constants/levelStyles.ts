import type { DustGrade, UvLevel, WarningLevel } from '../types';

/** 등급 글자 → 레벨 색 글자 클래스 (좋음·낮음은 파랑, 보통은 주황, 나쁨·매우나쁨·높음은 빨강) */
export const GRADE_TEXT_CLASS: Record<DustGrade | UvLevel, string> = {
  좋음: 'text-level-good',
  낮음: 'text-level-good',
  보통: 'text-level-normal',
  나쁨: 'text-level-bad',
  매우나쁨: 'text-level-bad',
  높음: 'text-level-bad',
};

/** 점수 단계별 이름 (시간대 상세의 "80점 좋음") */
export const SCORE_LEVEL_NAME: Record<WarningLevel, string> = {
  good: '좋음',
  caution: '보통',
  careful: '나쁨',
};

/** 점수 단계별 글자 색 (좋음은 라임 강조 — 라이트는 형광펜 밑줄, 나머지는 레벨 색) */
export const SCORE_LEVEL_TEXT_CLASS: Record<WarningLevel, string> = {
  good: 'mark-lime',
  caution: 'text-level-normal',
  careful: 'text-level-bad',
};

/** 점수 단계별 막대 색 */
export const SCORE_LEVEL_BAR_CLASS: Record<WarningLevel, string> = {
  good: 'bg-primary',
  caution: 'bg-level-normal',
  careful: 'bg-level-bad',
};
