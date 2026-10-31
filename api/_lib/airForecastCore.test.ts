import { describe, expect, it } from 'vitest';
import {
  buildForecastQuery,
  formatKstDate,
  parseForecastDays,
  parseNearestAddress,
  resolveForecastRegion,
} from './airForecastCore.js';

/** 응답 JSON을 만든다. */
function wrap(items: unknown): unknown {
  return { response: { body: { items } } };
}

describe('formatKstDate', () => {
  it('UTC 자정 직전도 한국 날짜로 바꾼다', () => {
    // 2026-10-30 16:00 UTC = 2026-10-31 01:00 KST
    expect(formatKstDate(Date.UTC(2026, 9, 30, 16))).toBe('2026-10-31');
  });
});

describe('buildForecastQuery', () => {
  it('PM10과 조회 날짜를 담는다', () => {
    const query = new URLSearchParams(buildForecastQuery('KEY', '2026-10-31'));
    expect(query.get('InformCode')).toBe('PM10');
    expect(query.get('searchDate')).toBe('2026-10-31');
    expect(query.get('returnType')).toBe('json');
  });
});

describe('parseNearestAddress', () => {
  it('가장 가까운(첫 번째) 측정소의 주소를 꺼낸다', () => {
    const json = wrap([{ addr: '서울 강서구 화곡로 1' }, { addr: '서울 양천구 1' }]);
    expect(parseNearestAddress(json)).toBe('서울 강서구 화곡로 1');
  });

  it('없거나 형식이 다르면 null', () => {
    expect(parseNearestAddress({})).toBeNull();
    expect(parseNearestAddress(wrap([{ addr: '' }]))).toBeNull();
  });
});

describe('resolveForecastRegion', () => {
  it('시·도 이름으로 예보 지역을 정한다', () => {
    expect(resolveForecastRegion('서울 강서구 화곡로', 126.87)).toBe('서울');
    expect(resolveForecastRegion('충남 천안시', 127.1)).toBe('충남');
    expect(resolveForecastRegion('제주 제주시', 126.5)).toBe('제주');
  });

  it('경기는 시·군에 따라 남부·북부로 나눈다', () => {
    expect(resolveForecastRegion('경기 고양시 일산서구', 126.77)).toBe('경기북부');
    expect(resolveForecastRegion('경기 수원시 영통구', 127.05)).toBe('경기남부');
    expect(resolveForecastRegion('경기 김포시', 126.7)).toBe('경기남부');
  });

  it('강원은 경도로 영서·영동을 나눈다', () => {
    expect(resolveForecastRegion('강원 춘천시', 127.73)).toBe('강원영서');
    expect(resolveForecastRegion('강원 강릉시', 128.9)).toBe('강원영동');
  });

  it('알 수 없는 지역이면 null', () => {
    expect(resolveForecastRegion('북한 어딘가', 127)).toBeNull();
  });
});

describe('parseForecastDays', () => {
  const GRADES = '서울 : 나쁨,제주 : 좋음,경기남부 : 보통';

  it('한 지역의 날짜별 등급을 날짜순으로 꺼낸다', () => {
    const json = wrap([
      { dataTime: '2026-10-31 11시 발표', informData: '2026-11-01', informGrade: GRADES },
      { dataTime: '2026-10-31 11시 발표', informData: '2026-10-31', informGrade: GRADES },
    ]);
    expect(parseForecastDays(json, '서울')).toEqual([
      { date: '2026-10-31', grade: '나쁨' },
      { date: '2026-11-01', grade: '나쁨' },
    ]);
    expect(parseForecastDays(json, '제주')[0].grade).toBe('좋음');
  });

  it('같은 날짜에 발표가 여러 번이면 가장 늦은 발표를 쓴다', () => {
    const json = wrap([
      { dataTime: '2026-10-31 05시 발표', informData: '2026-11-01', informGrade: '서울 : 보통' },
      { dataTime: '2026-10-31 17시 발표', informData: '2026-11-01', informGrade: '서울 : 나쁨' },
      { dataTime: '2026-10-31 11시 발표', informData: '2026-11-01', informGrade: '서울 : 좋음' },
    ]);
    expect(parseForecastDays(json, '서울')).toEqual([{ date: '2026-11-01', grade: '나쁨' }]);
  });

  it('지역이 없거나 등급이 알 수 없는 값이면 제외한다', () => {
    const json = wrap([
      { dataTime: '2026-10-31 11시 발표', informData: '2026-11-01', informGrade: '서울 : 나쁨' },
      { dataTime: '2026-10-31 11시 발표', informData: '2026-11-02', informGrade: '서울 : 알수없음' },
    ]);
    expect(parseForecastDays(json, '부산')).toEqual([]);
    expect(parseForecastDays(json, '서울')).toEqual([{ date: '2026-11-01', grade: '나쁨' }]);
  });

  it('형식이 다르면 빈 배열', () => {
    expect(parseForecastDays({}, '서울')).toEqual([]);
  });
});
