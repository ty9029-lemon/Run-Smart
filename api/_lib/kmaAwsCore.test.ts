import { describe, expect, it } from 'vitest';
import {
  buildAwsQuery,
  distanceKm,
  findNearbyStations,
  normalizeApiHubKey,
  parseAwsMinute,
} from './kmaAwsCore.js';

/** 매분자료 한 줄을 만든다. (WS10=7번째, TA=8번째, HM=14번째 열) */
function row(time: string, stn: number, ws10: string, ta: string, hm: string): string {
  return `${time},${stn},0,1.4,0,2.0,0,${ws10},${ta},-99.9,0.0,0.0,20.0,20.0,${hm},1009.7,1012.4,13.6,=`;
}

const HEADER = '#START7777\n# YYMMDDHHMI STN WD1\n';
const FOOTER = '\n#7777END';

describe('distanceKm', () => {
  it('같은 좌표는 0km', () => {
    expect(distanceKm(37.5, 127, 37.5, 127)).toBe(0);
  });

  it('서울 시청과 강남 사이는 약 9km', () => {
    expect(distanceKm(37.5665, 126.978, 37.4979, 127.0276)).toBeCloseTo(8.9, 0);
  });
});

describe('findNearbyStations', () => {
  it('서울 염창동에서 가장 가까운 관측소는 양천(405)과 강서(404) 계열이다', () => {
    const ids = findNearbyStations(37.55, 126.88).map((s) => s.id);
    expect(ids).toContain(405);
    expect(ids.length).toBeLessThanOrEqual(3);
  });

  it('가까운 순으로 정렬한다', () => {
    const stations = findNearbyStations(37.55, 126.88);
    const distances = stations.map((s) => s.distanceKm);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it('멀리 떨어진 바다 한가운데는 빈 배열', () => {
    expect(findNearbyStations(34.0, 130.5)).toEqual([]);
  });
});

describe('buildAwsQuery', () => {
  it('KST 기준 최근 10분 구간으로 조회한다', () => {
    // 2026-10-13 12:23 KST = 03:23 UTC
    const now = Date.parse('2026-10-13T12:23:00+09:00');
    const query = buildAwsQuery('KEY', 405, now);
    expect(query.get('tm1')).toBe('202610131213');
    expect(query.get('tm2')).toBe('202610131223');
    expect(query.get('stn')).toBe('405');
    expect(query.get('disp')).toBe('1');
    expect(query.get('authKey')).toBe('KEY');
  });

  it('자정을 넘기는 시각도 날짜가 올바르다', () => {
    const now = Date.parse('2026-10-14T00:05:00+09:00');
    const query = buildAwsQuery('KEY', 405, now);
    expect(query.get('tm1')).toBe('202610132355');
    expect(query.get('tm2')).toBe('202610140005');
  });
});

describe('normalizeApiHubKey', () => {
  it('키만 있으면 그대로 둔다', () => {
    expect(normalizeApiHubKey('abcDEF123')).toBe('abcDEF123');
  });

  it('예시 URL 전체가 들어 있으면 authKey 값만 꺼낸다', () => {
    const url = 'https://apihub.kma.go.kr/api/typ01/cgi-bin/url/nph-aws2_min?tm2=1&authKey=abc123';
    expect(normalizeApiHubKey(url)).toBe('abc123');
  });

  it('authKey 뒤의 다른 인자는 버린다', () => {
    expect(normalizeApiHubKey('x?authKey=abc&stn=0')).toBe('abc');
  });
});

describe('parseAwsMinute', () => {
  it('가장 최근 분의 기온·습도·풍속을 돌려준다', () => {
    const text = `${HEADER}${row('202610131222', 405, '1.0', '19.0', '71.9')}\n${row('202610131223', 405, '1.1', '19.1', '70.3')}${FOOTER}`;
    expect(parseAwsMinute(text, 405)).toEqual({ temp: 19.1, humidity: 70.3, windSpeed: 1.1 });
  });

  it('최신 분이 결측이면 직전의 유효한 분을 쓴다', () => {
    const text = `${HEADER}${row('202610131222', 405, '1.0', '19.0', '71.9')}\n${row('202610131223', 405, '-99.9', '-99.9', '-99.9')}${FOOTER}`;
    expect(parseAwsMinute(text, 405)?.temp).toBe(19.0);
  });

  it('기온이 유효하고 습도만 결측이면 습도는 null', () => {
    const text = `${HEADER}${row('202610131223', 405, '1.1', '19.1', '-99.9')}${FOOTER}`;
    expect(parseAwsMinute(text, 405)).toEqual({ temp: 19.1, humidity: null, windSpeed: 1.1 });
  });

  it('모든 분이 결측이면 null', () => {
    const text = `${HEADER}${row('202610131223', 405, '-99.9', '-99.9', '-99.9')}${FOOTER}`;
    expect(parseAwsMinute(text, 405)).toBeNull();
  });

  it('다른 지점 행은 무시한다', () => {
    const text = `${HEADER}${row('202610131223', 404, '1.1', '19.1', '70.0')}${FOOTER}`;
    expect(parseAwsMinute(text, 405)).toBeNull();
  });

  it('인증 오류 JSON 응답은 null', () => {
    const text = '{"result":{"status":401,"message":"유효한 인증키가 아닙니다."}}';
    expect(parseAwsMinute(text, 405)).toBeNull();
  });

  it('빈 응답은 null', () => {
    expect(parseAwsMinute('', 405)).toBeNull();
  });
});
