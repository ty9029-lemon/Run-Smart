/** 에어코리아(한국환경공단) 대기오염정보: 근접측정소 조회 */
export const AIRKOREA_NEARBY_URL =
  'https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getNearbyMsrstnList';
/** 에어코리아 대기오염정보: 측정소별 실시간 측정정보 조회 */
export const AIRKOREA_REALTIME_URL =
  'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';
/** 에어코리아 요청 제한 시간(ms) */
export const AIRKOREA_TIMEOUT_MS = 4000;
/** 가까운 순으로 시도할 측정소 수. 앞 측정소가 점검·결측이면 다음으로 넘어간다 */
export const AIRKOREA_STATION_COUNT = 3;
/** 이 시간(ms)보다 오래된 측정값은 실측으로 쓰지 않는다 */
export const AIRKOREA_MAX_AGE_MS = 3 * 60 * 60 * 1000;

/** 한국 표준시(UTC+9)의 밀리초 오프셋 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
/** 최근 시간 자료를 받기 위한 행 수 (최신순으로 오므로 몇 시간치면 충분하다) */
const REALTIME_ROWS = 6;
/** 이 값 미만의 농도는 결측으로 본다 */
const MIN_VALID_CONCENTRATION = 0;

/** GRS80 타원체 장반경(m) */
const SEMI_MAJOR_AXIS = 6378137;
/** GRS80 편평률 */
const FLATTENING = 1 / 298.257222101;
/** 중부원점(EPSG:5186) 도법 상수 */
const TM_ORIGIN_LAT = 38;
const TM_ORIGIN_LON = 127;
const TM_FALSE_EASTING = 200000;
const TM_FALSE_NORTHING = 600000;
const DEG_TO_RAD = Math.PI / 180;

/** TM 좌표(m) */
export interface TmCoords {
  tmX: number;
  tmY: number;
}

/** 에어코리아 실측값 (/api/air-now 응답). PM2.5는 없을 수 있다 */
export interface AirObservation {
  pm10: number;
  pm25: number | null;
  stationName: string;
  /** 측정 시각 ("2026-10-31 10:00", KST) */
  dataTime: string;
}

/** 자오선 호장(m)을 구한다. */
function meridianArc(phi: number, e2: number): number {
  const e4 = e2 * e2;
  const e6 = e4 * e2;
  return (
    SEMI_MAJOR_AXIS *
    ((1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256) * phi -
      ((3 * e2) / 8 + (3 * e4) / 32 + (45 * e6) / 1024) * Math.sin(2 * phi) +
      ((15 * e4) / 256 + (45 * e6) / 1024) * Math.sin(4 * phi) -
      ((35 * e6) / 3072) * Math.sin(6 * phi))
  );
}

/**
 * 위경도(WGS84)를 에어코리아 근접측정소 조회용 중부원점 TM 좌표로 바꾼다.
 * @param lat 위도
 * @param lon 경도
 */
export function toTm(lat: number, lon: number): TmCoords {
  const e2 = FLATTENING * (2 - FLATTENING);
  const ep2 = e2 / (1 - e2);
  const phi = lat * DEG_TO_RAD;
  const sin = Math.sin(phi);
  const cos = Math.cos(phi);
  const n = SEMI_MAJOR_AXIS / Math.sqrt(1 - e2 * sin * sin);
  const t = (sin / cos) ** 2;
  const c = ep2 * cos * cos;
  const a = (lon - TM_ORIGIN_LON) * DEG_TO_RAD * cos;
  const m = meridianArc(phi, e2) - meridianArc(TM_ORIGIN_LAT * DEG_TO_RAD, e2);
  const tmX =
    TM_FALSE_EASTING +
    n *
      (a +
        ((1 - t + c) * a ** 3) / 6 +
        ((5 - 18 * t + t * t + 72 * c - 58 * ep2) * a ** 5) / 120);
  const tmY =
    TM_FALSE_NORTHING +
    m +
    n *
      (sin / cos) *
      ((a * a) / 2 +
        ((5 - t + 9 * c + 4 * c * c) * a ** 4) / 24 +
        ((61 - 58 * t + t * t + 600 * c - 330 * ep2) * a ** 6) / 720);
  return { tmX: Math.round(tmX), tmY: Math.round(tmY) };
}

/**
 * 근접측정소 조회 쿼리를 만든다.
 * @param serviceKey 정리된 서비스키
 * @param tm TM 좌표
 */
export function buildNearbyQuery(serviceKey: string, tm: TmCoords): string {
  return new URLSearchParams({
    serviceKey,
    returnType: 'json',
    tmX: String(tm.tmX),
    tmY: String(tm.tmY),
    ver: '1.1',
  }).toString();
}

/**
 * 측정소별 실시간 측정정보 조회 쿼리를 만든다.
 * @param serviceKey 정리된 서비스키
 * @param stationName 측정소 이름
 */
export function buildRealtimeQuery(serviceKey: string, stationName: string): string {
  return new URLSearchParams({
    serviceKey,
    returnType: 'json',
    stationName,
    dataTerm: 'DAILY',
    pageNo: '1',
    numOfRows: String(REALTIME_ROWS),
    ver: '1.3',
  }).toString();
}

/** 응답 본문에서 items 배열을 꺼낸다. 형식이 다르면 빈 배열 */
function extractItems(json: unknown): Record<string, unknown>[] {
  const items = (json as { response?: { body?: { items?: unknown } } })?.response?.body?.items;
  return Array.isArray(items) ? (items as Record<string, unknown>[]) : [];
}

/**
 * 근접측정소 응답에서 가까운 순으로 측정소 이름을 꺼낸다.
 * @param json 응답 JSON
 * @param count 최대 개수
 */
export function parseNearbyStations(json: unknown, count = AIRKOREA_STATION_COUNT): string[] {
  return extractItems(json)
    .map((item) => item.stationName)
    .filter((name): name is string => typeof name === 'string' && name.length > 0)
    .slice(0, count);
}

/** 농도 문자열을 숫자로 바꾼다. "-"·null·점검 등 결측은 null (0으로 바꾸지 않는다) */
function toConcentration(raw: unknown): number | null {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  const value = Number(raw);
  if (raw === '' || !Number.isFinite(value) || value < MIN_VALID_CONCENTRATION) return null;
  return value;
}

/** "2026-10-31 10:00" (KST)를 UTC 밀리초로 바꾼다. 24:00 표기도 다음 날 0시로 처리된다 */
function parseDataTime(dataTime: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(dataTime);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  return Date.UTC(year, month - 1, day, hour, minute) - KST_OFFSET_MS;
}

/**
 * 실시간 측정정보 응답에서 가장 최근의 유효한 PM10 실측값을 고른다.
 * PM10이 결측이거나 너무 오래된 자료만 있으면 null
 * @param json 응답 JSON
 * @param stationName 측정소 이름
 * @param now 현재 시각(ms), 테스트용
 */
export function parseRealtime(
  json: unknown,
  stationName: string,
  now: number = Date.now(),
): AirObservation | null {
  for (const item of extractItems(json)) {
    const pm10 = toConcentration(item.pm10Value);
    const dataTime = typeof item.dataTime === 'string' ? item.dataTime : '';
    const measuredAt = parseDataTime(dataTime);
    if (pm10 === null || measuredAt === null) continue;
    if (now - measuredAt > AIRKOREA_MAX_AGE_MS) return null;
    return { pm10, pm25: toConcentration(item.pm25Value), stationName, dataTime };
  }
  return null;
}
