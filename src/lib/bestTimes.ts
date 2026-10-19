import { ACTIVITY_TIME_SLOTS } from '../constants/activities';
import {
  MAX_BEST_TIME_CARDS,
  NOON_HOUR,
  TIME_SLOT_RANGES,
  type DayType,
  type RangedTimeSlot,
} from '../constants/timeSlotRanges';
import { HOURS_IN_DAY, SCORE_GOOD } from '../constants/thresholds';
import type { ActivityTimeSlot } from '../types';
import { findBestHour, isRecommendableHour, type HourScore } from './bestHour';

/** 홈 "베스트 시간" 카드 한 장의 내용 */
export interface BestTimeCard {
  /** 카드 위 라벨 (예: 오늘 퇴근 후) */
  label: string;
  hour: number;
  score: number;
}

/** 시각(시) 목록에서 추천할 수 있는 칸만 남긴다. */
function recommendable(scores: HourScore[]): HourScore[] {
  return scores.filter((s) => isRecommendableHour(s.hour));
}

/** 요일이 평일인지 주말인지 구분한다. */
function getDayType(date: Date): DayType {
  const day = date.getDay();
  return day === 0 || day === 6 ? 'weekend' : 'weekday';
}

/** 한 시간대 안에서 가장 좋은 시각을 카드로 만든다. 후보가 없으면 null. */
function pickInRange(
  scores: HourScore[],
  slot: RangedTimeSlot,
  dayWord: string,
): BestTimeCard | null {
  const { startHour, endHour } = TIME_SLOT_RANGES[slot];
  const inRange = recommendable(scores).filter((s) => s.hour >= startHour && s.hour <= endHour);
  const best = findBestHour(inRange);
  if (!best) return null;
  const meta = ACTIVITY_TIME_SLOTS.find((m) => m.id === slot);
  return { label: `${dayWord} ${meta?.label ?? ''}`.trim(), hour: best.hour, score: best.score };
}

/** 오늘 남은 칸과 내일 칸으로 나눈다. (목록은 현재 시각부터 24시간) */
function splitDays(scores: HourScore[], nowHour: number) {
  const todayCount = HOURS_IN_DAY - nowHour;
  return { today: scores.slice(0, todayCount), tomorrow: scores.slice(todayCount) };
}

/** 오늘/내일 칸 */
type DayScores = ReturnType<typeof splitDays>;

/** 카드를 구분하는 키 (같은 시각이라도 오늘과 내일은 다른 카드) */
function cardKey(card: BestTimeCard): string {
  return `${card.label.slice(0, 2)}-${card.hour}`;
}

/**
 * 한 시간대의 카드를 만든다. 오늘이 그 요일이고 남은 시각이 있으면 오늘,
 * 아니면 내일이 그 요일일 때 내일 예보 안에서 찾는다. (요일이 안 맞으면 만들지 않는다)
 */
function cardForSlot(slot: RangedTimeSlot, days: DayScores, now: Date): BestTimeCard | null {
  const { dayType } = TIME_SLOT_RANGES[slot];
  if (dayType === getDayType(now)) {
    const today = pickInRange(days.today, slot, '오늘');
    if (today) return today;
  }
  const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (dayType !== getDayType(tomorrowDate)) return null;
  return pickInRange(days.tomorrow, slot, '내일');
}

/** 온보딩에서 고른 시간대의 카드를 이른 시간대 순으로 만든다. (오늘 카드가 먼저 오도록 정렬은 호출하는 쪽에서) */
function buildSlotCards(slots: ActivityTimeSlot[], days: DayScores, now: Date): BestTimeCard[] {
  return slots
    .filter((s): s is RangedTimeSlot => s in TIME_SLOT_RANGES)
    .sort((a, b) => TIME_SLOT_RANGES[a].startHour - TIME_SLOT_RANGES[b].startHour)
    .map((slot) => cardForSlot(slot, days, now))
    .filter((card): card is BestTimeCard => card !== null);
}

/** '오늘' 카드를 앞으로 보낸다. (같은 날은 이른 시각 순) */
function sortCards(cards: BestTimeCard[]): BestTimeCard[] {
  const rank = (c: BestTimeCard) => (c.label.startsWith('오늘') ? 0 : 1);
  return [...cards].sort((a, b) => rank(a) - rank(b) || a.hour - b.hour);
}

/** 오전(정오 전)인지 오후인지 */
type Period = '오전' | '오후';

/** 시각이 오전인지 오후인지 구분한다. */
function periodOf(hour: number): Period {
  return hour < NOON_HOUR ? '오전' : '오후';
}

/** 조건에 맞는 칸 중 가장 좋은 시각을 찾는다. (period가 없으면 하루 전체, minScore 미만은 제외) */
function bestOf(scores: HourScore[], period?: Period, minScore = 0): HourScore | null {
  return findBestHour(
    scores.filter((s) => (!period || periodOf(s.hour) === period) && s.score >= minScore),
  );
}

/** 가장 좋은 시각으로 카드를 만든다. 라벨은 "오늘 오전"처럼 날짜와 오전·오후를 붙인다. */
function toCard(dayWord: string, best: HourScore): BestTimeCard {
  return { label: `${dayWord} ${periodOf(best.hour)}`, hour: best.hour, score: best.score };
}

/** 값이 있는 카드만 모은다. */
function compact(cards: (BestTimeCard | null)[]): BestTimeCard[] {
  return cards.filter((card): card is BestTimeCard => card !== null);
}

/**
 * 오늘 카드 후보. 좋은 오전과 좋은 오후가 모두 남아 있으면 둘 다,
 * 아니면 오후(오전이 지난 경우) 1개, 그것도 없으면 오전 1개, 좋은 시간이 하나도 없으면 오늘 가장 나은 시각 1개.
 */
function todayFallback(today: HourScore[]): BestTimeCard[] {
  const morning = bestOf(today, '오전', SCORE_GOOD);
  const afternoon = bestOf(today, '오후', SCORE_GOOD);
  if (morning && afternoon) return [toCard('오늘', morning), toCard('오늘', afternoon)];
  const single = afternoon ?? morning ?? bestOf(today);
  return single ? [toCard('오늘', single)] : [];
}

/** 내일 카드 후보: 좋은 오전을 먼저, 없으면 오후 */
function tomorrowSingle(tomorrow: HourScore[]): BestTimeCard | null {
  const best = bestOf(tomorrow, '오전', SCORE_GOOD) ?? bestOf(tomorrow, '오후');
  return best ? toCard('내일', best) : null;
}

/**
 * 시간대 카드가 모자랄 때 채우는 카드.
 * 1) 오늘 좋은 오전·오후가 모두 남아 있으면 둘 다
 * 2) 오전이 지났으면 오늘 오후 1개 + 내일 가장 좋은 오전 1개 (좋은 오전이 없으면 내일 오후)
 * 3) 오늘 후보가 하나도 없으면(22시 이후) 내일 오전·오후
 */
function buildFallbackCards(days: DayScores, taken: Set<string>, need: number): BestTimeCard[] {
  const today = recommendable(days.today).filter((s) => !taken.has(`오늘-${s.hour}`));
  const tomorrow = recommendable(days.tomorrow).filter((s) => !taken.has(`내일-${s.hour}`));
  const todayCards = todayFallback(today);
  if (todayCards.length >= need) return todayCards.slice(0, need);
  if (todayCards.length === 0) {
    const morning = bestOf(tomorrow, '오전', SCORE_GOOD);
    const afternoon = bestOf(tomorrow, '오후');
    return compact([morning && toCard('내일', morning), afternoon && toCard('내일', afternoon)]).slice(
      0,
      need,
    );
  }
  return compact([...todayCards, tomorrowSingle(tomorrow)]).slice(0, need);
}

/**
 * 홈 "베스트 시간" 카드를 최대 2장 만든다.
 * 온보딩에서 고른 시간대를 먼저 쓰고, 모자라면 오늘 좋은 시간대(2개까지)와 내일 가장 좋은 시간으로 채운다.
 * @param scores 현재 시각부터 24시간의 시간대별 점수
 * @param now 현재 시각
 * @param slots 온보딩에서 고른 시간대 (비어 있거나 '항상 다름'이면 시간대 카드는 없다)
 */
export function buildBestTimeCards(
  scores: HourScore[],
  now: Date,
  slots: ActivityTimeSlot[],
): BestTimeCard[] {
  const days = splitDays(scores, now.getHours());
  const slotCards = sortCards(buildSlotCards(slots, days, now)).slice(0, MAX_BEST_TIME_CARDS);
  const need = MAX_BEST_TIME_CARDS - slotCards.length;
  if (need === 0) return slotCards;
  const taken = new Set(slotCards.map(cardKey));
  return [...slotCards, ...buildFallbackCards(days, taken, need)];
}
