import { useEffect, useMemo, useState } from 'react';
import AppReviewDialog from './AppReviewDialog';
import DecisionButtons from './DecisionButtons';
import DepartureToast from './DepartureToast';
import FeedbackCard from './FeedbackCard';
import GuideBox, { type LocationNoticeProps } from './GuideBox';
import HomeSummary from './HomeSummary';
import HourlyForecast from './HourlyForecast';
import WeatherCard from './WeatherCard';
import { buildDummyGuide } from '../data/dummyGuide';
import { getActivityMeta } from '../constants/activities';
import { useActiveSession } from '../hooks/useActiveSession';
import { useAppReview } from '../hooks/useAppReview';
import { useElapsedSinceMount } from '../hooks/useElapsedSinceMount';
import { useFeedbackPrompt } from '../hooks/useFeedbackPrompt';
import { useNow } from '../hooks/useNow';
import { formatRawWeather } from '../constants/messages';
import { ACTIVITY_DAYLIGHT_BUFFER_HOURS } from '../constants/scoring';
import { MS_PER_SECOND } from '../constants/thresholds';
import {
  findBestHourToday,
  findGoodRange,
  scoreHours,
  sliceFromHour,
  sliceToday,
} from '../lib/bestHour';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { decisionTimingProps, recordDecisionAndCheckChange } from '../lib/decisionTracking';
import { getDepartureStatus } from '../lib/departureStatus';
import { calcPersonalFeelsLike } from '../lib/feelsLike';
import { recommendOutfit } from '../lib/outfit';
import { calcRunScore, scoreToLevel } from '../lib/runScore';
import { getSunsetStatus } from '../lib/scoreFactors';
import { useActiveSessionStore } from '../store/activeSessionStore';
import { useHistoryStore } from '../store/historyStore';
import { useProfileStore } from '../store/profileStore';
import type { WeatherResult } from '../services/weatherService';
import type { Activity, GuideState, HistoryEntry, Profile } from '../types';

interface HomeReadyProps {
  activity: Activity;
  profile: Profile;
  weather: WeatherResult;
  /** AI 가이드 상태 (불러오는 중, 실패, 완료) */
  guide: GuideState;
  /** 위치 권한이 없어 서울 기준일 때만 전달한다 (가이드 칸에 안내와 버튼을 보여준다) */
  location?: LocationNoticeProps;
}

/** 오늘 이 활동으로 기록한 가장 최근 출발 항목을 찾는다. (entries는 최신순) */
function useTodayEntry(activity: Activity): HistoryEntry | null {
  const entries = useHistoryStore((s) => s.entries);
  const today = new Date().toDateString();
  return (
    entries.find(
      (e) => e.activity === activity && new Date(e.date).toDateString() === today,
    ) ?? null
  );
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
  const setDuration = useHistoryStore((s) => s.setDuration);
  const startSession = useActiveSessionStore((s) => s.start);
  const clearSession = useActiveSessionStore((s) => s.clear);
  const session = useActiveSession();
  const isRunning = session !== null && session.activity === activity;
  const todayEntry = useTodayEntry(activity);
  const [toastOpen, setToastOpen] = useState(false);
  const now = useNow();
  // 결과가 화면에 준비된 시점부터 결정까지 걸린 시간을 재기 위한 경과 시간 읽기
  const getElapsedMs = useElapsedSinceMount();
  // 만족도 팝업은 토스트와 체감 카드가 끝난 뒤에 띄운다 ('다음에 할게요'로 닫은 카드는 막지 않는다)
  const entryCount = useHistoryStore((s) => s.entries.length);
  const pendingFeedback = useFeedbackPrompt();
  const [feedbackDismissedId, setFeedbackDismissedId] = useState<string | null>(null);
  const hasPendingFeedback = pendingFeedback !== null && pendingFeedback.id !== feedbackDismissedId;
  const appReview = useAppReview({
    entryCount,
    isBlocked: toastOpen || hasPendingFeedback || isRunning,
  });
  // 활동을 마친 뒤(종료 기록이 없으면 출발 후) 일정 시간이 지나면 다시 출발할 수 있게 한다
  const status = getDepartureStatus(todayEntry, isRunning, now.getTime());
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
    const decidedAt = new Date();
    // 오늘 이미 결정한 적이 있으면(취소 후 재결정 포함) isChange로 구분해 집계 중복을 피한다
    const isChange = recordDecisionAndCheckChange(activity, decidedAt);
    trackEvent(ANALYTICS_EVENTS.decisionMade, {
      decision: 'go',
      activity,
      score,
      isChange,
      ...decisionTimingProps(isChange, getElapsedMs()),
    });
    const entryId = `${decidedAt.getTime()}`;
    addEntry({
      id: entryId,
      date: decidedAt.toISOString(),
      activity,
      decision: 'go',
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
    startSession({ entryId, activity, startedAt: decidedAt.getTime() });
    setToastOpen(true);
  };

  /** 타이머 버튼으로 활동을 마치고 활동 시간을 기록한다. */
  const handleEnd = () => {
    if (!session) return;
    const durationSec = Math.round((Date.now() - session.startedAt) / MS_PER_SECOND);
    setDuration(session.entryId, durationSec);
    clearSession();
    setToastOpen(false);
    trackEvent(ANALYTICS_EVENTS.activityEnded, { activity, durationSec });
  };

  /** 토스트의 '실행 취소'와 CTA의 '출발 취소'가 함께 쓰는 취소 처리 */
  const handleCancel = () => {
    const targetId = session?.entryId ?? todayEntry?.id;
    if (!targetId) return;
    trackEvent(ANALYTICS_EVENTS.decisionCancelled, { decision: 'go', activity });
    removeEntry(targetId);
    clearSession();
    setToastOpen(false);
  };

  return (
    <div className="space-y-6">
      <FeedbackCard onDismiss={setFeedbackDismissedId} />
      <HomeSummary
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
      {/* 토스트가 버튼 바로 위에 뜨도록 버튼과 같은 기준(relative) 안에 둔다 */}
      <div className="relative">
        <DecisionButtons
          status={status}
          activityLabel={getActivityMeta(activity).label}
          startedAt={isRunning ? session.startedAt : null}
          onDecide={handleDecide}
          onEnd={handleEnd}
          onCancel={handleCancel}
        />
        <DepartureToast
          open={toastOpen}
          activityLabel={getActivityMeta(activity).label}
          onOpenChange={setToastOpen}
          onUndo={handleCancel}
        />
      </div>
      <AppReviewDialog
        open={appReview.open}
        onSubmit={appReview.submit}
        onDismiss={appReview.dismiss}
      />
    </div>
  );
}
