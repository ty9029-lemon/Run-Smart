/** 기상청 단기예보 조회서비스: 초단기실황 (실제 관측값) */
export const KMA_NCST_URL =
  'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
/** 기상청 요청 제한 시간(ms) */
export const KMA_TIMEOUT_MS = 4000;

/** 기상청 격자 변환 상수 (Lambert Conformal Conic, 공식 가이드 기준) */
const EARTH_RADIUS_KM = 6371.00877;
/** 격자 간격(km) */
const GRID_SPACING_KM = 5.0;
/** 표준 위도 1·2 (도) */
const STANDARD_LAT_1 = 30.0;
const STANDARD_LAT_2 = 60.0;
/** 기준점 경도·위도 (도) */
const ORIGIN_LON = 126.0;
const ORIGIN_LAT = 38.0;
/** 기준점의 격자 좌표 */
const ORIGIN_X = 43;
const ORIGIN_Y = 136;
/** 도 → 라디안 */
const DEG_TO_RAD = Math.PI / 180;

/** 한국 표준시(UTC+9)의 밀리초 오프셋 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
/** 정각 발표 후 API에 반영되기까지 걸리는 분. 이보다 이르면 직전 시각 자료를 쓴다 */
const PUBLISH_DELAY_MINUTES = 10;
/** 1시간(ms) */
const ONE_HOUR_MS = 60 * 60 * 1000;
/** 날짜·시각 문자열 자릿수 */
const PAD_WIDTH = 2;

/** 기상청이 결측을 나타내는 값의 상한 (-999 등) */
const MISSING_VALUE_MAX = -900;

/** 기상청 격자 좌표 */
export interface KmaGrid {
  nx: number;
  ny: number;
}

/** 초단기실황 발표 기준 일시 */
export interface KmaBaseTime {
  /** "20261013" */
  baseDate: string;
  /** "1100" */
  baseTime: string;
}

/** 초단기실황 중 앱이 쓰는 관측값 */
export interface KmaObservation {
  temp: number;
  humidity: number | null;
  windSpeed: number | null;
}

/** 기상청 응답의 항목 중 사용하는 필드 */
interface KmaItem {
  category?: string;
  obsrValue?: string;
}

/** 2자리로 맞춘다. */
function pad2(value: number): string {
  return String(value).padStart(PAD_WIDTH, '0');
}

/**
 * 위경도를 기상청 격자 좌표로 바꾼다.
 * @param lat 위도
 * @param lon 경도
 */
export function toKmaGrid(lat: number, lon: number): KmaGrid {
  const re = EARTH_RADIUS_KM / GRID_SPACING_KM;
  const slat1 = STANDARD_LAT_1 * DEG_TO_RAD;
  const slat2 = STANDARD_LAT_2 * DEG_TO_RAD;
  const olat = ORIGIN_LAT * DEG_TO_RAD;
  const quarter = Math.PI * 0.25;
  const snRatio = Math.tan(quarter + slat2 * 0.5) / Math.tan(quarter + slat1 * 0.5);
  const sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(snRatio);
  const sf = (Math.tan(quarter + slat1 * 0.5) ** sn * Math.cos(slat1)) / sn;
  const ro = (re * sf) / Math.tan(quarter + olat * 0.5) ** sn;
  const ra = (re * sf) / Math.tan(quarter + lat * DEG_TO_RAD * 0.5) ** sn;
  let theta = lon * DEG_TO_RAD - ORIGIN_LON * DEG_TO_RAD;
  if (theta > Math.PI) theta -= 2 * Math.PI;
  if (theta < -Math.PI) theta += 2 * Math.PI;
  theta *= sn;
  return {
    nx: Math.floor(ra * Math.sin(theta) + ORIGIN_X + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + ORIGIN_Y + 0.5),
  };
}

/**
 * 지금 조회할 수 있는 가장 최근의 초단기실황 발표 일시를 구한다. (KST 기준)
 * 정각 자료는 10분 뒤부터 제공되므로 그 전에는 한 시간 전 자료를 쓴다.
 * @param nowMs 현재 시각(ms, epoch)
 */
export function getKmaBaseTime(nowMs: number): KmaBaseTime {
  const kst = new Date(nowMs + KST_OFFSET_MS);
  const useDelay = kst.getUTCMinutes() < PUBLISH_DELAY_MINUTES;
  const base = new Date(useDelay ? kst.getTime() - ONE_HOUR_MS : kst.getTime());
  const baseDate = `${base.getUTCFullYear()}${pad2(base.getUTCMonth() + 1)}${pad2(base.getUTCDate())}`;
  return { baseDate, baseTime: `${pad2(base.getUTCHours())}00` };
}

/**
 * 공공데이터포털 서비스키를 요청용으로 정리한다.
 * 포털이 "인코딩된 키"를 주기도 하는데, 쿼리를 만들 때 다시 인코딩되므로 먼저 푼다.
 * @param key 환경변수의 서비스키
 */
export function normalizeServiceKey(key: string): string {
  try {
    return decodeURIComponent(key);
  } catch {
    return key;
  }
}

/** 문자열 관측값을 숫자로 바꾼다. 결측·잘못된 값은 null */
function toValue(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= MISSING_VALUE_MAX) return null;
  return value;
}

/**
 * 초단기실황 응답에서 기온·습도·풍속을 꺼낸다.
 * @param body 기상청 JSON 응답
 * @returns 기온을 알 수 없으면 null (오류 응답 포함)
 */
export function parseKmaObservation(body: unknown): KmaObservation | null {
  const response = (body as { response?: Record<string, unknown> } | null)?.response;
  const items = (response?.body as { items?: { item?: KmaItem[] } } | undefined)?.items?.item;
  if (!Array.isArray(items)) return null;
  const valueOf = (category: string): number | null =>
    toValue(items.find((i) => i.category === category)?.obsrValue);
  const temp = valueOf('T1H');
  if (temp === null) return null;
  return { temp, humidity: valueOf('REH'), windSpeed: valueOf('WSD') };
}
