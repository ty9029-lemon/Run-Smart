import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DISTANCE_KM,
  DISTANCE_STEP_KM,
  MAX_DISTANCE_KM,
  MIN_DISTANCE_KM,
} from '../constants/feedback';
import { formatDistanceKm, parseDistanceKm, stepDistanceKm } from './distance';

describe('stepDistanceKm', () => {
  it('입력 전이면 기본값에서 한 단계 움직인다', () => {
    expect(stepDistanceKm(null, 1)).toBe(DEFAULT_DISTANCE_KM + DISTANCE_STEP_KM);
    expect(stepDistanceKm(null, -1)).toBe(DEFAULT_DISTANCE_KM - DISTANCE_STEP_KM);
  });

  it('현재 값에서 한 단계 늘리거나 줄인다', () => {
    expect(stepDistanceKm(3, 1)).toBe(3 + DISTANCE_STEP_KM);
    expect(stepDistanceKm(3, -1)).toBe(3 - DISTANCE_STEP_KM);
  });

  it('최소·최대 범위를 넘지 않는다', () => {
    expect(stepDistanceKm(MIN_DISTANCE_KM, -1)).toBe(MIN_DISTANCE_KM);
    expect(stepDistanceKm(MAX_DISTANCE_KM, 1)).toBe(MAX_DISTANCE_KM);
  });
});

describe('formatDistanceKm', () => {
  it('정수와 소수를 km 단위로 보여준다', () => {
    expect(formatDistanceKm(5)).toBe('5km');
    expect(formatDistanceKm(5.5)).toBe('5.5km');
  });
});

describe('parseDistanceKm', () => {
  it('정수와 소수를 숫자로 바꾼다', () => {
    expect(parseDistanceKm('5')).toBe(5);
    expect(parseDistanceKm(' 5.5 ')).toBe(5.5);
    expect(parseDistanceKm('7,5')).toBe(7.5);
    expect(parseDistanceKm('.5')).toBe(0.5);
  });

  it('소수 둘째 자리까지만 남긴다', () => {
    expect(parseDistanceKm('5.126')).toBe(5.13);
  });

  it('비었거나 숫자가 아니면 null', () => {
    expect(parseDistanceKm('')).toBeNull();
    expect(parseDistanceKm('abc')).toBeNull();
    expect(parseDistanceKm('1e1')).toBeNull();
    expect(parseDistanceKm('-3')).toBeNull();
  });

  it('범위를 벗어나면 null', () => {
    expect(parseDistanceKm('0')).toBeNull();
    expect(parseDistanceKm(String(MAX_DISTANCE_KM + 1))).toBeNull();
    expect(parseDistanceKm(String(MIN_DISTANCE_KM))).toBe(MIN_DISTANCE_KM);
  });
});
