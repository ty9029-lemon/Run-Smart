import { describe, expect, it } from 'vitest';
import { ACTIVITY_SCORE_WEIGHTS, NIGHT_EXTRA_PENALTY, SCORE_WEIGHTS } from '../constants/scoring';
import { NIGHT_HEADLINE, RUNNING_TIER_LABEL } from '../constants/messages';
import {
  DUST_BAD_SCORE_CAP,
  DUST_BAD_SENSITIVE_SCORE_CAP,
  DUST_NORMAL_SENSITIVE_SCORE_CAP,
  DUST_VERY_BAD_SCORE_CAP,
  RECOMMEND_MIN_SCORE,
  SCORE_MAX,
} from '../constants/thresholds';
import { DUMMY_HOURLY } from '../data/dummyWeather';
import type { Activity, Constraint, HourlyWeather, Weather } from '../types';
import {
  findBestHour,
  findBestHourToday,
  findGoodRange,
  scoreHours,
  isRecommendableHour,
  isTomorrowIndex,
  sliceFromHour,
} from './bestHour';
import { NEUTRAL_SENSITIVITY } from './feelsLike';
import {
  calcRunScore,
  calcScoreBreakdown,
  scoreToHeadline,
  scoreToLevel,
  scoreToTier,
} from './runScore';
import { hasDaylightScore } from './scoreFactors';

/** 러닝 기준 모든 항목이 이상적인 낮 날씨 (체감 11°C) */
const IDEAL: Weather = {
  temp: 12,
  humidity: 45,
  windSpeed: 2,
  precipitation: 0,
  condition: '맑음',
  pm10: 20,
  uvIndex: 2,
  isDay: true,
};

/** 6~19시만 낮이고 나머지 날씨는 이상적인 24시간 */
const FIRST_DAY_HOUR = 6;
const LAST_DAY_HOUR = 19;
const IDEAL_DAY_AND_NIGHT: HourlyWeather[] = Array.from({ length: 24 }, (_, hour) => ({
  ...IDEAL,
  hour,
  isDay: hour >= FIRST_DAY_HOUR && hour <= LAST_DAY_HOUR,
}));

/** 낮시간을 최우선으로 보는 활동 */
const DAYLIGHT_FIRST_ACTIVITIES: Activity[] = ['hiking', 'cycling'];

/** 활동 4종 */
const ALL_ACTIVITIES: Activity[] = ['running', 'walking', 'hiking', 'cycling'];

/** 낮이라 해도 날씨가 평범해(바람·미세먼지 나쁨) 점수가 낮아진 시간대 */
const MEDIOCRE_DAY: Weather = { ...IDEAL, windSpeed: 7, pm10: 60 };

describe('점수 배점', () => {
  it('항목별 배점의 합이 100점이다', () => {
    const total = Object.values(SCORE_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(total).toBe(SCORE_MAX);
  });

  it.each(Object.keys(ACTIVITY_SCORE_WEIGHTS) as Activity[])(
    '%s의 활동별 배점 합도 100점이다',
    (activity) => {
      const total = Object.values(ACTIVITY_SCORE_WEIGHTS[activity]).reduce((sum, w) => sum + w, 0);
      expect(total).toBe(SCORE_MAX);
    },
  );

  it.each(DAYLIGHT_FIRST_ACTIVITIES)('%s는 낮/밤 배점이 모든 항목 중 가장 크다', (activity) => {
    const { daylight, ...others } = ACTIVITY_SCORE_WEIGHTS[activity];
    expect(daylight).toBeGreaterThan(Math.max(...Object.values(others)));
  });

  it('모든 조건이 이상적이면 정확히 100점이다', () => {
    expect(calcRunScore(IDEAL, NEUTRAL_SENSITIVITY, [], 'running')).toBe(100);
  });

  it('총점은 항목별 점수의 합을 반올림한 값이다', () => {
    const weather = { ...IDEAL, windSpeed: 7, pm10: 60 };
    const parts = Object.values(calcScoreBreakdown(weather, NEUTRAL_SENSITIVITY, [], 'running'));
    const sum = parts.reduce((a, b) => a + b, 0);
    expect(calcRunScore(weather, NEUTRAL_SENSITIVITY, [], 'running')).toBe(Math.round(sum));
  });
});

describe('calcRunScore', () => {
  it('극단적인 날씨에서도 0~100 범위를 벗어나지 않는다', () => {
    const extreme = {
      ...IDEAL,
      temp: -20,
      precipitation: 30,
      windSpeed: 30,
      pm10: 500,
      uvIndex: 15,
      humidity: 100,
      isDay: false,
    };
    const score = calcRunScore(extreme, NEUTRAL_SENSITIVITY, ['dustSensitive', 'uvSensitive'], 'running');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it.each(['running', 'walking'] as Activity[])(
    '%s는 밤이면 같은 날씨의 낮보다 일조 배점과 밤 추가 감점만큼 낮다',
    (activity) => {
      const day = calcRunScore(IDEAL, NEUTRAL_SENSITIVITY, [], activity);
      const night = calcRunScore({ ...IDEAL, isDay: false }, NEUTRAL_SENSITIVITY, [], activity);
      expect(day - night).toBe(SCORE_WEIGHTS.daylight + NIGHT_EXTRA_PENALTY);
    },
  );

  it('러닝은 날씨가 이상적인 낮은 100점 그대로이고, 이상적인 밤은 65점이다', () => {
    expect(calcRunScore(IDEAL, NEUTRAL_SENSITIVITY, [], 'running')).toBe(SCORE_MAX);
    expect(calcRunScore({ ...IDEAL, isDay: false }, NEUTRAL_SENSITIVITY, [], 'running')).toBe(65);
  });

  it.each(DAYLIGHT_FIRST_ACTIVITIES)('%s는 밤이면 점수가 낮 배점만큼 낮아져 65점이 된다', (activity) => {
    const night = { ...IDEAL, isDay: false };
    expect(calcRunScore(night, NEUTRAL_SENSITIVITY, [], activity)).toBe(
      SCORE_MAX - ACTIVITY_SCORE_WEIGHTS[activity].daylight,
    );
  });

  it.each(DAYLIGHT_FIRST_ACTIVITIES)('%s는 날씨가 이상적인 밤보다 평범한 낮의 점수가 높다', (activity) => {
    const night = calcRunScore({ ...IDEAL, isDay: false }, NEUTRAL_SENSITIVITY, [], activity);
    const day = calcRunScore(MEDIOCRE_DAY, NEUTRAL_SENSITIVITY, [], activity);
    expect(day).toBeGreaterThan(night);
  });

  it.each(['running', 'walking'] as Activity[])(
    '%s도 날씨가 이상적인 밤보다 평범한 낮의 점수가 높다',
    (activity) => {
      const night = calcRunScore({ ...IDEAL, isDay: false }, NEUTRAL_SENSITIVITY, [], activity);
      const day = calcRunScore(MEDIOCRE_DAY, NEUTRAL_SENSITIVITY, [], activity);
      expect(day).toBeGreaterThan(night);
    },
  );

  it.each(ALL_ACTIVITIES)('%s는 밤에 어떤 날씨여도 70점(좋음)과 80점(추천)에 닿지 못한다', (activity) => {
    const night = calcRunScore({ ...IDEAL, isDay: false }, NEUTRAL_SENSITIVITY, [], activity);
    expect(scoreToLevel(night)).not.toBe('good');
    expect(night).toBeLessThan(RECOMMEND_MIN_SCORE);
  });

  it.each([
    ['강수', { precipitation: 1 }],
    ['풍속', { windSpeed: 8 }],
    ['습도', { humidity: 85 }],
    ['미세먼지', { pm10: 100 }],
    ['자외선', { uvIndex: 9 }],
    ['기온', { temp: 33 }],
  ])('%s이 나빠지면 점수가 낮아진다', (_name, worse) => {
    const base = calcRunScore(IDEAL, NEUTRAL_SENSITIVITY, [], 'running');
    expect(calcRunScore({ ...IDEAL, ...worse }, NEUTRAL_SENSITIVITY, [], 'running')).toBeLessThan(base);
  });

  it('항목이 나쁠수록 점수가 단조 감소한다 (풍속)', () => {
    const scores = [2, 4, 6, 8, 10, 12].map((windSpeed) =>
      calcRunScore({ ...IDEAL, windSpeed }, NEUTRAL_SENSITIVITY, [], 'running'),
    );
    for (let i = 1; i < scores.length; i += 1) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });

  it('같은 날씨라도 활동마다 적정 체감온도가 달라 점수가 다르다', () => {
    const running = calcRunScore(IDEAL, NEUTRAL_SENSITIVITY, [], 'running');
    const walking = calcRunScore(IDEAL, NEUTRAL_SENSITIVITY, [], 'walking');
    expect(running).toBeGreaterThan(walking);
  });

  it('추위를 많이 타면 쌀쌀한 날 점수가 낮아진다', () => {
    const chilly = { ...IDEAL, temp: 6 };
    const coldSensitive = { ...NEUTRAL_SENSITIVITY, coldLevel: 5 };
    expect(calcRunScore(chilly, coldSensitive, [], 'running')).toBeLessThan(
      calcRunScore(chilly, NEUTRAL_SENSITIVITY, [], 'running'),
    );
  });

  it('미세먼지 민감 제약이 있으면 미세먼지 항목 점수가 더 낮다', () => {
    const dusty = { ...IDEAL, pm10: 80 };
    const plain = calcScoreBreakdown(dusty, NEUTRAL_SENSITIVITY, [], 'running').dust;
    const sensitive = calcScoreBreakdown(dusty, NEUTRAL_SENSITIVITY, ['dustSensitive'], 'running').dust;
    expect(sensitive).toBeLessThan(plain);
    expect(calcScoreBreakdown(dusty, NEUTRAL_SENSITIVITY, ['asthma'], 'running').dust).toBe(sensitive);
  });

  it('자외선 민감 제약이 있으면 자외선 항목 점수가 더 낮다', () => {
    const sunny = { ...IDEAL, uvIndex: 8 };
    expect(calcScoreBreakdown(sunny, NEUTRAL_SENSITIVITY, ['uvSensitive'], 'running').uv).toBeLessThan(
      calcScoreBreakdown(sunny, NEUTRAL_SENSITIVITY, [], 'running').uv,
    );
  });

  it('점수를 경고 단계로 변환한다', () => {
    expect(scoreToLevel(90)).toBe('good');
    expect(scoreToLevel(50)).toBe('caution');
    expect(scoreToLevel(10)).toBe('careful');
  });
});

describe('러닝 점수 5단계', () => {
  it('경계 점수에서 단계가 바뀐다', () => {
    expect(scoreToTier(100, 'running')).toBe('excellent');
    expect(scoreToTier(80, 'running')).toBe('excellent');
    expect(scoreToTier(79, 'running')).toBe('good');
    expect(scoreToTier(70, 'running')).toBe('good');
    expect(scoreToTier(69, 'running')).toBe('fair');
    expect(scoreToTier(60, 'running')).toBe('fair');
    expect(scoreToTier(59, 'running')).toBe('caution');
    expect(scoreToTier(45, 'running')).toBe('caution');
    expect(scoreToTier(44, 'running')).toBe('careful');
    expect(scoreToTier(0, 'running')).toBe('careful');
  });

  it('5단계는 기존 3단계 경고 단계 안에 포함된다', () => {
    const upperLevel = { excellent: 'good', good: 'good', fair: 'caution', caution: 'caution', careful: 'careful' };
    for (let score = 0; score <= SCORE_MAX; score += 1) {
      const tier = scoreToTier(score, 'running');
      expect(upperLevel[tier!]).toBe(scoreToLevel(score));
    }
  });

  it('러닝이 아닌 활동은 단계를 나누지 않고 기존 헤드라인을 쓴다', () => {
    expect(scoreToTier(90, 'walking')).toBeNull();
    expect(scoreToHeadline(90, 'walking')).toBe('활동하기 좋아요');
    expect(scoreToHeadline(50, 'cycling')).toBe('주의가 필요해요');
  });

  it.each(ALL_ACTIVITIES)('%s는 해가 진 뒤에 점수와 상관없이 야간 전용 헤드라인을 보여준다', (activity) => {
    expect(scoreToHeadline(95, activity, false)).toBe(NIGHT_HEADLINE);
    expect(scoreToHeadline(30, activity, false)).toBe(NIGHT_HEADLINE);
  });

  it('낮이거나 낮밤을 모르면 기존 헤드라인을 쓴다', () => {
    expect(scoreToHeadline(85, 'running', true)).toBe('지금 러닝하기 딱 좋아요');
    expect(scoreToHeadline(85, 'running')).toBe('지금 러닝하기 딱 좋아요');
  });

  it('러닝은 단계별 헤드라인을 보여준다', () => {
    expect(scoreToHeadline(85, 'running')).toBe('지금 러닝하기 딱 좋아요');
    expect(scoreToHeadline(30, 'running')).toBe('오늘은 푹 쉬어가는 걸 추천해요');
  });
});

describe('일몰 3시간 전까지만 낮으로 보는 점수', () => {
  /** 일몰 18:12 기준, 슬롯 시작 시각이 hour시일 때의 이상적인 날씨 */
  const SUNSET_HOUR = 18.2;
  const atHour = (hour: number): Weather => ({
    ...IDEAL,
    isDay: hour <= LAST_DAY_HOUR,
    hoursUntilSunset: SUNSET_HOUR - hour,
  });
  const FULL_DAY_SCORE = SCORE_MAX;
  const NO_DAYLIGHT_SCORE = SCORE_MAX - ACTIVITY_SCORE_WEIGHTS.hiking.daylight;

  it.each(DAYLIGHT_FIRST_ACTIVITIES)('%s는 일몰 3시간 전(15시)까지는 낮 만점이다', (activity) => {
    expect(calcRunScore(atHour(15), NEUTRAL_SENSITIVITY, [], activity)).toBe(FULL_DAY_SCORE);
  });

  it.each(DAYLIGHT_FIRST_ACTIVITIES)('%s는 해가 떠 있어도 16~18시는 낮 배점이 없다', (activity) => {
    [16, 17, 18].forEach((hour) => {
      expect(calcRunScore(atHour(hour), NEUTRAL_SENSITIVITY, [], activity)).toBe(NO_DAYLIGHT_SCORE);
    });
  });

  it.each(['running', 'walking'] as Activity[])('%s는 해가 떠 있으면 18시도 낮 만점이다', (activity) => {
    const withSunset = calcRunScore(atHour(18), NEUTRAL_SENSITIVITY, [], activity);
    const withoutSunset = calcRunScore(IDEAL, NEUTRAL_SENSITIVITY, [], activity);
    expect(withSunset).toBe(withoutSunset);
  });

  it('등산·자전거는 일몰 직전 시간대보다 일몰 3시간 전 시간대를 추천한다', () => {
    const hourly: HourlyWeather[] = [15, 16, 17, 18].map((hour) => ({ ...atHour(hour), hour }));
    DAYLIGHT_FIRST_ACTIVITIES.forEach((activity) => {
      const best = findBestHour(scoreHours(hourly, NEUTRAL_SENSITIVITY, [], activity));
      expect(best?.hour).toBe(15);
    });
  });
});

describe('findBestHour', () => {
  it('24시간 중 최고 점수 시간을 고른다', () => {
    const scores = scoreHours(DUMMY_HOURLY, NEUTRAL_SENSITIVITY, [], 'running');
    const best = findBestHour(scores);
    expect(best?.score).toBe(Math.max(...scores.map((s) => s.score)));
  });

  it('날씨가 같으면 밤 시간은 추천하지 않고 낮 시간 중 가장 이른 시간을 고른다', () => {
    const scores = scoreHours(IDEAL_DAY_AND_NIGHT, NEUTRAL_SENSITIVITY, [], 'running');
    expect(findBestHour(scores)?.hour).toBe(FIRST_DAY_HOUR);
  });

  it.each(DAYLIGHT_FIRST_ACTIVITIES)('%s는 밤 날씨가 더 좋아도 낮 시간을 고른다', (activity) => {
    const hourly: HourlyWeather[] = IDEAL_DAY_AND_NIGHT.map((h) =>
      h.isDay ? { ...MEDIOCRE_DAY, hour: h.hour, isDay: true } : h,
    );
    const scores = scoreHours(hourly, NEUTRAL_SENSITIVITY, [], activity);
    const best = findBestHour(scores);
    expect(best?.hour).toBeGreaterThanOrEqual(FIRST_DAY_HOUR);
    expect(best?.hour).toBeLessThanOrEqual(LAST_DAY_HOUR);
  });

  it.each(DAYLIGHT_FIRST_ACTIVITIES)('%s는 추천 구간에 밤 시간이 들어가지 않는다', (activity) => {
    const scores = scoreHours(IDEAL_DAY_AND_NIGHT, NEUTRAL_SENSITIVITY, [], activity);
    const range = findGoodRange(scores, findBestHour(scores));
    expect(range?.startHour).toBeGreaterThanOrEqual(FIRST_DAY_HOUR);
    expect(range?.endHour).toBeLessThanOrEqual(LAST_DAY_HOUR);
  });

  it('빈 목록이면 null', () => {
    expect(findBestHour([])).toBeNull();
  });

  it('시작 시각 이후에서만 고른다 (지난 시간대는 추천하지 않는다)', () => {
    const scores = [
      { hour: 0, score: 100 },
      { hour: 15, score: 60 },
      { hour: 18, score: 80 },
      { hour: 22, score: 70 },
    ];
    expect(findBestHour(scores, 16)).toEqual({ hour: 18, score: 80 });
    expect(findBestHour(scores)).toEqual({ hour: 0, score: 100 });
  });

  it('현재 시각 자체도 후보에 포함한다', () => {
    const scores = [
      { hour: 14, score: 90 },
      { hour: 15, score: 80 },
    ];
    expect(findBestHour(scores, 14)?.hour).toBe(14);
  });

  it('점수가 같으면 더 이른 시간을 고른다', () => {
    const scores = [
      { hour: 17, score: 90 },
      { hour: 19, score: 90 },
    ];
    expect(findBestHour(scores, 16)?.hour).toBe(17);
  });

  it('남은 시간대가 없으면 null', () => {
    expect(findBestHour([{ hour: 3, score: 90 }], 4)).toBeNull();
  });
});

describe('sliceFromHour', () => {
  /** 오늘 0~23시 + 내일 0~23시 */
  const TWO_DAYS = [...DUMMY_HOURLY, ...DUMMY_HOURLY];

  it('현재 시각부터 24시간을 내일까지 이어서 돌려준다', () => {
    const sliced = sliceFromHour(TWO_DAYS, 14);
    expect(sliced).toHaveLength(24);
    expect(sliced[0].hour).toBe(14);
    expect(sliced[9].hour).toBe(23);
    expect(sliced[10].hour).toBe(0);
    expect(sliced[23].hour).toBe(13);
  });

  it('하루치만 있으면 현재 시각 이후만 남긴다', () => {
    expect(sliceFromHour(DUMMY_HOURLY, 20).map((h) => h.hour)).toEqual([20, 21, 22, 23]);
  });

  it('현재 시각이 목록에 없으면 앞에서부터 쓴다', () => {
    expect(sliceFromHour(DUMMY_HOURLY, 99)[0].hour).toBe(0);
  });
});

describe('isTomorrowIndex', () => {
  it('자정을 넘긴 칸부터 내일이다 (14시 기준 10번째 칸이 0시)', () => {
    expect(isTomorrowIndex(0, 14)).toBe(false);
    expect(isTomorrowIndex(9, 14)).toBe(false);
    expect(isTomorrowIndex(10, 14)).toBe(true);
    expect(isTomorrowIndex(23, 14)).toBe(true);
  });

  it('0시 기준이면 24칸이 모두 오늘이다', () => {
    expect(isTomorrowIndex(23, 0)).toBe(false);
  });
});

describe('findBestHourToday', () => {
  /** 14시부터 24칸: 오늘 14~23시(10칸) + 내일 0~13시 */
  const scores = Array.from({ length: 24 }, (_, i) => ({
    hour: (14 + i) % 24,
    score: i === 15 ? 100 : 50,
  }));

  it('내일 칸에 최고점이 있어도 오늘 칸에서만 고른다', () => {
    expect(findBestHourToday(scores, 14)).toEqual({ hour: 14, score: 50 });
  });

  it('오늘 칸이 하나뿐이어도 고른다', () => {
    const lateScores = [
      { hour: 21, score: 70 },
      { hour: 22, score: 50 },
      { hour: 23, score: 50 },
      { hour: 0, score: 90 },
    ];
    expect(findBestHourToday(lateScores, 21)).toEqual({ hour: 21, score: 70 });
  });

  it('22시 이후(22시 정각 포함)는 점수가 높아도 추천하지 않는다', () => {
    const night = [
      { hour: 20, score: 60 },
      { hour: 21, score: 61 },
      { hour: 22, score: 99 },
      { hour: 23, score: 98 },
    ];
    expect(findBestHourToday(night, 20)).toEqual({ hour: 21, score: 61 });
  });

  it('남은 오늘 칸이 모두 22시 이후면 null', () => {
    expect(findBestHourToday([{ hour: 22, score: 90 }, { hour: 23, score: 90 }], 22)).toBeNull();
  });

  it('빈 목록이면 null', () => {
    expect(findBestHourToday([], 10)).toBeNull();
  });
});

describe('findBestHour 동점 처리', () => {
  const base = { score: 80, pm10: 30, uvIndex: 3, comfortGap: 0 };

  it('동점이면 미세먼지가 낮은 시간을 먼저 고른다', () => {
    const scores = [
      { hour: 8, ...base, pm10: 40 },
      { hour: 10, ...base, pm10: 20 },
    ];
    expect(findBestHour(scores)?.hour).toBe(10);
  });

  it('미세먼지가 같으면 자외선 지수가 낮은 시간을 고른다', () => {
    const scores = [
      { hour: 8, ...base, uvIndex: 7 },
      { hour: 10, ...base, uvIndex: 2 },
    ];
    expect(findBestHour(scores)?.hour).toBe(10);
  });

  it('미세먼지가 자외선보다 우선한다', () => {
    const scores = [
      { hour: 8, ...base, pm10: 20, uvIndex: 9 },
      { hour: 10, ...base, pm10: 40, uvIndex: 1 },
    ];
    expect(findBestHour(scores)?.hour).toBe(8);
  });

  it('자외선도 같으면 체감 쾌적 구간에 가까운 시간을 고른다', () => {
    const scores = [
      { hour: 8, ...base, comfortGap: 3 },
      { hour: 10, ...base, comfortGap: 1 },
    ];
    expect(findBestHour(scores)?.hour).toBe(10);
  });

  it('모두 같으면 더 이른 시간을 고른다', () => {
    expect(findBestHour([{ hour: 11, ...base }, { hour: 9, ...base }, { hour: 13, ...base }])?.hour).toBe(11);
  });

  it('점수가 다르면 동점 기준보다 점수가 우선이다', () => {
    const scores = [
      { hour: 8, ...base, score: 90, pm10: 99, uvIndex: 11, comfortGap: 9 },
      { hour: 10, ...base },
    ];
    expect(findBestHour(scores)?.hour).toBe(8);
  });

  it('scoreHours가 동점 기준 값을 함께 담는다', () => {
    const [first] = scoreHours([{ ...IDEAL, hour: 7, pm10: 12, uvIndex: 4 }], NEUTRAL_SENSITIVITY, [], 'running');
    expect(first).toMatchObject({ hour: 7, pm10: 12, uvIndex: 4 });
    expect(first.comfortGap).toBeGreaterThanOrEqual(0);
  });
});

describe('findGoodRange', () => {
  /** 7시부터 연속된 시각에 주어진 점수를 붙인다. */
  const toScores = (points: number[]) =>
    points.map((score, i) => ({ hour: 7 + i, score }));

  it('최고점과 3점 이내이고 80점 이상인 연속 시간대를 묶는다', () => {
    const scores = toScores([82, 81, 78, 60]);
    expect(findGoodRange(scores, scores[0])).toEqual({ startHour: 7, endHour: 8 });
  });

  it('최고점과 3점을 넘게 차이 나면 포함하지 않는다', () => {
    const scores = toScores([95, 92, 91, 85]);
    expect(findGoodRange(scores, scores[0])).toEqual({ startHour: 7, endHour: 8 });
  });

  it('중간에 끊기면 대표 시간대를 포함한 쪽만 묶는다', () => {
    const scores = toScores([84, 70, 85, 84, 83]);
    expect(findGoodRange(scores, scores[2])).toEqual({ startHour: 9, endHour: 11 });
  });

  it('대표 시간대 앞쪽으로도 확장한다', () => {
    const scores = toScores([79, 82, 84]);
    expect(findGoodRange(scores, scores[2])).toEqual({ startHour: 8, endHour: 9 });
  });

  it('최고점 - 3점이 80보다 낮아도 80점 미만은 포함하지 않는다', () => {
    const scores = toScores([79, 80, 82]);
    expect(findGoodRange(scores, scores[2])).toEqual({ startHour: 8, endHour: 9 });
  });

  it('최고점이 80점 미만이면 null이다', () => {
    const scores = toScores([79, 78, 77]);
    expect(findGoodRange(scores, scores[0])).toBeNull();
  });

  it('대표 시간대 하나뿐이면 null이다', () => {
    const scores = toScores([90, 70, 60]);
    expect(findGoodRange(scores, scores[0])).toBeNull();
  });

  it('대표 시간대가 없으면 null이다', () => {
    expect(findGoodRange([], null)).toBeNull();
  });
});

describe('비염 점수', () => {
  const score = (weather: typeof IDEAL, constraints: Parameters<typeof calcRunScore>[2]) =>
    calcRunScore(weather, NEUTRAL_SENSITIVITY, constraints, 'running');

  it('쾌적한 날씨에서는 비염을 체크해도 점수가 같다', () => {
    expect(score(IDEAL, ['rhinitis'])).toBe(score(IDEAL, []));
  });

  it('건조한 공기(습도 20%)에서는 비염이면 점수가 더 낮다', () => {
    const dry = { ...IDEAL, humidity: 20 };
    expect(score(dry, ['rhinitis'])).toBeLessThan(score(dry, []));
  });

  it('습한 공기(습도 80%)에서는 비염이어도 점수가 같다', () => {
    const wet = { ...IDEAL, humidity: 80 };
    expect(score(wet, ['rhinitis'])).toBe(score(wet, []));
  });

  it('찬 공기(0°C)에서는 비염이면 점수가 더 낮다', () => {
    const cold = { ...IDEAL, temp: 0 };
    expect(score(cold, ['rhinitis'])).toBeLessThan(score(cold, []));
  });

  it('더운 날씨(30°C)에서는 비염이어도 점수가 같다', () => {
    const hot = { ...IDEAL, temp: 30 };
    expect(score(hot, ['rhinitis'])).toBe(score(hot, []));
  });

  it('미세먼지는 미세먼지 민감과 같은 감점을 준다', () => {
    const dusty = { ...IDEAL, pm10: 100 };
    expect(score(dusty, ['rhinitis'])).toBe(score(dusty, ['dustSensitive']));
  });
});

describe('findGoodRange 22시 제외', () => {
  it('좋은 구간이 22시를 넘어 이어져도 21시에서 끊는다', () => {
    const scores = [
      { hour: 20, score: 90 },
      { hour: 21, score: 90 },
      { hour: 22, score: 90 },
      { hour: 23, score: 90 },
    ];
    expect(findGoodRange(scores, scores[0])).toEqual({ startHour: 20, endHour: 21 });
  });
});

describe('밤 시간대는 추천에서 제외한다', () => {
  it('isRecommendableHour: 해가 진 뒤(isDay=false)와 22시 이후는 제외하고, 낮밤을 모르면 시각만 본다', () => {
    expect(isRecommendableHour(15, true)).toBe(true);
    expect(isRecommendableHour(15)).toBe(true);
    expect(isRecommendableHour(15, false)).toBe(false);
    expect(isRecommendableHour(22, true)).toBe(false);
  });

  it('점수가 더 높아도 밤 시간대는 오늘의 추천 시간으로 뽑지 않는다', () => {
    const scores = [
      { hour: 17, score: 70, isDay: true },
      { hour: 19, score: 95, isDay: false },
      { hour: 20, score: 95, isDay: false },
    ];
    expect(findBestHourToday(scores, 17)?.hour).toBe(17);
  });

  it('남은 시간이 모두 밤이면 추천 시간이 없다', () => {
    const scores = [
      { hour: 20, score: 65, isDay: false },
      { hour: 21, score: 65, isDay: false },
    ];
    expect(findBestHourToday(scores, 20)).toBeNull();
  });

  it('구간 추천에도 밤 시간대를 넣지 않는다', () => {
    const scores = [
      { hour: 16, score: 90, isDay: true },
      { hour: 17, score: 90, isDay: true },
      { hour: 18, score: 90, isDay: false },
    ];
    const best = findBestHourToday(scores, 16);
    expect(findGoodRange(scores, best)).toEqual({ startHour: 16, endHour: 17 });
  });

  it('scoreHours는 시간대의 낮밤을 담아 준다', () => {
    const scores = scoreHours(IDEAL_DAY_AND_NIGHT, NEUTRAL_SENSITIVITY, [], 'running');
    expect(scores[12].isDay).toBe(true);
    expect(scores[23].isDay).toBe(false);
  });

  it('밤 23시의 러닝 점수는 낮보다 낮고 추천에서 빠져 "추천 시간 없음"과 모순되지 않는다', () => {
    const scores = scoreHours(IDEAL_DAY_AND_NIGHT, NEUTRAL_SENSITIVITY, [], 'running');
    expect(scores[23].score).toBe(65);
    expect(findBestHourToday(scores.slice(23), 23)).toBeNull();
  });
});

describe('러닝은 해 진 뒤 21시까지 일조 감점이 없다', () => {
  /** 해가 진 저녁의 이상적인 날씨 (시각을 정해 준다) */
  const eveningAt = (hour: number): Weather => ({ ...IDEAL, isDay: false, hour });

  it.each([18, 19, 21])('러닝 %s시(해 진 뒤)는 낮과 같은 100점이다', (hour) => {
    expect(calcRunScore(eveningAt(hour), NEUTRAL_SENSITIVITY, [], 'running')).toBe(SCORE_MAX);
  });

  it('22시부터는 기존처럼 밤 65점이다', () => {
    expect(calcRunScore(eveningAt(22), NEUTRAL_SENSITIVITY, [], 'running')).toBe(65);
    expect(calcRunScore(eveningAt(23), NEUTRAL_SENSITIVITY, [], 'running')).toBe(65);
  });

  it('새벽의 어두운 시간(정오 전)은 면제하지 않는다', () => {
    expect(calcRunScore(eveningAt(5), NEUTRAL_SENSITIVITY, [], 'running')).toBe(65);
  });

  it('시각을 모르면 면제하지 않는다', () => {
    expect(calcRunScore({ ...IDEAL, isDay: false }, NEUTRAL_SENSITIVITY, [], 'running')).toBe(65);
  });

  it('산책·등산·자전거는 저녁에도 기존 밤 점수를 쓴다', () => {
    const night = eveningAt(19);
    const noHour = { ...IDEAL, isDay: false };
    (['walking', 'hiking', 'cycling'] as Activity[]).forEach((activity) => {
      expect(calcRunScore(night, NEUTRAL_SENSITIVITY, [], activity)).toBe(
        calcRunScore(noHour, NEUTRAL_SENSITIVITY, [], activity),
      );
    });
  });

  it('저녁 구간의 일조 항목은 감점 없이 만점이다', () => {
    const breakdown = calcScoreBreakdown(eveningAt(20), NEUTRAL_SENSITIVITY, [], 'running');
    expect(breakdown.daylight).toBe(SCORE_WEIGHTS.daylight);
  });

  it('scoreHours는 러닝 저녁 구간을 추천 가능한 시간대로 담고 22시부터는 뺀다', () => {
    const hourly = IDEAL_DAY_AND_NIGHT.map((h) => ({ ...h, hour: h.hour }));
    const running = scoreHours(hourly, NEUTRAL_SENSITIVITY, [], 'running');
    expect(running[20].isDay).toBe(true);
    expect(running[21].isDay).toBe(true);
    expect(running[22].isDay).toBe(false);
    expect(running[3].isDay).toBe(false);
    const cycling = scoreHours(hourly, NEUTRAL_SENSITIVITY, [], 'cycling');
    expect(cycling[20].isDay).toBe(false);
  });

  it('러닝 저녁 구간은 오늘의 추천 시간 후보가 된다', () => {
    const running = scoreHours(IDEAL_DAY_AND_NIGHT, NEUTRAL_SENSITIVITY, [], 'running');
    const evening = running.slice(20);
    expect(findBestHourToday(evening, 20)?.hour).toBe(20);
  });

  it('저녁 구간에서는 점수 단계 헤드라인을 쓰고, 그 밖의 밤에는 야간 헤드라인을 쓴다', () => {
    const evening = hasDaylightScore(eveningAt(19), 'running');
    const lateNight = hasDaylightScore(eveningAt(23), 'running');
    expect(scoreToHeadline(95, 'running', evening)).toBe('지금 러닝하기 딱 좋아요');
    expect(scoreToHeadline(65, 'running', lateNight)).toBe(NIGHT_HEADLINE);
  });
});

describe('미세먼지 값 없음', () => {
  const NO_DUST: Weather = { ...IDEAL, pm10: 0, pm10Source: 'none' };

  it('값이 없으면 미세먼지 만점을 주지 않아 100점이 나오지 않는다', () => {
    expect(calcRunScore(IDEAL, NEUTRAL_SENSITIVITY, [], 'running')).toBe(SCORE_MAX);
    expect(calcRunScore(NO_DUST, NEUTRAL_SENSITIVITY, [], 'running')).toBeLessThan(SCORE_MAX);
  });

  it('값이 없을 때는 PM10 80(보통의 끝)으로 계산한 것과 같다', () => {
    const unknown = calcScoreBreakdown(NO_DUST, NEUTRAL_SENSITIVITY, [], 'running').dust;
    const at80 = calcScoreBreakdown({ ...IDEAL, pm10: 80 }, NEUTRAL_SENSITIVITY, [], 'running').dust;
    expect(unknown).toBe(at80);
  });

  it('값이 없는 시간대의 0은 베스트 시간 동점 비교에서 제외된다', () => {
    const [scored] = scoreHours([{ ...NO_DUST, hour: 12 }], NEUTRAL_SENSITIVITY, [], 'running');
    expect(scored.pm10).toBeUndefined();
  });
});

describe("미세먼지 '나쁨' 점수 상한", () => {
  const BAD_DUST: Weather = { ...IDEAL, pm10: 85 };
  const score = (weather: Weather, constraints: Constraint[]) =>
    calcRunScore(weather, NEUTRAL_SENSITIVITY, constraints, 'running');

  it('나쁨이면 다른 항목이 완벽해도 좋음 단계(70점) 아래다', () => {
    expect(score(BAD_DUST, [])).toBeLessThanOrEqual(DUST_BAD_SCORE_CAP);
    expect(scoreToHeadline(score(BAD_DUST, []), 'running')).not.toBe(RUNNING_TIER_LABEL.excellent);
  });

  it.each<Constraint>(['dustSensitive', 'asthma', 'rhinitis'])(
    '%s 사용자는 나쁨에서 더 낮은 상한(44점)이 걸린다',
    (constraint) => {
      const result = score(BAD_DUST, [constraint]);
      expect(result).toBeLessThanOrEqual(DUST_BAD_SENSITIVE_SCORE_CAP);
      expect(scoreToTier(result, 'running')).toBe('careful');
    },
  );

  it('보통(80 이하)이면 상한이 없다', () => {
    expect(score({ ...IDEAL, pm10: 80 }, [])).toBeGreaterThan(DUST_BAD_SCORE_CAP);
  });

  it('값이 없으면 나쁨으로 보지 않아 상한이 걸리지 않는다', () => {
    expect(score({ ...IDEAL, pm10: 0, pm10Source: 'none' }, [])).toBeGreaterThan(DUST_BAD_SCORE_CAP);
  });

  it('이미 점수가 상한보다 낮으면 그대로 둔다', () => {
    const rainy: Weather = { ...BAD_DUST, precipitation: 20 };
    const uncapped = Object.values(
      calcScoreBreakdown({ ...rainy, pm10: 81 }, NEUTRAL_SENSITIVITY, [], 'running'),
    ).reduce((a, b) => a + b, 0);
    expect(score(rainy, [])).toBe(Math.round(Math.max(0, uncapped)));
  });

  it('항목별 점수의 합이 총점과 같다 (감점 이유 합계가 어긋나지 않는다)', () => {
    const breakdown = calcScoreBreakdown(BAD_DUST, NEUTRAL_SENSITIVITY, ['dustSensitive'], 'running');
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    expect(Math.round(total)).toBe(score(BAD_DUST, ['dustSensitive']));
  });

  it('사용자가 본 사례: PM10 85 + 민감은 더 이상 "딱 좋아요"가 아니다', () => {
    const result = score(BAD_DUST, ['dustSensitive']);
    expect(result).toBeLessThan(RECOMMEND_MIN_SCORE);
    expect(scoreToHeadline(result, 'running')).not.toBe(RUNNING_TIER_LABEL.excellent);
  });
});

describe("미세먼지 '보통' 민감군 점수 상한", () => {
  const score = (pm10: number, constraints: Constraint[]) =>
    calcRunScore({ ...IDEAL, pm10 }, NEUTRAL_SENSITIVITY, constraints, 'running');

  it.each<Constraint>(['dustSensitive', 'asthma', 'rhinitis'])(
    '%s 사용자는 보통(31~80) 어디서도 79점을 넘지 않는다',
    (constraint) => {
      for (const pm10 of [31, 55, 80]) {
        expect(score(pm10, [constraint])).toBeLessThanOrEqual(DUST_NORMAL_SENSITIVE_SCORE_CAP);
      }
      expect(DUST_NORMAL_SENSITIVE_SCORE_CAP).toBeLessThan(RECOMMEND_MIN_SCORE);
    },
  );

  it('민감군이라도 좋음(30 이하)이면 상한이 없다', () => {
    expect(score(30, ['dustSensitive'])).toBe(SCORE_MAX);
  });

  it('민감하지 않으면 보통에서도 상한이 없다', () => {
    expect(score(55, [])).toBeGreaterThan(DUST_NORMAL_SENSITIVE_SCORE_CAP);
  });

  it('보통(80) 민감군은 79점, 나쁨(81)은 44점으로 단계가 내려간다', () => {
    expect(score(80, ['dustSensitive'])).toBe(DUST_NORMAL_SENSITIVE_SCORE_CAP);
    expect(score(81, ['dustSensitive'])).toBeLessThanOrEqual(DUST_BAD_SENSITIVE_SCORE_CAP);
  });

  it('값이 없으면 보통으로 보지 않아 상한이 걸리지 않는다', () => {
    const none: Weather = { ...IDEAL, pm10: 0, pm10Source: 'none' };
    const result = calcRunScore(none, NEUTRAL_SENSITIVITY, ['dustSensitive'], 'running');
    expect(result).toBeGreaterThan(DUST_BAD_SENSITIVE_SCORE_CAP);
  });
});

describe("미세먼지 '매우나쁨' 점수 상한", () => {
  const score = (pm10: number, constraints: Constraint[]) =>
    calcRunScore({ ...IDEAL, pm10 }, NEUTRAL_SENSITIVITY, constraints, 'running');

  it('매우나쁨이면 일반 사용자도 쉬어가기 단계(44점 이하)다', () => {
    const result = score(151, []);
    expect(result).toBeLessThanOrEqual(DUST_VERY_BAD_SCORE_CAP);
    expect(scoreToTier(result, 'running')).toBe('careful');
  });

  it('민감군은 매우나쁨에서도 44점 이하다', () => {
    expect(score(200, ['dustSensitive'])).toBeLessThanOrEqual(DUST_VERY_BAD_SCORE_CAP);
  });

  it('나쁨(150)과 매우나쁨(151) 사이에서 일반 사용자의 상한이 69점에서 44점으로 내려간다', () => {
    expect(score(150, [])).toBeLessThanOrEqual(DUST_BAD_SCORE_CAP);
    expect(score(150, [])).toBeGreaterThan(DUST_VERY_BAD_SCORE_CAP);
    expect(score(151, [])).toBeLessThanOrEqual(DUST_VERY_BAD_SCORE_CAP);
  });
});
