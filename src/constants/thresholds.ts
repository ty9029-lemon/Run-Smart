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
/** 히스토리 보관 일수 (1년) */
export const HISTORY_DAYS = 365;
/** 한 주의 일수 (달력 열 개수) */
export const DAYS_PER_WEEK = 7;
/** 1시간의 분 */
export const MINUTES_PER_HOUR = 60;
/** 1분의 초 */
export const SECONDS_PER_MINUTE = 60;
/** 1초의 밀리초 */
export const MS_PER_SECOND = 1000;
/** 활동 타이머 표시를 갱신하는 주기(ms) */
export const STOPWATCH_TICK_MS = MS_PER_SECOND;
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

/** 복장: 비가 올 때 우비/방수 장비를 추천하는 강수량 기준(mm) */
export const OUTFIT_RAIN_MIN = 0.1;
/** 복장: 강풍으로 보고 방풍 겉옷을 더하는 풍속 기준(m/s) */
export const OUTFIT_STRONG_WIND_MIN = 8;
/** 복장: 일몰까지 이 시간(h) 이하로 남으면 어두워질 것으로 보고 반사·조명 장비를 더한다 */
export const OUTFIT_DARK_SOON_HOURS = 1;
/** 복장: 자외선 지수가 이 값 이상이면 모자·선크림·선글라스/고글을 더한다 */
export const OUTFIT_UV_HIGH_MIN = 6;
/** 복장: 등산 시 체감온도가 이 값(°C) 이하면 빙판 대비 아이젠을 챙기도록 안내한다 */
export const OUTFIT_ICE_RISK_MAX = 0;

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

/** '가기' 기록 후 체감 피드백을 묻기까지의 대기 시간(분) */
export const FEEDBACK_ASK_DELAY_MINUTES = 30;
/** '가기' 기록 후 이 시간(ms)이 지나면 체감 피드백을 묻는다 (30분) */
export const FEEDBACK_ASK_DELAY_MS = FEEDBACK_ASK_DELAY_MINUTES * MS_PER_MINUTE;
/** '가기' 기록 후 같은 활동으로 다시 출발할 수 있게 되기까지의 대기 시간(분) */
export const REDEPARTURE_DELAY_MINUTES = 30;
/** '가기' 기록 후 이 시간(ms)이 지나면 같은 활동으로 다시 출발할 수 있다 (30분) */
export const REDEPARTURE_DELAY_MS = REDEPARTURE_DELAY_MINUTES * MS_PER_MINUTE;
/** '가기' 기록 후 이 시간(ms)이 지나면 피드백을 묻지 않는다 (24시간) */
export const FEEDBACK_EXPIRE_MS = MS_PER_DAY;
/** 피드백 시트에서 답한 뒤 감사 문구를 보여주고 닫기까지의 시간(ms) */
export const FEEDBACK_SHEET_THANKS_MS = 1500;
/** 피드백 1회당 체감온도 보정(°C) */
export const FEEDBACK_STEP = 0.5;
/** 피드백 누적 보정의 최대 크기(±°C) */
export const FEEDBACK_OFFSET_LIMIT = 3;

/** 앱 만족도 팝업: 노출에 필요한 최소 출발 기록 수 */
export const APP_REVIEW_MIN_ENTRIES = 1;
/** 앱 만족도 팝업: 홈 진입 후 팝업을 띄우기까지의 대기 시간(ms) */
export const APP_REVIEW_SHOW_DELAY_MS = 3000;
/** 앱 만족도 팝업: 토스트·체감 카드가 끝난 뒤 팝업을 띄우기까지의 대기 시간(ms) */
export const APP_REVIEW_AFTER_BLOCKER_DELAY_MS = 2000;
/** 앱 만족도 팝업: 이만큼(ms) 활동이 없다가 돌아오면 새 세션(재방문)으로 본다 (30분) */
export const APP_REVIEW_SESSION_IDLE_MS = 30 * MS_PER_MINUTE;
/** 앱 만족도 팝업: 닫은 뒤 다시 묻지 않는 기간(일) */
export const APP_REVIEW_DISMISS_COOLDOWN_DAYS = 7;
/** 앱 만족도 팝업: 이 횟수만큼 닫으면 더 이상 묻지 않는다 */
export const APP_REVIEW_MAX_DISMISSALS = 2;
/** 앱 만족도 팝업: 별점 최대값 */
export const APP_REVIEW_MAX_RATING = 5;
/** 앱 만족도 팝업: 이 점수 이하이면 아쉬운 점을 물어본다 */
export const APP_REVIEW_LOW_RATING_MAX = 3;
/** 앱 만족도 팝업: 메시지 최대 글자 수 */
export const APP_REVIEW_MAX_MESSAGE_LENGTH = 200;
