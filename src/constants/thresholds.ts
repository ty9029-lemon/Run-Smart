/** 체감 온도 보정 최소값(°C) */
export const OFFSET_MIN = -5;
/** 체감 온도 보정 최대값(°C) */
export const OFFSET_MAX = 5;
/** 체감 온도 보정 조정 단위(°C) */
export const OFFSET_STEP = 1;

/** 선택 가능한 최대 활동 수 */
export const MAX_ACTIVITIES = 3;

/** 시간대별 날씨 표시 개수(24시간) */
export const HOURS_IN_DAY = 24;
/** 히스토리 보관 일수 */
export const HISTORY_DAYS = 7;
/** 하루의 밀리초 */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 풍속 1m/s 당 체감온도 하락(°C) */
export const WIND_CHILL_PER_MS = 0.4;
/** 습도 기준값(%), 이보다 높으면 체감이 더 낮아짐 */
export const HUMIDITY_BASE = 60;
/** 습도 10%p 당 체감온도 하락(°C) */
export const HUMIDITY_CHILL_PER_10 = 0.3;
/** 습도 보정 단위(%p) */
export const HUMIDITY_UNIT = 10;

/** 활동하기 쾌적한 체감온도 범위(°C) */
export const COMFORT_TEMP_MIN = 10;
export const COMFORT_TEMP_MAX = 20;
/** 쾌적 범위를 1°C 벗어날 때마다 깎는 점수 */
export const TEMP_PENALTY_PER_DEGREE = 4;
/** 풍속 감점 기준(m/s)과 m/s 당 감점 */
export const WIND_PENALTY_START = 4;
export const WIND_PENALTY_PER_MS = 2;
/** 강수 감점(mm 당) */
export const RAIN_PENALTY_PER_MM = 15;
/** 미세먼지(PM10) 감점 기준(㎍/㎥)과 10 당 감점 */
export const PM10_PENALTY_START = 50;
export const PM10_PENALTY_PER_10 = 2;
export const PM10_UNIT = 10;
/** 자외선 감점 기준과 단계 당 감점 */
export const UV_PENALTY_START = 6;
export const UV_PENALTY_PER_LEVEL = 3;
/** 민감 제약이 있을 때 추가 감점 배수 */
export const SENSITIVE_PENALTY_MULTIPLIER = 2;

/** 점수 범위 */
export const SCORE_MAX = 100;
export const SCORE_MIN = 0;
/** 경고 단계 기준 점수 */
export const SCORE_GOOD = 70;
export const SCORE_CAUTION = 45;

/** 미세먼지 등급 기준(㎍/㎥) */
export const PM10_GOOD = 30;
export const PM10_NORMAL = 80;
