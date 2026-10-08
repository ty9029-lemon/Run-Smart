import { describe, expect, it } from 'vitest';
import { ACTIVITY_SCORE_WEIGHTS, SCORE_WEIGHTS } from '../constants/scoring';
import { SCORE_MAX } from '../constants/thresholds';
import { DUMMY_HOURLY } from '../data/dummyWeather';
import type { Activity, HourlyWeather, Weather } from '../types';
import {
  findBestHour,
  findBestHourToday,
  findGoodRange,
  scoreHours,
  sliceFromHour,
} from './bestHour';
import { NEUTRAL_SENSITIVITY } from './feelsLike';
import { calcRunScore, calcScoreBreakdown, scoreToLevel } from './runScore';

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

  it('밤이면 낮보다 낮 항목 배점만큼 낮다', () => {
    const night = { ...IDEAL, isDay: false };
    expect(calcRunScore(night, NEUTRAL_SENSITIVITY, [], 'running')).toBe(100 - SCORE_WEIGHTS.daylight);
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

  it('러닝은 날씨가 평범한 낮보다 이상적인 밤의 점수가 높다 (기존 동작 유지)', () => {
    const night = calcRunScore({ ...IDEAL, isDay: false }, NEUTRAL_SENSITIVITY, [], 'running');
    const day = calcRunScore(MEDIOCRE_DAY, NEUTRAL_SENSITIVITY, [], 'running');
    expect(night).toBeGreaterThan(day);
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
    expect(findBestHourToday([{ hour: 23, score: 70 }, { hour: 0, score: 90 }], 23)).toEqual({
      hour: 23,
      score: 70,
    });
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
