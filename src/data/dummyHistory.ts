import { HISTORY_DAYS, MS_PER_DAY } from '../constants/thresholds';
import { recommendOutfit } from '../lib/outfit';
import type { Activity, Decision, Feedback, HistoryEntry } from '../types';
import { calcPersonalFeelsLike, NEUTRAL_SENSITIVITY } from '../lib/feelsLike';
import { buildDummyGuide } from './dummyGuide';
import { DUMMY_CURRENT_WEATHER } from './dummyWeather';

/** [며칠 전, 활동, 결정, 기온 변화, 피드백] */
const SEED: [number, Activity, Decision, number, Feedback?][] = [
  [1, 'running', 'go', 1, 'good'],
  [2, 'walking', 'go', 3, 'hot'],
  [3, 'running', 'skip', -4],
  [5, 'hiking', 'go', 2, 'cold'],
  [6, 'walking', 'skip', -2],
];

/**
 * 최근 일주일 더미 히스토리를 만든다.
 * @param now 기준 시각(ms)
 */
export function createDummyHistory(now: number): HistoryEntry[] {
  return SEED.filter(([daysAgo]) => daysAgo < HISTORY_DAYS).map(
    ([daysAgo, activity, decision, tempDiff, feedback]) => {
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
        guide: buildDummyGuide(activity, weather, NEUTRAL_SENSITIVITY, []),
        outfit: recommendOutfit(
          calcPersonalFeelsLike(weather, NEUTRAL_SENSITIVITY),
          weather,
          activity,
        ),
        // 피드백은 실제로 다녀온 기록에만 남는다.
        ...(decision === 'go' && feedback ? { feedback } : {}),
      };
    },
  );
}
