/** 에어코리아(한국환경공단) 대기오염정보: 대기질 예보통보 조회 */
export const AIRKOREA_FORECAST_URL =
  'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMinuDustFrcstDspth';
/** 예보통보 요청 제한 시간(ms) */
export const AIRKOREA_FORECAST_TIMEOUT_MS = 5000;

/** 한국 표준시(UTC+9)의 밀리초 오프셋 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
/** 날짜 문자열 자릿수 */
const PAD_WIDTH = 2;
/** 예보통보 한 번에 받는 행 수. 오늘·내일·모레 예보가 발표 시각별로 여러 건 온다 */
const FORECAST_ROWS = 40;
/** 경기도를 남부·북부로 나누는 예보 지역 이름 */
const GYEONGGI_NORTH = '경기북부';
const GYEONGGI_SOUTH = '경기남부';
/** 강원도를 영서·영동으로 나누는 경도 (이 값 이상이면 영동) */
const GANGWON_EAST_MIN_LON = 128.45;
/** 경기북부 예보 지역에 속하는 시·군 */
const GYEONGGI_NORTH_CITIES = [
  '고양',
  '구리',
  '남양주',
  '동두천',
  '양주',
  '연천',
  '의정부',
  '파주',
  '포천',
  '가평',
];
/** 주소 앞머리 → 예보 지역 이름. 경기·강원은 나눠서 따로 정한다 */
const SIDO_REGION: Record<string, string> = {
  서울: '서울',
  인천: '인천',
  부산: '부산',
  대구: '대구',
  광주: '광주',
  대전: '대전',
  울산: '울산',
  세종: '세종',
  충북: '충북',
  충남: '충남',
  전북: '전북',
  전남: '전남',
  경북: '경북',
  경남: '경남',
  제주: '제주',
};

/** 예보 등급 */
export type ForecastGrade = '좋음' | '보통' | '나쁨' | '매우나쁨';

/** 하루의 PM10 예보 등급 */
export interface ForecastDay {
  /** 예보 대상 날짜 (YYYY-MM-DD, KST) */
  date: string;
  grade: ForecastGrade;
}

/** /api/air-forecast 응답 */
export interface AirForecast {
  /** 서버가 보는 오늘 날짜 (YYYY-MM-DD, KST). 클라이언트가 예보 날짜와의 차이를 계산한다 */
  today: string;
  days: ForecastDay[];
}

/** 2자리로 맞춘다. */
function pad2(value: number): string {
  return String(value).padStart(PAD_WIDTH, '0');
}

/**
 * 시각(ms)을 한국 날짜 문자열("2026-10-31")로 바꾼다.
 * @param now 현재 시각(ms)
 */
export function formatKstDate(now: number): string {
  const kst = new Date(now + KST_OFFSET_MS);
  return `${kst.getUTCFullYear()}-${pad2(kst.getUTCMonth() + 1)}-${pad2(kst.getUTCDate())}`;
}

/**
 * 예보통보 조회 쿼리를 만든다. (PM10, 오늘 날짜 발표분)
 * @param serviceKey 정리된 서비스키
 * @param searchDate 조회 날짜 (YYYY-MM-DD)
 */
export function buildForecastQuery(serviceKey: string, searchDate: string): string {
  return new URLSearchParams({
    serviceKey,
    returnType: 'json',
    numOfRows: String(FORECAST_ROWS),
    pageNo: '1',
    searchDate,
    InformCode: 'PM10',
  }).toString();
}

/** 응답 본문에서 items 배열을 꺼낸다. 형식이 다르면 빈 배열 */
function extractItems(json: unknown): Record<string, unknown>[] {
  const items = (json as { response?: { body?: { items?: unknown } } })?.response?.body?.items;
  return Array.isArray(items) ? (items as Record<string, unknown>[]) : [];
}

/**
 * 근접측정소 응답에서 가장 가까운 측정소의 주소를 꺼낸다.
 * @param json 근접측정소 응답 JSON
 * @returns 예: "서울 강서구 화곡로 ...". 없으면 null
 */
export function parseNearestAddress(json: unknown): string | null {
  const addr = extractItems(json)[0]?.addr;
  return typeof addr === 'string' && addr.trim() ? addr.trim() : null;
}

/**
 * 주소와 좌표로 예보 지역 이름을 정한다. (예: "서울", "경기남부", "강원영동")
 * @param addr 측정소 주소 ("경기 고양시 ...")
 * @param lon 경도 (강원도의 영서·영동 구분에 쓴다)
 * @returns 알 수 없는 지역이면 null
 */
export function resolveForecastRegion(addr: string, lon: number): string | null {
  const [sido = '', sigungu = ''] = addr.split(/\s+/);
  const key = sido.slice(0, PAD_WIDTH);
  if (key === '경기') {
    const isNorth = GYEONGGI_NORTH_CITIES.some((city) => sigungu.startsWith(city));
    return isNorth ? GYEONGGI_NORTH : GYEONGGI_SOUTH;
  }
  if (key === '강원') return lon >= GANGWON_EAST_MIN_LON ? '강원영동' : '강원영서';
  return SIDO_REGION[key] ?? null;
}

/** "서울 : 나쁨,제주 : 보통" 형태의 지역별 등급 문자열에서 한 지역의 등급을 꺼낸다. */
function gradeOfRegion(informGrade: string, region: string): ForecastGrade | null {
  for (const part of informGrade.split(',')) {
    const [name, grade] = part.split(':').map((text) => text.trim());
    if (name === region && isForecastGrade(grade)) return grade;
  }
  return null;
}

/** 예보 등급 문자열인지 확인한다. */
function isForecastGrade(value: unknown): value is ForecastGrade {
  return value === '좋음' || value === '보통' || value === '나쁨' || value === '매우나쁨';
}

/**
 * 예보통보 응답에서 한 지역의 날짜별 PM10 예보 등급을 꺼낸다.
 * 같은 날짜에 발표가 여러 번 있으면 가장 늦게 발표한 것을 쓴다.
 * @param json 예보통보 응답 JSON
 * @param region 예보 지역 이름
 */
export function parseForecastDays(json: unknown, region: string): ForecastDay[] {
  const latest = new Map<string, { dataTime: string; grade: ForecastGrade }>();
  for (const item of extractItems(json)) {
    const date = typeof item.informData === 'string' ? item.informData : '';
    const dataTime = typeof item.dataTime === 'string' ? item.dataTime : '';
    const grade = typeof item.informGrade === 'string' ? gradeOfRegion(item.informGrade, region) : null;
    if (!date || !grade) continue;
    const prev = latest.get(date);
    if (!prev || dataTime > prev.dataTime) latest.set(date, { dataTime, grade });
  }
  return [...latest.entries()]
    .map(([date, { grade }]) => ({ date, grade }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
