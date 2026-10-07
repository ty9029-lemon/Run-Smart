import { useEffect } from 'react';
import DecisionButtons from './DecisionButtons';
import GuideBox, { type LocationNoticeProps } from './GuideBox';
import HomeSummary from './HomeSummary';
import HourlyForecast from './HourlyForecast';
import WeatherCard from './WeatherCard';
import { buildDummyGuide } from '../data/dummyGuide';
import { getActivityMeta } from '../constants/activities';
import { useNow } from '../hooks/useNow';
import { formatRawWeather } from '../constants/messages';
import { findBestHourToday, scoreHours, sliceFromHour } from '../lib/bestHour';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { calcPersonalFeelsLike } from '../lib/feelsLike';
import { recommendOutfit } from '../lib/outfit';
import { calcRunScore, scoreToLevel } from '../lib/runScore';
import { useHistoryStore } from '../store/historyStore';
import { useProfileStore } from '../store/profileStore';
import type { WeatherResult } from '../services/weatherService';
import type { Activity, Decision, GuideState, Profile } from '../types';

interface HomeReadyProps {
  activity: Activity;
  profile: Profile;
  weather: WeatherResult;
  /** AI 가이드 상태 (불러오는 중, 실패, 완료) */
  guide: GuideState;
  /** 위치 권한이 없어 서울 기준일 때만 전달한다 (가이드 칸에 안내와 버튼을 보여준다) */
  location?: LocationNoticeProps;
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
export default function HomeReady({
  activity,
  profile,
  weather,
  guide,
  location,
}: HomeReadyProps) {
  const setLastActivity = useProfileStore((s) => s.setLastActivity);
  const addEntry = useHistoryStore((s) => s.addEntry);
  const decision = useTodayDecision(activity);
  const { current, hourly } = weather;
  const offset = profile.offsets[activity];
  const score = calcRunScore(current, offset, profile.constraints, activity);
  const feelsLike = calcPersonalFeelsLike(current, offset);
  const nowHour = useNow().getHours();
  const upcomingHourly = sliceFromHour(hourly, nowHour);
  const scores = scoreHours(upcomingHourly, offset, profile.constraints, activity);
  const best = findBestHourToday(scores, nowHour);
  const rawWeather = formatRawWeather(current.temp, current.condition, current.windSpeed);

  // 활동이나 점수가 바뀌어 새 결과가 보일 때마다 전송
  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.runScoreViewed, {
      activity,
      score,
      warningLevel: scoreToLevel(score),
      condition: current.condition,
    });
  }, [activity, score, current.condition]);

  /** 활동 칩이 바뀌면 이벤트를 보내고 마지막 활동을 저장한다. */
  const handleSelectActivity = (next: Activity) => {
    if (next !== activity) {
      trackEvent(ANALYTICS_EVENTS.activityChanged, { from: activity, to: next });
    }
    setLastActivity(next);
  };

  /** 결정을 히스토리에 기록한다. */
  const handleDecide = (next: Decision) => {
    trackEvent(ANALYTICS_EVENTS.decisionMade, { decision: next, activity, score });
    addEntry({
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      activity,
      decision: next,
      weatherSummary: `${current.temp}°C, ${current.condition}, 바람 ${current.windSpeed}m/s`,
      // AI 가이드가 없으면 앱 내 계산 기반 가이드를 기록으로 남긴다.
      guide:
        guide.state === 'ready'
          ? guide.data
          : buildDummyGuide(activity, current, offset, profile.constraints),
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
        onSelectActivity={handleSelectActivity}
      />
      <WeatherCard weather={current} feelsLike={feelsLike} />
      <GuideBox guide={guide} rawWeather={rawWeather} location={location} />
      <HourlyForecast
        hourly={upcomingHourly}
        scores={scores}
        best={best}
        activityLabel={getActivityMeta(activity).label}
      />
      <DecisionButtons decision={decision} onDecide={handleDecide} />
    </div>
  );
}
