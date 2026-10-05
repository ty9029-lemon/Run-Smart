import type { HourlyWeather, Weather } from '../types';

/** 더미 현재 날씨 (PRD 6장 예시 기준) */
export const DUMMY_CURRENT_WEATHER: Weather = {
  temp: 12,
  humidity: 65,
  windSpeed: 8,
  precipitation: 0,
  condition: '흐림',
  pm10: 45,
  uvIndex: 2,
};

/** [기온, 습도, 풍속, 강수, 미세먼지, 자외선, 날씨] 형태의 24시간 더미 */
type HourRow = [number, number, number, number, number, number, string];

const HOUR_ROWS: HourRow[] = [
  [8, 75, 3, 0, 40, 0, '맑음'],
  [8, 76, 3, 0, 40, 0, '맑음'],
  [7, 78, 2, 0, 38, 0, '맑음'],
  [7, 80, 2, 0, 38, 0, '맑음'],
  [6, 82, 2, 0, 36, 0, '맑음'],
  [6, 82, 3, 0, 36, 0, '맑음'],
  [7, 80, 3, 0, 38, 1, '맑음'],
  [8, 76, 4, 0, 42, 1, '구름 조금'],
  [9, 72, 5, 0, 44, 2, '구름 조금'],
  [10, 70, 6, 0, 46, 3, '흐림'],
  [11, 68, 7, 0, 46, 4, '흐림'],
  [12, 66, 8, 0, 45, 5, '흐림'],
  [12, 65, 8, 0, 45, 5, '흐림'],
  [13, 62, 7, 0, 48, 5, '흐림'],
  [14, 60, 6, 0, 52, 4, '구름 많음'],
  [14, 60, 6, 0.3, 55, 3, '약한 비'],
  [13, 66, 5, 0.5, 50, 2, '약한 비'],
  [13, 68, 4, 0, 48, 1, '흐림'],
  [12, 68, 4, 0, 46, 0, '흐림'],
  [11, 70, 3, 0, 44, 0, '구름 많음'],
  [11, 71, 3, 0, 42, 0, '구름 조금'],
  [10, 72, 3, 0, 42, 0, '맑음'],
  [9, 74, 3, 0, 40, 0, '맑음'],
  [9, 75, 3, 0, 40, 0, '맑음'],
];

/** 24시간 더미 날씨 (0시 ~ 23시) */
export const DUMMY_HOURLY: HourlyWeather[] = HOUR_ROWS.map(
  ([temp, humidity, windSpeed, precipitation, pm10, uvIndex, condition], hour) => ({
    hour,
    temp,
    humidity,
    windSpeed,
    precipitation,
    pm10,
    uvIndex,
    condition,
  }),
);
