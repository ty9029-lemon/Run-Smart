import { describe, expect, it } from 'vitest';
import { ACTIVITY_COMFORT, COMFORT_EDGE_QUALITY } from '../constants/scoring';
import {
  applySensitivity,
  daylightQuality,
  getSunsetStatus,
  dustQuality,
  feelsLikeQuality,
  humidityQuality,
  interpolate,
  rainQuality,
  tempQuality,
  uvQuality,
  windQuality,
} from './scoreFactors';

const RUNNING = ACTIVITY_COMFORT.running;

describe('interpolate', () => {
  const curve = [
    [0, 0],
    [10, 1],
  ] as const;

  it('구간 안에서는 선형으로 이은 값을 돌려준다', () => {
    expect(interpolate(curve, 5)).toBeCloseTo(0.5);
  });

  it('양 끝 밖은 끝 값을 쓴다', () => {
    expect(interpolate(curve, -5)).toBe(0);
    expect(interpolate(curve, 50)).toBe(1);
  });
});

describe('feelsLikeQuality (러닝 core 8~14, comfort 3~20)', () => {
  it('core 안은 1이다', () => {
    expect(feelsLikeQuality(8, RUNNING)).toBe(1);
    expect(feelsLikeQuality(11, RUNNING)).toBe(1);
    expect(feelsLikeQuality(14, RUNNING)).toBe(1);
  });

  it('comfort 끝에서는 0.6이다', () => {
    expect(feelsLikeQuality(3, RUNNING)).toBeCloseTo(COMFORT_EDGE_QUALITY);
    expect(feelsLikeQuality(20, RUNNING)).toBeCloseTo(COMFORT_EDGE_QUALITY);
  });

  it('comfort 밖으로 충분히 멀어지면 0이다', () => {
    expect(feelsLikeQuality(-5, RUNNING)).toBe(0);
    expect(feelsLikeQuality(28, RUNNING)).toBe(0);
  });

  it('core에서 멀어질수록 낮아진다', () => {
    expect(feelsLikeQuality(17, RUNNING)).toBeLessThan(feelsLikeQuality(14, RUNNING));
    expect(feelsLikeQuality(5, RUNNING)).toBeLessThan(feelsLikeQuality(8, RUNNING));
  });
});

describe('항목별 품질', () => {
  it('기온은 5~25°C가 1이고 양쪽 끝으로 0까지 내려간다', () => {
    expect(tempQuality(15)).toBe(1);
    expect(tempQuality(-10)).toBe(0);
    expect(tempQuality(35)).toBe(0);
    expect(tempQuality(30)).toBeCloseTo(0.5);
  });

  it('강수는 0mm가 1이고 2mm에서 0이다', () => {
    expect(rainQuality(0)).toBe(1);
    expect(rainQuality(1)).toBeCloseTo(0.5);
    expect(rainQuality(2)).toBe(0);
    expect(rainQuality(10)).toBe(0);
  });

  it('풍속은 3m/s 이하가 1이고 12m/s에서 0이다', () => {
    expect(windQuality(0)).toBe(1);
    expect(windQuality(3)).toBe(1);
    expect(windQuality(7.5)).toBeCloseTo(0.5);
    expect(windQuality(12)).toBe(0);
  });

  it('습도는 30~60%가 1이고 너무 건조하거나 습하면 0으로 내려간다', () => {
    expect(humidityQuality(45)).toBe(1);
    expect(humidityQuality(10)).toBe(0);
    expect(humidityQuality(95)).toBe(0);
    expect(humidityQuality(77.5)).toBeCloseTo(0.5);
  });

  it('미세먼지는 좋음 1, 보통 끝 0.6, 매우 나쁨 0이다', () => {
    expect(dustQuality(30)).toBe(1);
    expect(dustQuality(80)).toBeCloseTo(0.6);
    expect(dustQuality(150)).toBeCloseTo(0.2);
    expect(dustQuality(300)).toBe(0);
  });

  it('자외선은 5 이하가 1이고 11에서 0이다', () => {
    expect(uvQuality(3)).toBe(1);
    expect(uvQuality(8)).toBeCloseTo(0.5);
    expect(uvQuality(11)).toBe(0);
  });

  it('낮은 1, 밤은 0, 정보가 없으면 낮으로 본다', () => {
    expect(daylightQuality(true)).toBe(1);
    expect(daylightQuality(false)).toBe(0);
    expect(daylightQuality(undefined)).toBe(1);
  });

  it('일몰까지 남은 시간이 여유 시간보다 짧으면 낮이어도 0이다', () => {
    expect(daylightQuality(true, 3, 3)).toBe(1);
    expect(daylightQuality(true, 2.9, 3)).toBe(0);
    expect(daylightQuality(true, 5, 3)).toBe(1);
  });

  it('밤이면 일몰 정보와 상관없이 0이고, 일몰 정보가 없으면 낮/밤만 본다', () => {
    expect(daylightQuality(false, 10, 3)).toBe(0);
    expect(daylightQuality(true, undefined, 3)).toBe(1);
  });

  it('여유 시간이 0이면 해가 떠 있는 동안 낮이다', () => {
    expect(daylightQuality(true, 0.2)).toBe(1);
  });
});

describe('getSunsetStatus', () => {
  it('일몰까지 여유 시간보다 적게 남으면 approaching이다', () => {
    expect(getSunsetStatus(2.9, 3)).toBe('approaching');
    expect(getSunsetStatus(0, 3)).toBe('approaching');
    expect(getSunsetStatus(3, 3)).toBeNull();
    expect(getSunsetStatus(5, 3)).toBeNull();
  });

  it('일몰이 지났으면(음수) passed다', () => {
    expect(getSunsetStatus(-0.1, 3)).toBe('passed');
    expect(getSunsetStatus(-5, 3)).toBe('passed');
  });

  it('일몰 정보가 없으면 null이다', () => {
    expect(getSunsetStatus(undefined, 3)).toBeNull();
  });

  it('여유 시간이 0이면(러닝·산책) 항상 null이다', () => {
    expect(getSunsetStatus(0.5, 0)).toBeNull();
    expect(getSunsetStatus(-2, 0)).toBeNull();
  });

  it('해뜨기 전 새벽처럼 일몰까지 많이 남았으면 null이다', () => {
    expect(getSunsetStatus(13, 3)).toBeNull();
  });
});

describe('applySensitivity', () => {
  it('민감하지 않으면 그대로다', () => {
    expect(applySensitivity(0.6, false)).toBe(0.6);
  });

  it('민감하면 손실이 2배가 된다', () => {
    expect(applySensitivity(0.6, true)).toBeCloseTo(0.2);
  });

  it('0 아래로는 내려가지 않는다', () => {
    expect(applySensitivity(0.3, true)).toBe(0);
  });
});
