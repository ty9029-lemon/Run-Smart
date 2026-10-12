import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DECISION_LOG_KEY,
  decisionTimingProps,
  recordDecisionAndCheckChange,
  type DecisionLogStorage,
} from './decisionTracking';

vi.mock('./logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

/** 메모리에만 저장하는 가짜 저장소 */
function createMemoryStorage(): DecisionLogStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

const MORNING = new Date('2026-10-11T09:00:00');
const EVENING = new Date('2026-10-11T19:00:00');
const NEXT_DAY = new Date('2026-10-12T09:00:00');

describe('recordDecisionAndCheckChange', () => {
  let storage: ReturnType<typeof createMemoryStorage>;

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it('오늘 첫 결정은 변경이 아니다', () => {
    expect(recordDecisionAndCheckChange('running', MORNING, storage)).toBe(false);
  });

  it('같은 날 같은 활동으로 다시 결정하면 변경이다 (취소 후 재결정 포함)', () => {
    recordDecisionAndCheckChange('running', MORNING, storage);
    expect(recordDecisionAndCheckChange('running', EVENING, storage)).toBe(true);
  });

  it('같은 날이라도 다른 활동의 첫 결정은 변경이 아니다', () => {
    recordDecisionAndCheckChange('running', MORNING, storage);
    expect(recordDecisionAndCheckChange('cycling', MORNING, storage)).toBe(false);
  });

  it('다음 날에는 다시 첫 결정으로 본다', () => {
    recordDecisionAndCheckChange('running', MORNING, storage);
    expect(recordDecisionAndCheckChange('running', NEXT_DAY, storage)).toBe(false);
  });

  it('저장된 값이 깨져 있어도 첫 결정으로 처리한다', () => {
    storage.setItem(DECISION_LOG_KEY, '{깨진 값');
    expect(recordDecisionAndCheckChange('running', MORNING, storage)).toBe(false);
  });

  it('저장소를 쓸 수 없으면 변경이 아닌 것으로 본다', () => {
    expect(recordDecisionAndCheckChange('running', MORNING, null)).toBe(false);
  });
});

describe('decisionTimingProps', () => {
  it('첫 결정이면 걸린 시간을 반올림해 붙인다', () => {
    expect(decisionTimingProps(false, 3456.7)).toEqual({ timeToDecisionMs: 3457 });
  });

  it('재결정이면 값을 붙이지 않는다', () => {
    expect(decisionTimingProps(true, 3000)).toEqual({});
  });

  it('시작 시점을 모르면 값을 붙이지 않는다', () => {
    expect(decisionTimingProps(false, null)).toEqual({});
  });

  it('음수 경과 시간은 0으로 보정한다', () => {
    expect(decisionTimingProps(false, -5)).toEqual({ timeToDecisionMs: 0 });
  });
});
