import { HISTORY_DAYS, MS_PER_DAY } from '../constants/thresholds';
import type { Activity, Decision, HistoryEntry } from '../types';
import { buildDummyGuide } from './dummyGuide';
import { DUMMY_CURRENT_WEATHER } from './dummyWeather';

/** [며칠 전, 활동, 결정, 기온 변화] */
const SEED: [number, Activity, Decision, number][] = [
  [1, 'running', 'go', 1],
  [2, 'walking', 'go', 3],
  [3, 'running', 'skip', -4],
  [5, 'hiking', 'go', 2],
  [6, 'outing', 'skip', -2],
];

/**
 * 최근 7일 더미 히스토리를 만든다.
 * @param now 기준 시각(ms)
 */
export function createDummyHistory(now: number): HistoryEntry[] {
  return SEED.filter(([daysAgo]) => daysAgo < HISTORY_DAYS).map(
    ([daysAgo, activity, decision, tempDiff]) => {
      const weather = {
        ...DUMMY_CURRENT_WEATHER,
        temp: DUMMY_CURRENT_WEATHER.temp + tempDiff,
      };
      return {
        id: `seed-${daysAgo}`,
        date: new Date(now - daysAgo * MS_PER_DAY).toISOString(),
        activity,
        decision,
        weatherSummary: `${weather.temp}°C, ${weather.condition}, 바람 ${weather.windSpeed}m/s`,
        guide: buildDummyGuide(activity, weather, 0, []),
      };
    },
  );
}
