import type { Activity } from '../types';
import { DAYLIGHT_BUFFER_HOURS, PM10_GOOD, PM10_NORMAL } from './thresholds';

/** 항목별 배점(러닝·산책 기본표). 합계가 100점이다. */
export const SCORE_WEIGHTS = {
  feelsLike: 26,
  temp: 8,
  precipitation: 16,
  wind: 11,
  humidity: 8,
  dust: 15,
  daylight: 5,
  uv: 11,
} as const;

/** 항목별 배점표의 형태 */
export type ScoreWeights = { [K in keyof typeof SCORE_WEIGHTS]: number };

/**
 * 낮시간을 최우선으로 보는 배점표(등산·자전거). 합계가 100점이다.
 * 낮/밤 배점이 가장 커서 밤 최고점이 65점이 되고, 경고 단계 '좋음'(70점)과 구간 추천(80점)에 닿지 못한다.
 */
export const DAYLIGHT_FIRST_WEIGHTS: ScoreWeights = {
  feelsLike: 18,
  temp: 5,
  precipitation: 11,
  wind: 8,
  humidity: 5,
  dust: 10,
  daylight: 35,
  uv: 8,
};

/** 활동별로 일몰 몇 시간 전까지 낮으로 보는지. 0이면 해가 떠 있는 동안 모두 낮이다. */
export const ACTIVITY_DAYLIGHT_BUFFER_HOURS: Record<Activity, number> = {
  running: 0,
  walking: 0,
  hiking: DAYLIGHT_BUFFER_HOURS,
  cycling: DAYLIGHT_BUFFER_HOURS,
};

/** 활동별 배점표 */
export const ACTIVITY_SCORE_WEIGHTS: Record<Activity, ScoreWeights> = {
  running: SCORE_WEIGHTS,
  walking: SCORE_WEIGHTS,
  hiking: DAYLIGHT_FIRST_WEIGHTS,
  cycling: DAYLIGHT_FIRST_WEIGHTS,
};

/** 활동별 체감온도 구간(°C). core 안은 만점, comfort 안은 감점이 작다. */
export interface ComfortRange {
  coreMin: number;
  coreMax: number;
  comfortMin: number;
  comfortMax: number;
}

/** 활동 4종의 체감온도 구간 */
export const ACTIVITY_COMFORT: Record<Activity, ComfortRange> = {
  running: { coreMin: 8, coreMax: 14, comfortMin: 3, comfortMax: 20 },
  cycling: { coreMin: 10, coreMax: 16, comfortMin: 5, comfortMax: 22 },
  hiking: { coreMin: 10, coreMax: 17, comfortMin: 4, comfortMax: 23 },
  walking: { coreMin: 12, coreMax: 20, comfortMin: 6, comfortMax: 26 },
};

/** comfort 구간 끝에서의 품질 (core 1.0 → comfort 끝 0.6) */
export const COMFORT_EDGE_QUALITY = 0.6;
/** comfort 밖에서 품질이 0이 되기까지의 거리(°C) */
export const FEELS_LIKE_FALLOFF = 8;

/** 기온(°C): 이상 구간과 품질이 0이 되는 지점 */
export const TEMP_IDEAL_MIN = 5;
export const TEMP_IDEAL_MAX = 25;
export const TEMP_ZERO_COLD = -10;
export const TEMP_ZERO_HOT = 35;

/** 강수량(mm)이 이 값 이상이면 품질 0 */
export const RAIN_ZERO_MM = 2;

/** 풍속(m/s): 이 값 이하는 만점, ZERO 이상은 품질 0 */
export const WIND_IDEAL_MAX = 3;
export const WIND_ZERO = 12;

/** 습도(%): 이상 구간과 품질이 0이 되는 지점 */
export const HUMIDITY_IDEAL_MIN = 30;
export const HUMIDITY_IDEAL_MAX = 60;
export const HUMIDITY_ZERO_DRY = 10;
export const HUMIDITY_ZERO_WET = 95;

/** 미세먼지(PM10 ㎍/㎥) 구간별 품질 곡선 [농도, 품질] */
export const DUST_CURVE: readonly (readonly [number, number])[] = [
  [0, 1],
  [PM10_GOOD, 1],
  [PM10_NORMAL, 0.6],
  [150, 0.2],
  [300, 0],
];

/** 자외선 지수: 이 값 이하는 만점, ZERO 이상은 품질 0 */
export const UV_IDEAL_MAX = 5;
export const UV_ZERO = 11;

/** 민감 제약이 있으면 해당 항목의 품질 손실(1-품질)에 곱하는 배수 */
export const SENSITIVE_LOSS_MULTIPLIER = 2;
