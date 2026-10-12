import { logger } from './logger';

/** 오늘 내린 결정 이력을 저장하는 localStorage 키 */
export const DECISION_LOG_KEY = 'run-smart-decision-log';

/** localStorage 중 이 모듈이 쓰는 부분 (테스트에서 대체 가능) */
export type DecisionLogStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** 하루 단위 결정 이력: 날짜와 그날 결정을 내린 활동 목록 */
interface DecisionLog {
  day: string;
  activities: string[];
}

/** 브라우저 저장소를 돌려준다. 사용할 수 없으면 null */
function getDefaultStorage(): DecisionLogStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** 저장된 이력을 읽는다. 날짜가 다르거나 깨졌으면 오늘 기준 빈 이력을 돌려준다. */
function readLog(storage: DecisionLogStorage, day: string): DecisionLog {
  try {
    const parsed = JSON.parse(storage.getItem(DECISION_LOG_KEY) ?? 'null') as DecisionLog | null;
    if (parsed && parsed.day === day && Array.isArray(parsed.activities)) return parsed;
  } catch {
    // 깨진 값은 무시하고 새로 시작한다
  }
  return { day, activities: [] };
}

/**
 * 이번 결정을 이력에 남기고, 오늘 같은 활동으로 이미 결정한 적이 있었는지 알려준다.
 * 결정을 취소하면 기록이 사라지므로, 취소 후 다시 결정한 경우도 변경으로 본다.
 * @param activity 결정한 활동
 * @param now 현재 시각
 * @param storage 이력을 저장할 곳 (기본: localStorage)
 * @returns 오늘 이미 결정한 적이 있으면 true (저장소를 쓸 수 없으면 false)
 */
export function recordDecisionAndCheckChange(
  activity: string,
  now: Date,
  storage: DecisionLogStorage | null = getDefaultStorage(),
): boolean {
  if (!storage) return false;
  const log = readLog(storage, now.toDateString());
  const isChange = log.activities.includes(activity);
  if (isChange) return true;
  try {
    storage.setItem(
      DECISION_LOG_KEY,
      JSON.stringify({ day: log.day, activities: [...log.activities, activity] }),
    );
  } catch (error) {
    logger.warn('결정 이력을 저장하지 못했습니다.', error);
  }
  return false;
}

/**
 * 결정 이벤트에 붙일 "결과가 보인 뒤 결정까지 걸린 시간" 속성을 만든다.
 * 재결정(isChange)이거나 시작 시점을 모르면 값을 붙이지 않는다.
 * @param isChange 오늘 이미 같은 활동으로 결정한 적이 있는지
 * @param elapsedMs 결과가 보인 뒤 경과한 시간(ms), 알 수 없으면 null
 * @returns timeToDecisionMs 속성 (붙이지 않을 때는 빈 객체)
 */
export function decisionTimingProps(
  isChange: boolean,
  elapsedMs: number | null,
): { timeToDecisionMs?: number } {
  if (isChange || elapsedMs === null) return {};
  return { timeToDecisionMs: Math.max(0, Math.round(elapsedMs)) };
}
