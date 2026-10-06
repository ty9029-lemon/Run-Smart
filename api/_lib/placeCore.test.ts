import { describe, expect, it } from 'vitest';
import { formatRegionLabel, isNoRegionStatus, parsePlaceCoords } from './placeCore.js';

/** 쿼리 문자열에서 좌표를 검증한다. */
function parse(query: string) {
  return parsePlaceCoords(new URLSearchParams(query));
}

describe('parsePlaceCoords', () => {
  it('올바른 위도·경도는 숫자로 돌려준다', () => {
    expect(parse('lat=37.498&lon=127.028')).toEqual({ lat: 37.498, lon: 127.028 });
  });

  it('값이 없거나 숫자가 아니면 거부한다', () => {
    expect(parse('lat=37.5')).toBeNull();
    expect(parse('lon=127')).toBeNull();
    expect(parse('lat=abc&lon=127')).toBeNull();
    expect(parse('')).toBeNull();
  });

  it('범위를 벗어난 값은 거부한다', () => {
    expect(parse('lat=91&lon=127')).toBeNull();
    expect(parse('lat=37&lon=181')).toBeNull();
    expect(parse('lat=-91&lon=0')).toBeNull();
  });
});

describe('formatRegionLabel', () => {
  it('광역시는 시·도를 줄여 "서울시 역삼1동"으로 만든다', () => {
    const docs = [
      { region_type: 'B', region_1depth_name: '서울특별시', region_2depth_name: '강남구', region_3depth_name: '역삼동' },
      { region_type: 'H', region_1depth_name: '서울특별시', region_2depth_name: '강남구', region_3depth_name: '역삼1동' },
    ];
    expect(formatRegionLabel(docs)).toBe('서울시 역삼1동');
  });

  it('행정동(H)이 있으면 법정동(B)보다 우선한다', () => {
    const docs = [
      { region_type: 'B', region_1depth_name: '서울특별시', region_3depth_name: '법정동' },
      { region_type: 'H', region_1depth_name: '서울특별시', region_3depth_name: '행정동' },
    ];
    expect(formatRegionLabel(docs)).toBe('서울시 행정동');
  });

  it('행정동이 없으면 동 이름이 있는 첫 문서를 쓴다', () => {
    const docs = [{ region_type: 'B', region_1depth_name: '부산광역시', region_3depth_name: '서면동' }];
    expect(formatRegionLabel(docs)).toBe('부산시 서면동');
  });

  it('도는 시·군까지 붙이고, 구 이름은 뺀다', () => {
    const docs = [
      { region_type: 'H', region_1depth_name: '경기도', region_2depth_name: '성남시 분당구', region_3depth_name: '정자동' },
    ];
    expect(formatRegionLabel(docs)).toBe('경기도 성남시 정자동');
  });

  it('약식 시·도 이름도 줄여 쓴다', () => {
    const seoul = [{ region_type: 'H', region_1depth_name: '서울', region_3depth_name: '합정동' }];
    const gyeonggi = [
      { region_type: 'H', region_1depth_name: '경기', region_2depth_name: '안성시', region_3depth_name: '죽산면' },
    ];
    expect(formatRegionLabel(seoul)).toBe('서울시 합정동');
    expect(formatRegionLabel(gyeonggi)).toBe('경기도 안성시 죽산면');
  });

  it('세종, 제주는 짧은 표기로 바꾼다', () => {
    const sejong = [{ region_type: 'H', region_1depth_name: '세종특별자치시', region_3depth_name: '한솔동' }];
    const jeju = [
      { region_type: 'H', region_1depth_name: '제주특별자치도', region_2depth_name: '제주시', region_3depth_name: '연동' },
    ];
    expect(formatRegionLabel(sejong)).toBe('세종시 한솔동');
    expect(formatRegionLabel(jeju)).toBe('제주도 제주시 연동');
  });

  it('알 수 없는 시·도는 받은 이름을 그대로 쓴다', () => {
    const docs = [{ region_type: 'H', region_1depth_name: '새이름특별시', region_3depth_name: '가동' }];
    expect(formatRegionLabel(docs)).toBe('새이름특별시 가동');
  });

  it('동 이름이 없거나 결과가 비어 있으면 null', () => {
    expect(formatRegionLabel([])).toBeNull();
    expect(formatRegionLabel([{ region_type: 'H', region_1depth_name: '서울특별시' }])).toBeNull();
  });
});

describe('isNoRegionStatus', () => {
  it('400(행정구역 없음)만 주소 없음으로 본다', () => {
    expect(isNoRegionStatus(400)).toBe(true);
  });

  it('키 오류, 한도 초과, 서버 오류는 장애로 남기기 위해 주소 없음으로 보지 않는다', () => {
    [200, 401, 403, 429, 500, 502].forEach((status) => {
      expect(isNoRegionStatus(status)).toBe(false);
    });
  });
});
