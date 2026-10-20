import type { WarningLevel } from '../types';
import type { ScoreWeights } from './scoring';

/** 점수 항목별 화면 이름 */
export const SCORE_FACTOR_LABEL: Record<keyof ScoreWeights, string> = {
  feelsLike: '체감온도',
  temp: '기온',
  precipitation: '강수',
  wind: '바람',
  humidity: '습도',
  dust: '미세먼지',
  daylight: '일조 시간',
  uv: '자외선',
};

/** 일몰까지 남은 시간을 보여줄 때 소수 첫째 자리까지 맞추는 배수 */
export const SUNSET_HOURS_ROUND_UNIT = 10;

/** 이 점수 이상 깎인 항목만 "이유"로 보여준다 */
export const MIN_REASON_PENALTY = 3;

/** 이유 한 줄에 보여줄 최대 항목 수 */
export const MAX_REASON_ITEMS = 2;

/** 깎인 비율(감점/배점)이 이 값 미만이면 "좋아요" */
export const REASON_GOOD_RATIO = 0.15;

/** 깎인 비율이 이 값 미만이면 "보통이에요", 이상이면 "점수를 많이 깎았어요" */
export const REASON_NORMAL_RATIO = 0.5;

/** 해석 문구의 글자 색: 좋으면 서브 텍스트 그대로, 보통·나쁨만 레벨 색으로 눈에 띄게 한다 */
export const REASON_LEVEL_TEXT_CLASS: Record<WarningLevel, string> = {
  good: 'text-muted-foreground',
  caution: 'text-level-normal',
  careful: 'text-level-bad',
};

/** 점수 근거 화면 문구 */
export const SCORE_REASON_MESSAGES = {
  noPenalty: '점수를 깎는 요인이 없어요',
  openSheet: '왜 이 점수예요?',
  close: '닫기',
  sheetTitle: '점수는 이렇게 계산돼요',
  sheetDescription:
    '8개 항목을 합쳐 100점 만점으로 계산해요. 활동과 내 설정(추위·더위, 질환)에 따라 항목별 비중이 달라져요.',
  sensitiveNote: '내 설정을 반영해 더 엄격하게 봤어요',
  good: '좋아요',
  normal: '보통이에요',
  bad: '점수를 많이 깎았어요',
  day: '해 떠 있음',
  night: '해 짐',
  compareLead: '지금보다',
  compareSame: '지금과 비슷한 조건이에요',
} as const;
