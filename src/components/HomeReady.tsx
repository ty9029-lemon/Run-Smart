import DecisionButtons from './DecisionButtons';
import GuideBox from './GuideBox';
import HomeSummary from './HomeSummary';
import HourlyForecast from './HourlyForecast';
import WeatherCard from './WeatherCard';
import { findBestHour, scoreHours } from '../lib/bestHour';
import { calcPersonalFeelsLike } from '../lib/feelsLike';
import { recommendOutfit } from '../lib/outfit';
import { calcRunScore, scoreToLevel } from '../lib/runScore';
import { useHistoryStore } from '../store/historyStore';
import { useProfileStore } from '../store/profileStore';
import type { WeatherResult } from '../services/weatherService';
import type { Activity, AiGuide, Decision, Profile } from '../types';

interface HomeReadyProps {
  activity: Activity;
  profile: Profile;
  weather: WeatherResult;
  guide: AiGuide;
}

/** 오늘 이 활동에 대한 기록된 결정을 찾는다. */
function useTodayDecision(activity: Activity): Decision | null {
  const entries = useHistoryStore((s) => s.entries);
  const today = new Date().toDateString();
  const found = entries.find(
    (e) => e.activity === activity && new Date(e.date).toDateString() === today,
  );
  return found?.decision ?? null;
}

/** 날씨·가이드가 준비됐을 때의 홈 본문 */
export default function HomeReady({ activity, profile, weather, guide }: HomeReadyProps) {
  const setLastActivity = useProfileStore((s) => s.setLastActivity);
  const addEntry = useHistoryStore((s) => s.addEntry);
  const decision = useTodayDecision(activity);
  const { current, hourly } = weather;
  const offset = profile.offsets[activity];
  const score = calcRunScore(current, offset, profile.constraints);
  const feelsLike = calcPersonalFeelsLike(current, offset);
  const scores = scoreHours(hourly, offset, profile.constraints);

  /** 결정을 히스토리에 기록한다. */
  const handleDecide = (next: Decision) => {
    addEntry({
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      activity,
      decision: next,
      weatherSummary: `${current.temp}°C, ${current.condition}, 바람 ${current.windSpeed}m/s`,
      guide,
    });
  };

  return (
    <div className="space-y-6">
      <HomeSummary
        activities={profile.selectedActivities}
        activity={activity}
        score={score}
        level={scoreToLevel(score)}
        outfit={recommendOutfit(feelsLike, current.precipitation)}
        onSelectActivity={setLastActivity}
      />
      <WeatherCard weather={current} feelsLike={feelsLike} />
      <GuideBox guide={guide} />
      <HourlyForecast hourly={hourly} scores={scores} best={findBestHour(scores)} />
      <DecisionButtons decision={decision} onDecide={handleDecide} />
    </div>
  );
}
