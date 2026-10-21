import { describe, expect, it } from 'vitest';
import type { Activity, HourlyWeather } from '../types';
import { scoreHours, type HourScore } from './bestHour';
import { buildBestTimeCards } from './bestTimes';
import { NEUTRAL_SENSITIVITY } from './feelsLike';

/** 2026-10-19(월), 2026-10-23(금), 2026-10-24(토)의 지정 시각 */
const monday = (hour: number) => new Date(2026, 9, 19, hour, 30);
const friday = (hour: number) => new Date(2026, 9, 23, hour, 30);
const saturday = (hour: number) => new Date(2026, 9, 24, hour, 30);

/** 현재 시(nowHour)부터 24칸. scoreOf로 시각별 점수를 정한다. */
function makeScores(nowHour: number, scoreOf: (hour: number) => number): HourScore[] {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = (nowHour + i) % 24;
    return { hour, score: scoreOf(hour) };
  });
}

/** 기본 점수: 낮은 점수 50, 지정한 시각만 높다. */
const peaks = (map: Record<number, number>) => (hour: number) => map[hour] ?? 50;

describe('buildBestTimeCards 시간대 선택', () => {
  it('퇴근 후와 출근 전을 고르면 오늘 퇴근 후, 내일 출근 전 순서로 만든다', () => {
    const scores = makeScores(14, peaks({ 19: 84, 7: 82 }));
    const cards = buildBestTimeCards(scores, monday(14), ['beforeWork', 'afterWork']);
    expect(cards).toEqual([
      { label: '오늘 퇴근 후', hour: 19, score: 84 },
      { label: '내일 출근 전', hour: 7, score: 82 },
    ]);
  });

  it('시간대 안에서 점수가 가장 높은 시각을 고른다', () => {
    const scores = makeScores(5, peaks({ 18: 70, 20: 90, 21: 80 }));
    const [card] = buildBestTimeCards(scores, monday(5), ['afterWork']);
    expect(card).toEqual({ label: '오늘 퇴근 후', hour: 20, score: 90 });
  });

  it('이른 시간대 카드가 앞에 온다', () => {
    const scores = makeScores(5, peaks({ 13: 80, 19: 80 }));
    const cards = buildBestTimeCards(scores, monday(5), ['afterWork', 'weekdayDaytime']);
    expect(cards.map((c) => c.label)).toEqual(['오늘 평일 낮', '오늘 퇴근 후']);
  });

  it('금요일 저녁이면 내일(토)이 평일이 아니라 내일 출근 전은 만들지 않는다', () => {
    const scores = makeScores(14, peaks({ 19: 84, 7: 99 }));
    const cards = buildBestTimeCards(scores, friday(14), ['beforeWork', 'afterWork']);
    expect(cards.find((c) => c.label === '오늘 퇴근 후')).toEqual({
      label: '오늘 퇴근 후',
      hour: 19,
      score: 84,
    });
    expect(cards.some((c) => c.label === '내일 출근 전')).toBe(false);
  });

  it('주말 시간대는 평일에는 만들지 않는다', () => {
    const scores = makeScores(14, peaks({ 19: 84 }));
    const cards = buildBestTimeCards(scores, monday(14), ['weekendMorning']);
    expect(cards.some((c) => c.label.includes('주말'))).toBe(false);
  });

  it('토요일에는 주말 저녁을 오늘로 만든다', () => {
    const scores = makeScores(9, peaks({ 18: 88 }));
    const cards = buildBestTimeCards(scores, saturday(9), ['weekendEvening']);
    expect(cards.find((c) => c.label === '오늘 주말 저녁')).toEqual({
      label: '오늘 주말 저녁',
      hour: 18,
      score: 88,
    });
  });

  it('22시 이후 시각은 시간대 안에 있어도 고르지 않는다', () => {
    const scores = makeScores(14, peaks({ 21: 70, 22: 99 }));
    const [card] = buildBestTimeCards(scores, monday(14), ['afterWork']);
    expect(card.hour).not.toBe(22);
  });
});

describe('buildBestTimeCards 시간대 선택이 없을 때', () => {
  it('오늘 좋은 오전과 오후가 모두 남아 있으면 오전 1개, 오후 1개를 보여준다', () => {
    const scores = makeScores(7, peaks({ 8: 90, 18: 85 }));
    expect(buildBestTimeCards(scores, monday(7), [])).toEqual([
      { label: '오늘 오전', hour: 8, score: 90 },
      { label: '오늘 오후', hour: 18, score: 85 },
    ]);
  });

  it('오전이 지났으면 오늘 오후 1개와 내일 가장 좋은 오전 1개를 보여준다', () => {
    const scores = makeScores(15, peaks({ 17: 90, 18: 89, 6: 88 }));
    expect(buildBestTimeCards(scores, monday(15), [])).toEqual([
      { label: '오늘 오후', hour: 17, score: 90 },
      { label: '내일 오전', hour: 6, score: 88 },
    ]);
  });

  it('내일 좋은 오전이 없으면 내일 오후를 보여준다', () => {
    const scores = makeScores(15, peaks({ 17: 90, 13: 60 }));
    expect(buildBestTimeCards(scores, monday(15), [])).toEqual([
      { label: '오늘 오후', hour: 17, score: 90 },
      { label: '내일 오후', hour: 13, score: 60 },
    ]);
  });

  it('오늘 좋은 오후가 없고 오전만 남았으면 오전 1장만 보여준다 (내일 예보가 6시까지라 내일 후보가 없다)', () => {
    const scores = makeScores(7, peaks({ 8: 90 }));
    expect(buildBestTimeCards(scores, monday(7), [])).toEqual([
      { label: '오늘 오전', hour: 8, score: 90 },
    ]);
  });

  it('좋은 시간이 하나도 없으면 오늘 가장 나은 시각을 보여준다', () => {
    const scores = makeScores(15, () => 50);
    const [card] = buildBestTimeCards(scores, monday(15), []);
    expect(card).toEqual({ label: '오늘 오후', hour: 15, score: 50 });
  });

  it('항상 다름은 시간대 선택이 없는 것과 같다', () => {
    const scores = makeScores(15, peaks({ 17: 90, 6: 88 }));
    expect(buildBestTimeCards(scores, monday(15), ['irregular'])).toEqual(
      buildBestTimeCards(scores, monday(15), []),
    );
  });

  it('22시 이후에는 오늘 후보가 없어 내일 오전·오후를 보여준다', () => {
    const scores = makeScores(23, peaks({ 7: 90, 15: 85 }));
    expect(buildBestTimeCards(scores, monday(23), [])).toEqual([
      { label: '내일 오전', hour: 7, score: 90 },
      { label: '내일 오후', hour: 15, score: 85 },
    ]);
  });
});

describe('buildBestTimeCards 시간대 카드와 채우기', () => {
  it('시간대 카드가 1장이면 나머지를 오늘 좋은 시간으로 채운다 (같은 시각은 피한다)', () => {
    const scores = makeScores(14, peaks({ 19: 90, 15: 85 }));
    expect(buildBestTimeCards(scores, monday(14), ['afterWork'])).toEqual([
      { label: '오늘 오후', hour: 15, score: 85 },
      { label: '오늘 퇴근 후', hour: 19, score: 90 },
    ]);
  });

  it('채운 카드가 더 이르면 시간대 카드보다 앞에 온다 (오늘 오후가 내일 출근 전보다 먼저)', () => {
    const scores = makeScores(14, peaks({ 9: 97, 19: 91 }));
    const cards = buildBestTimeCards(scores, monday(14), ['beforeWork']);
    expect(cards).toEqual([
      { label: '오늘 오후', hour: 19, score: 91 },
      { label: '내일 출근 전', hour: 9, score: 97 },
    ]);
  });

  it('최대 2장까지만 만든다', () => {
    const scores = makeScores(5, peaks({ 7: 80, 13: 80, 19: 80 }));
    const cards = buildBestTimeCards(scores, monday(5), [
      'beforeWork',
      'weekdayDaytime',
      'afterWork',
    ]);
    expect(cards).toHaveLength(2);
  });

  it('시간대 카드가 2장이면 채우지 않는다', () => {
    const scores = makeScores(5, peaks({ 7: 80, 19: 85, 15: 99 }));
    const cards = buildBestTimeCards(scores, monday(5), ['beforeWork', 'afterWork']);
    expect(cards.map((c) => c.label)).toEqual(['오늘 출근 전', '오늘 퇴근 후']);
  });
});

describe('buildBestTimeCards 해 진 뒤 저녁 (10월 말, 일몰 17시대)', () => {
  const FIRST_DAY_HOUR = 6;
  const SUNSET_HOUR = 18;

  /** 현재 시(nowHour)부터 24시간. 날씨는 모두 이상적이고 6~17시만 낮이다. */
  function idealHourly(nowHour: number): HourlyWeather[] {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = (nowHour + i) % 24;
      return {
        hour,
        temp: 12,
        humidity: 45,
        windSpeed: 2,
        precipitation: 0,
        condition: '맑음',
        pm10: 20,
        uvIndex: 2,
        isDay: hour >= FIRST_DAY_HOUR && hour < SUNSET_HOUR,
      };
    });
  }

  const cardsFor = (activity: Activity) => {
    const scores = scoreHours(idealHourly(14), NEUTRAL_SENSITIVITY, [], activity);
    return buildBestTimeCards(scores, monday(14), ['beforeWork', 'afterWork']);
  };

  it('러닝은 해가 진 18~21시에도 "오늘 퇴근 후" 카드가 나온다', () => {
    const card = cardsFor('running').find((c) => c.label === '오늘 퇴근 후');
    expect(card).toBeDefined();
    expect(card?.hour).toBeGreaterThanOrEqual(18);
    expect(card?.hour).toBeLessThanOrEqual(21);
    expect(card?.score).toBe(100);
  });

  it('러닝도 22시 이후는 추천하지 않는다', () => {
    const scores = scoreHours(idealHourly(22), NEUTRAL_SENSITIVITY, [], 'running');
    const cards = buildBestTimeCards(scores, monday(22), ['afterWork']);
    expect(cards.some((c) => c.label === '오늘 퇴근 후')).toBe(false);
  });

  it('자전거는 해가 진 뒤 시간대로 "오늘 퇴근 후" 카드를 만들지 않는다', () => {
    expect(cardsFor('cycling').some((c) => c.label === '오늘 퇴근 후')).toBe(false);
  });
});
