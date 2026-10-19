import { describe, expect, it } from 'vitest';
import type { OutfitItem } from '../types';
import { filterTipsNotInOutfit } from './guideTips';

/** 테스트용 복장 항목 */
const item = (label: string): OutfitItem => ({ category: 'top', icon: 'tshirt', label });

const OUTFIT = [item('기능성 얇은 긴팔'), item('반바지 또는 레깅스'), item('러닝화')];

describe('filterTipsNotInOutfit', () => {
  it('복장 카드에 있는 항목을 말하는 팁은 뺀다', () => {
    const tips = ['기능성 얇은 긴팔 입기', '긴팔 상의 입기', '쿠션감 좋은 러닝화 착용', '반바지 가볍게 입기'];
    expect(filterTipsNotInOutfit(tips, OUTFIT)).toEqual([]);
  });

  it('복장과 상관없는 팁은 그대로 둔다', () => {
    const tips = ['자외선 차단제 바르기', '선글라스 챙기기', '러닝 전후 발 스트레칭하기', '수분 챙기기'];
    expect(filterTipsNotInOutfit(tips, OUTFIT)).toEqual(tips);
  });

  it('복장 이름의 앞 단어(러닝)만 겹치는 팁은 빼지 않는다', () => {
    expect(filterTipsNotInOutfit(['러닝 전후 발 스트레칭하기'], OUTFIT)).toEqual([
      '러닝 전후 발 스트레칭하기',
    ]);
  });

  it('복장에 선글라스가 있으면 선글라스 팁도 뺀다', () => {
    const outfit = [...OUTFIT, item('선글라스')];
    expect(filterTipsNotInOutfit(['선글라스 챙기기', '수분 챙기기'], outfit)).toEqual(['수분 챙기기']);
  });

  it('복장에 선크림이 있으면 자외선 차단제 팁도 뺀다', () => {
    const outfit = [...OUTFIT, item('선크림')];
    expect(filterTipsNotInOutfit(['자외선 차단제 바르기', '수분 챙기기'], outfit)).toEqual([
      '수분 챙기기',
    ]);
  });
});
