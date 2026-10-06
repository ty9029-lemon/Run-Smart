import {
  COMFORT_EDGE_QUALITY,
  DUST_CURVE,
  FEELS_LIKE_FALLOFF,
  HUMIDITY_IDEAL_MAX,
  HUMIDITY_IDEAL_MIN,
  HUMIDITY_ZERO_DRY,
  HUMIDITY_ZERO_WET,
  RAIN_ZERO_MM,
  SENSITIVE_LOSS_MULTIPLIER,
  TEMP_IDEAL_MAX,
  TEMP_IDEAL_MIN,
  TEMP_ZERO_COLD,
  TEMP_ZERO_HOT,
  UV_IDEAL_MAX,
  UV_ZERO,
  WIND_IDEAL_MAX,
  WIND_ZERO,
  type ComfortRange,
} from '../constants/scoring';

/** 곡선을 이루는 점 [x, 품질]. x는 오름차순이다. */
type Curve = readonly (readonly [number, number])[];

/**
 * 점들을 이은 구간 선형 곡선에서 x의 값을 구한다. 양 끝 밖은 끝 값을 쓴다.
 * @param points [x, y] 점 목록 (x 오름차순)
 * @param x 구하려는 위치
 */
export function interpolate(points: Curve, x: number): number {
  const first = points[0];
  const last = points[points.length - 1];
  if (x <= first[0]) return first[1];
  if (x >= last[0]) return last[1];
  const i = points.findIndex(([px]) => px >= x);
  const [x0, y0] = points[i - 1];
  const [x1, y1] = points[i];
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/**
 * 개인 체감온도의 품질(0~1). 활동별 core 안은 1, comfort 끝은 0.6, 그 밖은 0까지 떨어진다.
 * @param feelsLike 개인 체감온도(°C)
 * @param range 활동별 체감온도 구간
 */
export function feelsLikeQuality(feelsLike: number, range: ComfortRange): number {
  return interpolate(
    [
      [range.comfortMin - FEELS_LIKE_FALLOFF, 0],
      [range.comfortMin, COMFORT_EDGE_QUALITY],
      [range.coreMin, 1],
      [range.coreMax, 1],
      [range.comfortMax, COMFORT_EDGE_QUALITY],
      [range.comfortMax + FEELS_LIKE_FALLOFF, 0],
    ],
    feelsLike,
  );
}

/** 실제 기온의 품질(0~1) */
export function tempQuality(temp: number): number {
  return interpolate(
    [
      [TEMP_ZERO_COLD, 0],
      [TEMP_IDEAL_MIN, 1],
      [TEMP_IDEAL_MAX, 1],
      [TEMP_ZERO_HOT, 0],
    ],
    temp,
  );
}

/** 강수량(mm)의 품질(0~1) */
export function rainQuality(precipitation: number): number {
  return interpolate([[0, 1], [RAIN_ZERO_MM, 0]], precipitation);
}

/** 풍속(m/s)의 품질(0~1) */
export function windQuality(windSpeed: number): number {
  return interpolate([[WIND_IDEAL_MAX, 1], [WIND_ZERO, 0]], windSpeed);
}

/** 습도(%)의 품질(0~1) */
export function humidityQuality(humidity: number): number {
  return interpolate(
    [
      [HUMIDITY_ZERO_DRY, 0],
      [HUMIDITY_IDEAL_MIN, 1],
      [HUMIDITY_IDEAL_MAX, 1],
      [HUMIDITY_ZERO_WET, 0],
    ],
    humidity,
  );
}

/** 미세먼지(PM10)의 품질(0~1) */
export function dustQuality(pm10: number): number {
  return interpolate(DUST_CURVE, pm10);
}

/** 자외선 지수의 품질(0~1) */
export function uvQuality(uvIndex: number): number {
  return interpolate([[UV_IDEAL_MAX, 1], [UV_ZERO, 0]], uvIndex);
}

/** 낮이면 1, 밤이면 0. 정보가 없으면 낮으로 본다. */
export function daylightQuality(isDay: boolean | undefined): number {
  return isDay === false ? 0 : 1;
}

/**
 * 민감 제약이 있으면 품질 손실(1-품질)을 배수만큼 키운다. 0 아래로는 내리지 않는다.
 * @param quality 원래 품질(0~1)
 * @param sensitive 해당 항목에 민감한 제약이 있는지
 */
export function applySensitivity(quality: number, sensitive: boolean): number {
  if (!sensitive) return quality;
  return Math.max(0, 1 - (1 - quality) * SENSITIVE_LOSS_MULTIPLIER);
}
