import { describe, expect, it } from 'vitest';
import {
  buildFcstQuery,
  getUltraBaseTime,
  getVilageBaseTime,
  mergeRainHours,
  parseRainAmount,
  parseUltraRain,
  parseVilageRain,
} from './rainForecastCore.js';

/** KST 시각의 epoch ms */
const kst = (iso: string) => Date.parse(`${iso}:00+09:00`);

/** 기상청 응답 본문을 만든다. */
const body = (item: Record<string, string>[]) => ({ response: { body: { items: { item } } } });

describe('getVilageBaseTime', () => {
  it('발표 10분 뒤부터 그 발표분을 쓴다', () => {
    expect(getVilageBaseTime(kst('2026-11-01T14:10'))).toEqual({
      baseDate: '20261101',
      baseTime: '1400',
    });
  });

  it('발표 10분 전에는 직전 발표분을 쓴다', () => {
    expect(getVilageBaseTime(kst('2026-11-01T14:09'))).toEqual({
      baseDate: '20261101',
      baseTime: '1100',
    });
  });

  it('02시 10분 전에는 전날 23시 발표분을 쓴다', () => {
    expect(getVilageBaseTime(kst('2026-11-01T01:30'))).toEqual({
      baseDate: '20261031',
      baseTime: '2300',
    });
  });

  it('UTC 날짜가 달라도 KST 날짜로 계산한다', () => {
    expect(getVilageBaseTime(Date.parse('2026-10-31T17:30:00Z'))).toEqual({
      baseDate: '20261101',
      baseTime: '0200',
    });
  });
});

describe('getUltraBaseTime', () => {
  it('45분 이후에는 그 시각 30분 발표분을 쓴다', () => {
    expect(getUltraBaseTime(kst('2026-11-01T16:45'))).toEqual({
      baseDate: '20261101',
      baseTime: '1630',
    });
  });

  it('45분 전에는 한 시간 전 30분 발표분을 쓴다', () => {
    expect(getUltraBaseTime(kst('2026-11-01T16:44'))).toEqual({
      baseDate: '20261101',
      baseTime: '1530',
    });
  });

  it('자정 직후에는 전날 23시 30분 발표분을 쓴다', () => {
    expect(getUltraBaseTime(kst('2026-11-01T00:20'))).toEqual({
      baseDate: '20261031',
      baseTime: '2330',
    });
  });
});

describe('buildFcstQuery', () => {
  it('발표 일시와 격자를 담는다', () => {
    const q = buildFcstQuery(
      'KEY',
      { baseDate: '20261101', baseTime: '1400' },
      { nx: 58, ny: 126 },
      50,
    );
    expect(q.get('base_date')).toBe('20261101');
    expect(q.get('base_time')).toBe('1400');
    expect(q.get('nx')).toBe('58');
    expect(q.get('numOfRows')).toBe('50');
    expect(q.get('dataType')).toBe('JSON');
  });
});

describe('parseRainAmount', () => {
  it.each([
    ['강수없음', 0],
    ['1.0mm', 1],
    ['0.2', 0.2],
    ['1mm 미만', 0.5],
    ['1.0mm 미만', 0.5],
    ['30.0~50.0mm', 40],
    ['50.0mm 이상', 50],
  ])('%s → %s', (raw, expected) => {
    expect(parseRainAmount(raw)).toBe(expected);
  });

  it('알 수 없는 문구와 값 없음은 null', () => {
    expect(parseRainAmount('abc')).toBeNull();
    expect(parseRainAmount(undefined)).toBeNull();
  });
});

describe('parseVilageRain', () => {
  const item = (fcstDate: string, fcstTime: string, category: string, fcstValue: string) => ({
    fcstDate,
    fcstTime,
    category,
    fcstValue,
  });

  it('시간별 PCP와 PTY를 묶는다 (다른 항목은 무시한다)', () => {
    const hours = parseVilageRain(
      body([
        item('20261101', '1700', 'TMP', '10'),
        item('20261101', '1700', 'PCP', '1.0mm'),
        item('20261101', '1700', 'PTY', '1'),
        item('20261101', '1800', 'PCP', '강수없음'),
        item('20261101', '1800', 'PTY', '0'),
        item('20261102', '0000', 'PCP', '1mm 미만'),
        item('20261102', '0000', 'PTY', '4'),
      ]),
    );
    expect(hours).toEqual([
      { date: '2026-11-01', hour: 17, precipitation: 1, kind: 'rain' },
      { date: '2026-11-01', hour: 18, precipitation: 0, kind: 'none' },
      { date: '2026-11-02', hour: 0, precipitation: 0.5, kind: 'shower' },
    ]);
  });

  it('눈은 snow, 비/눈은 rain으로 본다', () => {
    const hours = parseVilageRain(
      body([
        item('20261201', '0900', 'PCP', '1.0mm'),
        item('20261201', '0900', 'PTY', '3'),
        item('20261201', '1000', 'PCP', '1.0mm'),
        item('20261201', '1000', 'PTY', '2'),
      ]),
    );
    expect(hours.map((h) => h.kind)).toEqual(['snow', 'rain']);
  });

  it('PTY가 없으면 강수량이 있을 때 rain으로 본다', () => {
    const hours = parseVilageRain(body([item('20261101', '1700', 'PCP', '2.0mm')]));
    expect(hours[0].kind).toBe('rain');
  });

  it('오류 응답이나 형식이 다르면 빈 배열', () => {
    expect(parseVilageRain(null)).toEqual([]);
    expect(parseVilageRain({ response: { header: { resultCode: '03' } } })).toEqual([]);
    expect(parseVilageRain('<xml/>')).toEqual([]);
  });
});

describe('parseUltraRain', () => {
  it('RN1과 PTY(빗방울=비, 눈날림=눈)를 읽는다', () => {
    const hours = parseUltraRain(
      body([
        { fcstDate: '20261101', fcstTime: '1700', category: 'RN1', fcstValue: '0.5mm' },
        { fcstDate: '20261101', fcstTime: '1700', category: 'PTY', fcstValue: '5' },
        { fcstDate: '20261101', fcstTime: '1800', category: 'RN1', fcstValue: '강수없음' },
        { fcstDate: '20261101', fcstTime: '1800', category: 'PTY', fcstValue: '7' },
      ]),
    );
    expect(hours).toEqual([
      { date: '2026-11-01', hour: 17, precipitation: 0.5, kind: 'rain' },
      { date: '2026-11-01', hour: 18, precipitation: 0, kind: 'snow' },
    ]);
  });
});

describe('mergeRainHours', () => {
  it('같은 시간은 초단기예보를 쓰고, 날짜·시간 순으로 정렬한다', () => {
    const vilage = [
      { date: '2026-11-02', hour: 1, precipitation: 0, kind: 'none' as const },
      { date: '2026-11-01', hour: 17, precipitation: 0.5, kind: 'rain' as const },
      { date: '2026-11-01', hour: 18, precipitation: 0.5, kind: 'rain' as const },
    ];
    const ultra = [{ date: '2026-11-01', hour: 17, precipitation: 1.5, kind: 'rain' as const }];
    expect(mergeRainHours(vilage, ultra)).toEqual([
      { date: '2026-11-01', hour: 17, precipitation: 1.5, kind: 'rain' },
      { date: '2026-11-01', hour: 18, precipitation: 0.5, kind: 'rain' },
      { date: '2026-11-02', hour: 1, precipitation: 0, kind: 'none' },
    ]);
  });
});
