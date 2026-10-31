import { describe, expect, it } from 'vitest';
import {
  AIRKOREA_MAX_AGE_MS,
  buildNearbyQuery,
  buildRealtimeQuery,
  parseNearbyStations,
  parseRealtime,
  toTm,
} from './airKoreaCore.js';

/** 2026-10-31 10:30 KST */
const NOW = Date.UTC(2026, 9, 31, 1, 30);

/** 응답 JSON을 만든다. */
function wrap(items: unknown): unknown {
  return { response: { body: { items } } };
}

describe('toTm', () => {
  it('서울 시청 좌표는 중부원점 TM 약 (198050, 551840)', () => {
    const { tmX, tmY } = toTm(37.5665, 126.978);
    expect(tmX).toBeGreaterThan(197500);
    expect(tmX).toBeLessThan(198600);
    expect(tmY).toBeGreaterThan(551300);
    expect(tmY).toBeLessThan(552400);
  });

  it('원점(38°N, 127°E)은 위양 좌표(200000, 600000)', () => {
    expect(toTm(38, 127)).toEqual({ tmX: 200000, tmY: 600000 });
  });
});

describe('쿼리', () => {
  it('근접측정소 쿼리에 TM 좌표가 들어간다', () => {
    const query = new URLSearchParams(buildNearbyQuery('KEY', { tmX: 1, tmY: 2 }));
    expect(query.get('tmX')).toBe('1');
    expect(query.get('tmY')).toBe('2');
    expect(query.get('returnType')).toBe('json');
  });

  it('실시간 쿼리에 한글 측정소 이름이 그대로 복원된다', () => {
    const query = new URLSearchParams(buildRealtimeQuery('KEY', '마포구'));
    expect(query.get('stationName')).toBe('마포구');
  });
});

describe('parseNearbyStations', () => {
  it('가까운 순으로 측정소 이름을 개수만큼 꺼낸다', () => {
    const json = wrap([
      { stationName: '강서구' },
      { stationName: '양천구' },
      { stationName: '마포구' },
      { stationName: '영등포구' },
    ]);
    expect(parseNearbyStations(json)).toEqual(['강서구', '양천구', '마포구']);
  });

  it('형식이 다르면 빈 배열', () => {
    expect(parseNearbyStations({})).toEqual([]);
    expect(parseNearbyStations(wrap('x'))).toEqual([]);
  });
});

describe('parseRealtime', () => {
  it('가장 최근 유효값을 돌려준다', () => {
    const json = wrap([
      { dataTime: '2026-10-31 10:00', pm10Value: '94', pm25Value: '35' },
      { dataTime: '2026-10-31 09:00', pm10Value: '101', pm25Value: '36' },
    ]);
    expect(parseRealtime(json, '마포구', NOW)).toEqual({
      pm10: 94,
      pm25: 35,
      stationName: '마포구',
      dataTime: '2026-10-31 10:00',
    });
  });

  it("최신 행의 PM10이 '-'이면 이전 행으로 넘어가고, PM2.5 결측은 null", () => {
    const json = wrap([
      { dataTime: '2026-10-31 10:00', pm10Value: '-', pm25Value: '-' },
      { dataTime: '2026-10-31 09:00', pm10Value: '101', pm25Value: '-' },
    ]);
    expect(parseRealtime(json, '마포구', NOW)?.pm10).toBe(101);
    expect(parseRealtime(json, '마포구', NOW)?.pm25).toBeNull();
  });

  it('PM10이 모두 결측이면 null (0으로 바꾸지 않는다)', () => {
    const json = wrap([{ dataTime: '2026-10-31 10:00', pm10Value: null }]);
    expect(parseRealtime(json, '마포구', NOW)).toBeNull();
  });

  it('너무 오래된 값은 쓰지 않는다', () => {
    const json = wrap([{ dataTime: '2026-10-31 02:00', pm10Value: '94' }]);
    expect(NOW - Date.UTC(2026, 9, 30, 17)).toBeGreaterThan(AIRKOREA_MAX_AGE_MS);
    expect(parseRealtime(json, '마포구', NOW)).toBeNull();
  });

  it('24:00 표기는 다음 날 0시로 처리한다', () => {
    const json = wrap([{ dataTime: '2026-10-31 24:00', pm10Value: '50' }]);
    const midnight = Date.UTC(2026, 10, 1, 0, 30) - 9 * 60 * 60 * 1000;
    expect(parseRealtime(json, '마포구', midnight)?.pm10).toBe(50);
  });
});
