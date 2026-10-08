/** 추위·더위 민감도 최소 단계 */
export const SENSITIVITY_MIN = 1;
/** 추위·더위 민감도 최대 단계 */
export const SENSITIVITY_MAX = 5;
/** 추위·더위 민감도 기본(보통) 단계 */
export const SENSITIVITY_DEFAULT = 3;
/** 민감도 보정의 기준 체감온도(°C). 이보다 낮으면 추위, 높으면 더위 민감도를 반영한다 */
export const SENSITIVITY_REFERENCE_TEMP = 15;
/** 기준에서 이만큼(°C) 벗어나면 민감도가 100% 반영된다 */
export const SENSITIVITY_RAMP = 10;
/** 민감도 한 단계당 체감온도 보정(°C) */
export const SENSITIVITY_DEGREE_PER_LEVEL = 2.5;

/** 시간대별 날씨 표시 개수(24시간) */
export const HOURS_IN_DAY = 24;
/** 예보를 요청하는 일수 (현재 시각부터 24시간을 내일까지 이어 보여주기 위해 2일치) */
export const FORECAST_DAYS = 2;
/** 일몰 몇 시간 전까지만 낮으로 보는지 (등산·자전거: 해 지기 전에 돌아와야 한다) */
export const DAYLIGHT_BUFFER_HOURS = 3;
/** 히스토리 보관 일수 */
export const HISTORY_DAYS = 7;
/** 1시간의 분 */
export const MINUTES_PER_HOUR = 60;
/** 1분의 밀리초 */
export const MS_PER_MINUTE = 60 * 1000;
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

/** 점수 범위 */
export const SCORE_MAX = 100;
export const SCORE_MIN = 0;
/** 경고 단계 기준 점수 */
export const SCORE_GOOD = 70;
export const SCORE_CAUTION = 45;
/** 추천 시간대를 구간으로 묶을 때의 최소 점수 */
export const RECOMMEND_MIN_SCORE = 80;
/** 최고점과 이 점수 이내로 차이 나는 시간대를 함께 추천한다 */
export const RECOMMEND_SCORE_MARGIN = 3;

/** 미세먼지 등급 기준(㎍/㎥) */
export const PM10_GOOD = 30;
export const PM10_NORMAL = 80;

/** 결정을 기록한 뒤 이 시간(ms) 동안은 버튼 대신 피드백과 '취소하기'만 보여준다 (1시간) */
export const DECISION_LOCK_MS = 60 * 60 * 1000;
/** '가기' 기록 후 이 시간(ms)이 지나면 체감 피드백을 묻는다 (1시간) */
export const FEEDBACK_ASK_DELAY_MS = 60 * 60 * 1000;
/** '가기' 기록 후 이 시간(ms)이 지나면 피드백을 묻지 않는다 (24시간) */
export const FEEDBACK_EXPIRE_MS = MS_PER_DAY;
/** 피드백 1회당 체감온도 보정(°C) */
export const FEEDBACK_STEP = 0.5;
/** 피드백 누적 보정의 최대 크기(±°C) */
export const FEEDBACK_OFFSET_LIMIT = 3;
