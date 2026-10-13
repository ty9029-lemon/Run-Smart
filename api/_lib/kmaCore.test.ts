import { describe, expect, it } from 'vitest';
import {
  getKmaBaseTime,
  normalizeServiceKey,
  parseKmaObservation,
  toKmaGrid,
} from './kmaCore.js';

/** KST 시각을 epoch ms로 만든다. */
function kst(iso: string): number {
  return Date.parse(`${iso}:00+09:00`);
}

/** 기상청 응답 모양을 만든다. */
function kmaBody(items: { category: string; obsrValue: string }[]) {
  return { response: { header: { resultCode: '00' }, body: { items: { item: items } } } };
}

describe('toKmaGrid', () => {
  it('서울 강남 좌표를 격자 (61, 125)로 바꾼다', () => {
    expect(toKmaGrid(37.4979, 127.0276)).toEqual({ nx: 61, ny: 125 });
  });

  it('서울 시청 좌표를 격자 (60, 127)로 바꾼다', () => {
    expect(toKmaGrid(37.5665, 126.978)).toEqual({ nx: 60, ny: 127 });
  });

  it('부산 좌표를 격자 (98, 76)으로 바꾼다', () => {
    expect(toKmaGrid(35.1796, 129.0756)).toEqual({ nx: 98, ny: 76 });
  });
});

describe('getKmaBaseTime', () => {
  it('정각 10분 이후에는 그 시각 자료를 쓴다', () => {
    expect(getKmaBaseTime(kst('2026-10-13T11:10'))).toEqual({
      baseDate: '20261013',
      baseTime: '1100',
    });
  });

  it('정각 10분 전에는 한 시간 전 자료를 쓴다', () => {
    expect(getKmaBaseTime(kst('2026-10-13T11:09'))).toEqual({
      baseDate: '20261013',
      baseTime: '1000',
    });
  });

  it('자정 직후에는 전날 23시 자료를 쓴다', () => {
    expect(getKmaBaseTime(kst('2026-10-13T00:05'))).toEqual({
      baseDate: '20261012',
      baseTime: '2300',
    });
  });

  it('UTC 기준 날짜가 달라도 KST 날짜로 계산한다', () => {
    // KST 2026-10-13 08:30 = UTC 2026-10-12 23:30
    expect(getKmaBaseTime(Date.parse('2026-10-12T23:30:00Z'))).toEqual({
      baseDate: '20261013',
      baseTime: '0800',
    });
  });
});

describe('parseKmaObservation', () => {
  it('기온·습도·풍속을 숫자로 꺼낸다', () => {
    const body = kmaBody([
      { category: 'T1H', obsrValue: '19.4' },
      { category: 'REH', obsrValue: '72' },
      { category: 'WSD', obsrValue: '1.8' },
    ]);
    expect(parseKmaObservation(body)).toEqual({ temp: 19.4, humidity: 72, windSpeed: 1.8 });
  });

  it('습도·풍속이 없어도 기온이 있으면 돌려준다', () => {
    const body = kmaBody([{ category: 'T1H', obsrValue: '-3.2' }]);
    expect(parseKmaObservation(body)).toEqual({ temp: -3.2, humidity: null, windSpeed: null });
  });

  it('기온이 결측(-999)이면 null', () => {
    expect(parseKmaObservation(kmaBody([{ category: 'T1H', obsrValue: '-999' }]))).toBeNull();
  });

  it('오류 응답이나 형식이 다르면 null', () => {
    expect(parseKmaObservation(null)).toBeNull();
    expect(parseKmaObservation({ response: { header: { resultCode: '03' } } })).toBeNull();
    expect(parseKmaObservation('<xml/>')).toBeNull();
  });
});

describe('normalizeServiceKey', () => {
  it('인코딩된 키는 풀어 준다', () => {
    expect(normalizeServiceKey('abc%2Bdef%3D%3D')).toBe('abc+def==');
  });

  it('이미 풀린 키는 그대로 둔다', () => {
    expect(normalizeServiceKey('abc+def==')).toBe('abc+def==');
  });

  it('잘못된 인코딩은 원본을 돌려준다', () => {
    expect(normalizeServiceKey('abc%zz')).toBe('abc%zz');
  });
});
