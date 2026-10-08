import { describe, expect, it } from 'vitest';
import { DECISION_LOCK_MS } from '../constants/thresholds';
import { isDecisionLocked } from './decision';

const NOW = new Date('2026-10-08T12:00:00Z').getTime();

/** 지정한 경과 시간 전의 ISO 시각 */
function isoAgo(ms: number): string {
  return new Date(NOW - ms).toISOString();
}

describe('isDecisionLocked', () => {
  it('방금 기록했으면 잠긴다', () => {
    expect(isDecisionLocked(isoAgo(0), NOW)).toBe(true);
  });

  it('잠금 시간 직전까지는 잠긴다', () => {
    expect(isDecisionLocked(isoAgo(DECISION_LOCK_MS - 1), NOW)).toBe(true);
  });

  it('잠금 시간이 지나면 풀린다', () => {
    expect(isDecisionLocked(isoAgo(DECISION_LOCK_MS), NOW)).toBe(false);
  });
});
