import { describe, expect, it } from 'vitest';
import { recommendOutfit } from './outfit';

/** 추천된 복장 라벨 목록 */
function labels(feelsLike: number, activity: Parameters<typeof recommendOutfit>[2], rain = 0) {
  return recommendOutfit(feelsLike, rain, activity).map((i) => i.label);
}

describe('recommendOutfit', () => {
  it('산책 체감 15°C는 반팔·반바지가 아니라 긴팔·긴바지를 추천한다', () => {
    const result = labels(15, 'walking');
    expect(result).not.toContain('반팔 상의');
    expect(result).not.toContain('반바지');
    expect(result).toContain('긴팔 상의');
    expect(result).toContain('긴바지');
  });

  it('일상복은 체감온도 구간 경계에서 바뀐다', () => {
    expect(labels(4, 'walking')).toContain('패딩/두꺼운 겉옷');
    expect(labels(5, 'walking')).toContain('바람막이/재킷');
    expect(labels(11, 'walking')).toContain('바람막이/재킷');
    expect(labels(12, 'walking')).toContain('가디건/얇은 겉옷');
    expect(labels(16, 'walking')).toContain('가디건/얇은 겉옷');
    expect(labels(17, 'walking')).toContain('얇은 긴팔 상의');
    expect(labels(22, 'walking')).toContain('얇은 긴팔 상의');
    expect(labels(23, 'walking')).toContain('반팔 상의');
    expect(labels(27, 'walking')).toContain('반팔 상의');
    expect(labels(28, 'walking')).toContain('민소매/얇은 반팔');
  });

  it('러닝은 체감 17~22°C에서 반팔·반바지를 추천한다', () => {
    expect(labels(17, 'running')).toContain('반팔 상의');
    expect(labels(22, 'running')).toContain('반바지');
    expect(labels(15, 'running')).not.toContain('반팔 상의');
  });

  it('자전거도 러닝처럼 가볍게, 산책·등산은 일상복 기준을 쓴다', () => {
    expect(labels(20, 'cycling')).toContain('반팔 상의');
    expect(labels(20, 'walking')).toContain('얇은 긴팔 상의');
    expect(labels(20, 'hiking')).toContain('얇은 긴팔 상의');
  });

  it('항상 운동화를 포함하고, 비가 오면 우비/방수를 더한다', () => {
    expect(labels(20, 'walking')).toContain('운동화');
    expect(labels(20, 'walking')).not.toContain('우비/방수');
    expect(labels(20, 'walking', 1)).toContain('우비/방수');
  });
});
