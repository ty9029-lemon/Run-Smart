import { useEffect, useMemo, useState } from 'react';
import DecisionButtons from './DecisionButtons';
import DepartureToast from './DepartureToast';
import FeedbackCard from './FeedbackCard';
import GuideBox, { type LocationNoticeProps } from './GuideBox';
import HomeSummary from './HomeSummary';
import HourlyForecast from './HourlyForecast';
import WeatherCard from './WeatherCard';
import { buildDummyGuide } from '../data/dummyGuide';
import { getActivityMeta } from '../constants/activities';
import { useNow } from '../hooks/useNow';
import { formatRawWeather } from '../constants/messages';
import { ACTIVITY_DAYLIGHT_BUFFER_HOURS } from '../constants/scoring';
import {
  findBestHourToday,
  findGoodRange,
  scoreHours,
  sliceFromHour,
  sliceToday,
} from '../lib/bestHour';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { recordDecisionAndCheckChange } from '../lib/decisionTracking';
import { calcPersonalFeelsLike } from '../lib/feelsLike';
import { recommendOutfit } from '../lib/outfit';
import { calcRunScore, scoreToLevel } from '../lib/runScore';
import { getSunsetStatus } from '../lib/scoreFactors';
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
  const removeEntry = useHistoryStore((s) => s.removeEntry);
  // 방금 기록한 출발 항목 id (토스트의 '실행 취소' 대상)
  const [departureId, setDepartureId] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const now = useNow();
  const { current, hourly } = weather;
  const { coldLevel, heatLevel, feedbackOffset } = profile;
  const sensitivity = useMemo(
    () => ({ coldLevel, heatLevel, feedbackOffset }),
    [coldLevel, heatLevel, feedbackOffset],
  );
  const score = calcRunScore(current, sensitivity, profile.constraints, activity);
  const feelsLike = calcPersonalFeelsLike(current, sensitivity);
  const nowHour = now.getHours();
  const upcomingHourly = sliceFromHour(hourly, nowHour);
  const scores = scoreHours(upcomingHourly, sensitivity, profile.constraints, activity);
  const best = findBestHourToday(scores, nowHour);
  const range = findGoodRange(sliceToday(scores, nowHour), best);
  const rawWeather = formatRawWeather(current.temp, current.condition, current.windSpeed);
  const outfit = recommendOutfit(feelsLike, current, activity, profile.constraints);

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

  /** 출발을 히스토리에 기록하고 토스트를 띄운다. */
  const handleDecide = () => {
    const next: Decision = 'go';
    const decidedAt = new Date();
    // 오늘 이미 결정한 적이 있으면(취소 후 재결정 포함) isChange로 구분해 집계 중복을 피한다
    const isChange = recordDecisionAndCheckChange(activity, decidedAt);
    trackEvent(ANALYTICS_EVENTS.decisionMade, { decision: next, activity, score, isChange });
    const entryId = `${decidedAt.getTime()}`;
    addEntry({
      id: entryId,
      date: decidedAt.toISOString(),
      activity,
      decision: next,
      weatherSummary: `${current.temp}°C, ${current.condition}, 바람 ${current.windSpeed}m/s`,
      feelsLike,
      // 기록 화면에서 당시 추천 복장을 다시 보여주기 위해 함께 저장한다.
      outfit,
      // AI 가이드가 없으면 앱 내 계산 기반 가이드를 기록으로 남긴다.
      guide:
        guide.state === 'ready'
          ? guide.data
          : buildDummyGuide(activity, current, sensitivity, profile.constraints),
    });
    setDepartureId(entryId);
    setToastOpen(true);
  };

  /** 토스트의 '실행 취소': 방금 기록한 출발을 삭제한다. */
  const handleUndo = () => {
    if (!departureId) return;
    trackEvent(ANALYTICS_EVENTS.decisionCancelled, { decision: 'go', activity });
    removeEntry(departureId);
    setDepartureId(null);
  };

  return (
    <div className="space-y-6">
      <FeedbackCard />
      <HomeSummary
        activities={profile.selectedActivities}
        activity={activity}
        score={score}
        level={scoreToLevel(score)}
        outfit={outfit}
        onSelectActivity={handleSelectActivity}
      />
      <WeatherCard weather={current} feelsLike={feelsLike} />
      <GuideBox guide={guide} rawWeather={rawWeather} location={location} />
      <HourlyForecast
        hourly={upcomingHourly}
        scores={scores}
        best={best}
        range={range}
        activityLabel={getActivityMeta(activity).label}
        sunsetStatus={getSunsetStatus(
          current.hoursUntilSunset,
          ACTIVITY_DAYLIGHT_BUFFER_HOURS[activity],
        )}
      />
      <DecisionButtons onDecide={handleDecide} />
      <DepartureToast
        open={toastOpen}
        activityLabel={getActivityMeta(activity).label}
        onOpenChange={setToastOpen}
        onUndo={handleUndo}
      />
    </div>
  );
}
