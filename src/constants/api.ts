/** Open-Meteo 날씨 예보 API (API 키 불필요) */
export const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
/** Open-Meteo 대기질 API (PM10) */
export const OPEN_METEO_AIR_URL =
  'https://air-quality-api.open-meteo.com/v1/air-quality';

/** AI 가이드 서버리스 함수 경로 */
export const GUIDE_API_PATH = '/api/guide';

/** 날씨 요청 제한 시간(ms) */
export const WEATHER_TIMEOUT_MS = 8000;
/** AI 가이드 요청 제한 시간(ms) */
export const GUIDE_TIMEOUT_MS = 20000;
/** AI 가이드 클라이언트 재시도 횟수 (PRD 6장: 재시도 후 실패하면 원시 데이터) */
export const GUIDE_RETRY_COUNT = 1;

/** 1시간(ms) */
const ONE_HOUR_MS = 60 * 60 * 1000;
/** 날씨 캐시 유효 시간(PRD 8장: 1시간) */
export const WEATHER_CACHE_TTL_MS = ONE_HOUR_MS;
/** AI 가이드 캐시 유효 시간. 날씨 캐시와 같게 둔다 */
export const GUIDE_CACHE_TTL_MS = ONE_HOUR_MS;
/** AI 가이드 캐시 LocalStorage 키 접두어 */
export const GUIDE_CACHE_PREFIX = 'runsmart:guide:';
/** 날씨 캐시 LocalStorage 키 접두어 */
export const WEATHER_CACHE_PREFIX = 'runsmart:weather:v2:';
/** 캐시 키에 쓰는 좌표 소수점 자릿수 (약 1km) */
export const COORD_CACHE_DIGITS = 2;

/** 위치 조회 제한 시간(ms) */
export const GEOLOCATION_TIMEOUT_MS = 8000;

/** 좌표 */
export interface Coords {
  lat: number;
  lon: number;
}

/** 위치를 알 수 없을 때 쓰는 서울 강남구 좌표 (PRD 6장) */
export const SEOUL_COORDS: Coords = { lat: 37.4979, lon: 127.0276 };
/** 현재 위치를 쓸 때 헤더에 표시하는 이름 */
export const CURRENT_LOCATION_LABEL = '현재 위치';
