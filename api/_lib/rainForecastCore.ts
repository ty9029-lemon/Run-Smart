import type { RainForecastHour, RainKind } from '../../src/lib/rainForecast.js';
import type { KmaGrid } from './kmaCore.js';

/** 기상청 단기예보 조회서비스: 단기예보(3일, 3시간 간격 발표) */
export const KMA_VILAGE_FCST_URL =
  'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
/** 기상청 단기예보 조회서비스: 초단기예보(향후 6시간, 매시 30분 발표) */
export const KMA_ULTRA_FCST_URL =
  'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst';
/** 기상청 예보 요청 제한 시간(ms) */
export const KMA_FCST_TIMEOUT_MS = 4000;
/** 단기예보 응답 행 수 (3일치 12개 항목 × 시간)를 넉넉히 받는다 */
export const KMA_VILAGE_ROWS = 1000;
/** 초단기예보 응답 행 수 (6시간 × 10개 항목) */
export const KMA_ULTRA_ROWS = 100;

/** 단기예보 발표 시각(시) */
const VILAGE_BASE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23];
/** 단기예보가 발표 후 API에 반영되기까지 걸리는 분 */
const VILAGE_DELAY_MINUTES = 10;
/** 초단기예보가 발표 후 API에 반영되기까지 걸리는 분 (매시 30분 발표, 45분부터 제공) */
const ULTRA_DELAY_MINUTES = 45;
/** 초단기예보 발표 분 */
const ULTRA_BASE_MINUTE = '30';
/** 한국 표준시(UTC+9)의 밀리초 오프셋 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const PAD_WIDTH = 2;
/** "1mm 미만"처럼 구체 값이 없는 약한 비를 나타내는 강수량(mm) */
const LIGHT_RAIN_MM = 0.5;
/** "30.0~50.0mm"처럼 범위로 주는 강수량의 구분자 */
const RANGE_SEPARATOR = '~';

/** 기상청 예보 발표 기준 일시 */
export interface KmaFcstBase {
  /** "20261101" */
  baseDate: string;
  /** "1400" */
  baseTime: string;
}

/** 기상청 응답의 항목 중 사용하는 필드 */
interface FcstItem {
  category?: string;
  fcstDate?: string;
  fcstTime?: string;
  fcstValue?: string;
}

function pad2(value: number): string {
  return String(value).padStart(PAD_WIDTH, '0');
}

/** KST 시각을 "YYYYMMDD"와 시(0~23)로 나눈다. */
function kstParts(ms: number): { date: string; hour: number; minute: number } {
  const kst = new Date(ms + KST_OFFSET_MS);
  return {
    date: `${kst.getUTCFullYear()}${pad2(kst.getUTCMonth() + 1)}${pad2(kst.getUTCDate())}`,
    hour: kst.getUTCHours(),
    minute: kst.getUTCMinutes(),
  };
}

/**
 * 지금 조회할 수 있는 가장 최근의 단기예보 발표 일시를 구한다. (KST 기준)
 * 02시 10분 전에는 전날 23시 발표분을 쓴다.
 * @param nowMs 현재 시각(ms, epoch)
 */
export function getVilageBaseTime(nowMs: number): KmaFcstBase {
  const { date, hour, minute } = kstParts(nowMs);
  const available = VILAGE_BASE_HOURS.filter(
    (h) => h < hour || (h === hour && minute >= VILAGE_DELAY_MINUTES),
  );
  if (available.length > 0) {
    return { baseDate: date, baseTime: `${pad2(available[available.length - 1])}00` };
  }
  const yesterday = kstParts(nowMs - 24 * ONE_HOUR_MS).date;
  return { baseDate: yesterday, baseTime: '2300' };
}

/**
 * 지금 조회할 수 있는 가장 최근의 초단기예보 발표 일시를 구한다. (KST 기준)
 * 매시 30분 발표분이 45분부터 제공되므로 그 전에는 한 시간 전 발표분을 쓴다.
 * @param nowMs 현재 시각(ms, epoch)
 */
export function getUltraBaseTime(nowMs: number): KmaFcstBase {
  const { minute } = kstParts(nowMs);
  const base = kstParts(minute < ULTRA_DELAY_MINUTES ? nowMs - ONE_HOUR_MS : nowMs);
  return { baseDate: base.date, baseTime: `${pad2(base.hour)}${ULTRA_BASE_MINUTE}` };
}

/**
 * 예보 조회 쿼리를 만든다.
 * @param serviceKey 정리된 서비스키
 * @param base 발표 기준 일시
 * @param grid 격자 좌표
 * @param rows 응답 행 수
 */
export function buildFcstQuery(
  serviceKey: string,
  base: KmaFcstBase,
  grid: KmaGrid,
  rows: number,
): URLSearchParams {
  return new URLSearchParams({
    serviceKey,
    pageNo: '1',
    numOfRows: String(rows),
    dataType: 'JSON',
    base_date: base.baseDate,
    base_time: base.baseTime,
    nx: String(grid.nx),
    ny: String(grid.ny),
  });
}

/**
 * 예보의 강수량 문구를 mm 숫자로 바꾼다.
 * "강수없음"=0, "1.0mm"=1, "1mm 미만"=약한 비(0.5), "30.0~50.0mm"=가운데 값, "50.0mm 이상"=그 값.
 * 알 수 없는 문구는 null
 * @param raw 기상청 PCP·RN1 값
 */
export function parseRainAmount(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const text = raw.trim();
  if (text === '' || text === '강수없음') return 0;
  if (text.includes('미만')) return LIGHT_RAIN_MM;
  const numbers = text
    .replace('mm', '')
    .replace('이상', '')
    .split(RANGE_SEPARATOR)
    .map((part) => Number(part.trim()));
  if (numbers.length === 0 || numbers.some((n) => !Number.isFinite(n) || n < 0)) return null;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/** 단기예보 PTY(0 없음, 1 비, 2 비/눈, 3 눈, 4 소나기) → 강수 형태 */
const VILAGE_PTY: Record<string, RainKind> = {
  '0': 'none',
  '1': 'rain',
  '2': 'rain',
  '3': 'snow',
  '4': 'shower',
};
/** 초단기예보 PTY(0 없음, 1 비, 2 비/눈, 3 눈, 5 빗방울, 6 빗방울눈날림, 7 눈날림) → 강수 형태 */
const ULTRA_PTY: Record<string, RainKind> = {
  '0': 'none',
  '1': 'rain',
  '2': 'rain',
  '3': 'snow',
  '5': 'rain',
  '6': 'rain',
  '7': 'snow',
};

/** "20261101" → "2026-11-01" */
function toIsoDate(yyyymmdd: string): string {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

/**
 * 예보 응답에서 시간별 강수량과 강수 형태를 꺼낸다.
 * @param body 기상청 JSON 응답
 * @param amountCategory 강수량 항목 (단기예보 PCP, 초단기예보 RN1)
 * @param ptyMap 강수 형태 코드 표
 * @returns 응답이 오류이거나 형식이 다르면 빈 배열
 */
export function parseRainHours(
  body: unknown,
  amountCategory: 'PCP' | 'RN1',
  ptyMap: Record<string, RainKind>,
): RainForecastHour[] {
  const response = (body as { response?: Record<string, unknown> } | null)?.response;
  const items = (response?.body as { items?: { item?: FcstItem[] } } | undefined)?.items?.item;
  if (!Array.isArray(items)) return [];
  const slots = new Map<string, { date: string; hour: number; amount?: number; kind?: RainKind }>();
  for (const item of items) {
    const { category, fcstDate, fcstTime, fcstValue } = item;
    if (!fcstDate || !fcstTime || (category !== amountCategory && category !== 'PTY')) continue;
    const key = `${fcstDate}${fcstTime}`;
    const slot = slots.get(key) ?? {
      date: toIsoDate(fcstDate),
      hour: Number(fcstTime.slice(0, PAD_WIDTH)),
    };
    if (category === 'PTY') slot.kind = ptyMap[String(fcstValue)];
    else slot.amount = parseRainAmount(fcstValue) ?? undefined;
    slots.set(key, slot);
  }
  return [...slots.values()]
    .filter((s) => s.amount !== undefined && Number.isFinite(s.hour))
    .map((s) => ({
      date: s.date,
      hour: s.hour,
      precipitation: s.amount as number,
      kind: s.kind ?? (s.amount ? 'rain' : 'none'),
    }));
}

/** 단기예보 응답을 시간별 강수 예보로 바꾼다. */
export function parseVilageRain(body: unknown): RainForecastHour[] {
  return parseRainHours(body, 'PCP', VILAGE_PTY);
}

/** 초단기예보 응답을 시간별 강수 예보로 바꾼다. */
export function parseUltraRain(body: unknown): RainForecastHour[] {
  return parseRainHours(body, 'RN1', ULTRA_PTY);
}

/**
 * 단기예보와 초단기예보를 합친다. 같은 시간이면 가까운 시간을 더 잘 맞히는 초단기예보를 쓴다.
 * @param vilage 단기예보 시간들
 * @param ultra 초단기예보 시간들
 */
export function mergeRainHours(
  vilage: RainForecastHour[],
  ultra: RainForecastHour[],
): RainForecastHour[] {
  const merged = new Map<string, RainForecastHour>();
  for (const h of vilage) merged.set(`${h.date}#${h.hour}`, h);
  for (const h of ultra) merged.set(`${h.date}#${h.hour}`, h);
  return [...merged.values()].sort((a, b) =>
    a.date === b.date ? a.hour - b.hour : a.date.localeCompare(b.date),
  );
}
