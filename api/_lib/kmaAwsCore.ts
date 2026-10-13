import { KMA_AWS_STATIONS } from './kmaStations.js';
import type { KmaObservation } from './kmaCore.js';

/** 기상청 API허브: AWS 매분자료 */
export const KMA_AWS_MIN_URL = 'https://apihub.kma.go.kr/api/typ01/cgi-bin/url/nph-aws2_min';
/** 매분자료 요청 제한 시간(ms) */
export const KMA_AWS_TIMEOUT_MS = 4000;
/** 가까운 순으로 시도할 관측소 수. 앞 관측소가 결측이면 다음으로 넘어간다 */
export const NEAREST_STATION_COUNT = 3;
/** 이 거리(km)보다 먼 관측소는 쓰지 않는다 */
export const MAX_STATION_DISTANCE_KM = 15;

/** 최신 자료를 놓치지 않도록 거슬러 조회하는 시간(분) */
const LOOKBACK_MINUTES = 10;
/** 한국 표준시(UTC+9)의 밀리초 오프셋 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;
/** 날짜·시각 문자열 자릿수 */
const PAD_WIDTH = 2;
/** 지구 반지름(km) */
const EARTH_RADIUS_KM = 6371;
const DEG_TO_RAD = Math.PI / 180;

/** 매분자료 CSV(disp=1, help=0)의 열 위치 */
const COLUMN_STATION = 1;
const COLUMN_WIND_SPEED_10M = 7;
const COLUMN_TEMP = 8;
const COLUMN_HUMIDITY = 14;
/** 한 줄의 최소 열 수 (습도 열까지) */
const MIN_COLUMNS = COLUMN_HUMIDITY + 1;
/** 이 값 이하는 관측이 없거나 에러 처리된 값이다 (-99.9 등) */
const MISSING_VALUE_MAX = -50;
/** 자료 행 판별: 시각 12자리로 시작한다 */
const DATA_ROW_PATTERN = /^\d{12},/;

/** 거리 정보를 붙인 관측소 */
export interface NearbyStation {
  id: number;
  name: string;
  distanceKm: number;
}

/** 2자리로 맞춘다. */
function pad2(value: number): string {
  return String(value).padStart(PAD_WIDTH, '0');
}

/**
 * 두 좌표 사이의 거리(km)를 구한다. (하버사인)
 * @param lat1 첫 위도
 * @param lon1 첫 경도
 * @param lat2 둘째 위도
 * @param lon2 둘째 경도
 */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * 좌표에서 가까운 AWS 관측소를 가까운 순으로 고른다.
 * @param lat 위도
 * @param lon 경도
 * @param count 최대 개수
 * @param maxKm 이 거리 안의 관측소만 고른다
 */
export function findNearbyStations(
  lat: number,
  lon: number,
  count = NEAREST_STATION_COUNT,
  maxKm = MAX_STATION_DISTANCE_KM,
): NearbyStation[] {
  return KMA_AWS_STATIONS.map(([id, name, sLat, sLon]) => ({
    id,
    name,
    distanceKm: distanceKm(lat, lon, sLat, sLon),
  }))
    .filter((station) => station.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, count);
}

/**
 * 한국 시각을 "YYYYMMDDHHMM" 형식으로 만든다.
 * @param nowMs epoch ms
 */
function toKstMinute(nowMs: number): string {
  const kst = new Date(nowMs + KST_OFFSET_MS);
  const date = `${kst.getUTCFullYear()}${pad2(kst.getUTCMonth() + 1)}${pad2(kst.getUTCDate())}`;
  return `${date}${pad2(kst.getUTCHours())}${pad2(kst.getUTCMinutes())}`;
}

/**
 * 한 관측소의 최근 자료를 조회하는 쿼리를 만든다. (최근 몇 분을 거슬러 조회해 결측 분을 건너뛴다)
 * @param authKey API허브 인증키
 * @param stationId 지점번호
 * @param nowMs 현재 시각(epoch ms)
 */
export function buildAwsQuery(authKey: string, stationId: number, nowMs: number): URLSearchParams {
  return new URLSearchParams({
    tm1: toKstMinute(nowMs - LOOKBACK_MINUTES * ONE_MINUTE_MS),
    tm2: toKstMinute(nowMs),
    stn: String(stationId),
    disp: '1',
    help: '0',
    authKey,
  });
}

/**
 * API허브 인증키를 정리한다.
 * 안내 페이지의 예시 URL 전체를 붙여 넣은 경우 `authKey=` 뒤의 값만 꺼낸다.
 * @param raw 환경변수 값
 */
export function normalizeApiHubKey(raw: string): string {
  const marker = 'authKey=';
  const index = raw.lastIndexOf(marker);
  const key = index >= 0 ? raw.slice(index + marker.length) : raw;
  return key.split('&')[0].trim();
}

/** 문자열 관측값을 숫자로 바꾼다. 결측·잘못된 값은 null */
function toValue(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim() === '') return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= MISSING_VALUE_MAX) return null;
  return value;
}

/**
 * 매분자료 CSV에서 가장 최근의 유효한 관측값(기온·습도·풍속)을 꺼낸다.
 * @param text 응답 본문(disp=1)
 * @param stationId 기대하는 지점번호. 다른 지점 행은 무시한다
 * @returns 기온을 알 수 없으면 null (인증 오류 응답 포함)
 */
export function parseAwsMinute(text: string, stationId: number): KmaObservation | null {
  const rows = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => DATA_ROW_PATTERN.test(line))
    .map((line) => line.split(',').map((cell) => cell.trim()))
    .filter((cells) => cells.length >= MIN_COLUMNS && Number(cells[COLUMN_STATION]) === stationId);
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const temp = toValue(rows[i][COLUMN_TEMP]);
    if (temp === null) continue;
    return {
      temp,
      humidity: toValue(rows[i][COLUMN_HUMIDITY]),
      windSpeed: toValue(rows[i][COLUMN_WIND_SPEED_10M]),
    };
  }
  return null;
}
