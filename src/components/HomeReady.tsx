import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppReviewDialog from './AppReviewDialog';
import DecisionButtons from './DecisionButtons';
import DepartureToast from './DepartureToast';
import SettingsSavedToast from './SettingsSavedToast';
import FeedbackCard from './FeedbackCard';
import FeedbackSheet from './FeedbackSheet';
import BestTimeSection from './BestTimeSection';
import { type LocationNoticeProps } from './GuideBox';
import HomeOutfitSection from './HomeOutfitSection';
import HomeSummary from './HomeSummary';
import HourlyChart from './HourlyChart';
import ReminderInterestButton from './ReminderInterestButton';
import ScoreBreakdownSheet from './ScoreBreakdownSheet';
import SelectedHourDetail from './SelectedHourDetail';
import { useSettingsSavedToast } from '../hooks/useSettingsSavedToast';
import { useHourScoreDeltas } from '../hooks/useHourScoreDeltas';
import { useScoreReasons } from '../hooks/useScoreReasons';
import { buildDummyGuide } from '../data/dummyGuide';
import { getActivityMeta } from '../constants/activities';
import { useActiveSession } from '../hooks/useActiveSession';
import { useAppReview } from '../hooks/useAppReview';
import { useElapsedSinceMount } from '../hooks/useElapsedSinceMount';
import { useFeedbackPrompt } from '../hooks/useFeedbackPrompt';
import { HOME_INTRO_KEY } from '../constants/motion';
import { useIntroOnce } from '../hooks/useIntroOnce';
import { useNow } from '../hooks/useNow';
import { formatPreviousDeparture, formatRawWeather } from '../constants/messages';
import { FEEDBACK_SOURCES } from '../constants/feedback';
import {
  CTA_CLEARANCE,
  CTA_GAP,
  FEEDBACK_SAVED_STATE,
  TAB_BAR_OFFSET,
} from '../constants/navigation';
import { ACTIVITY_DAYLIGHT_BUFFER_HOURS } from '../constants/scoring';
import {
  findBestHourToday,
  findGoodRange,
  isTomorrowIndex,
  scoreHours,
  sliceFromHour,
  sliceToday,
} from '../lib/bestHour';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { decisionTimingProps, recordDecisionAndCheckChange } from '../lib/decisionTracking';
import { getDepartureStatus } from '../lib/departureStatus';
import { calcPersonalFeelsLike } from '../lib/feelsLike';
import { elapsedSeconds, isTooShortToRecord } from '../lib/formatElapsed';
import { formatHourLabel, formatTime } from '../lib/formatTime';
import { CTA_IDS } from '../constants/analytics';
import { skipFeedback } from '../lib/skipFeedback';
import { buildBestTimeCards } from '../lib/bestTimes';
import { recommendOutfit } from '../lib/outfit';
import { formatGuideParagraph } from '../lib/guideTips';
import { buildOutfitReason } from '../lib/outfitReasons';
import { calcRunScore, scoreToHeadline, scoreToLevel } from '../lib/runScore';
import { getSunsetStatus, hasDaylightScore } from '../lib/scoreFactors';
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
  /** 로딩 스켈레톤을 본 뒤에 이 화면이 나타난 것이면 true (떠오르는 대신 페이드로만 나타난다) */
  afterSkeleton?: boolean;
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
  afterSkeleton = false,
}: HomeReadyProps) {
  // 앱을 연 뒤 홈을 처음 볼 때만 섹션이 차례로 나타난다. (스플래시가 사라진 뒤에 시작)
  const intro = useIntroOnce(HOME_INTRO_KEY);
  // 스켈레톤에서 넘어온 첫 진입은 자리가 같으므로 떠오르지 않고 페이드로만 나타난다.
  const introClass = intro.shouldAnimate ? (afterSkeleton ? 'fade-children' : 'stagger-children') : '';
  const setLastActivity = useProfileStore((s) => s.setLastActivity);
  const addEntry = useHistoryStore((s) => s.addEntry);
  const removeEntry = useHistoryStore((s) => s.removeEntry);
  const setDuration = useHistoryStore((s) => s.setDuration);
  const startSession = useActiveSessionStore((s) => s.start);
  const clearSession = useActiveSessionStore((s) => s.clear);
  const shiftSessionStart = useActiveSessionStore((s) => s.shiftStart);
  const session = useActiveSession();
  const isRunning = session !== null && session.activity === activity;
  const todayEntry = useTodayEntry(activity);
  const [toastOpen, setToastOpen] = useState(false);
  const savedToast = useSettingsSavedToast();
  const navigate = useNavigate();
  const now = useNow();
  // 결과가 화면에 준비된 시점부터 결정까지 걸린 시간을 재기 위한 경과 시간 읽기
  const getElapsedMs = useElapsedSinceMount();
  // 만족도 팝업은 토스트와 체감 카드가 끝난 뒤에 띄운다 (시트를 바깥 탭으로 닫은 기록의 카드는 막지 않는다)
  const entryCount = useHistoryStore((s) => s.entries.length);
  const pendingFeedback = useFeedbackPrompt();
  const [feedbackDismissedId, setFeedbackDismissedId] = useState<string | null>(null);
  // 방금 마친 활동의 기록. 있으면 종료 직후 체감 시트를 띄운다
  const [sheetEntry, setSheetEntry] = useState<HistoryEntry | null>(null);
  const hasPendingFeedback = pendingFeedback !== null && pendingFeedback.id !== feedbackDismissedId;
  const appReview = useAppReview({
    entryCount,
    isBlocked: toastOpen || hasPendingFeedback || isRunning || sheetEntry !== null,
  });
  // 활동을 마친 뒤(종료 기록이 없으면 출발 후) 일정 시간이 지나면 다시 출발할 수 있게 한다
  const status = getDepartureStatus(todayEntry, isRunning, now.getTime());
  // 다시 출발할 수 있게 된 뒤에도 오늘 출발한 기록이 있으면 CTA 위에 알려 기록이 사라진 것으로 오해하지 않게 한다
  const previousNotice =
    status === 'ready' && todayEntry !== null
      ? formatPreviousDeparture(
          formatTime(todayEntry.date),
          getActivityMeta(activity).label,
          hasPendingFeedback,
        )
      : undefined;
  const { current, hourly } = weather;
  const { coldLevel, heatLevel, feedbackOffset } = profile;
  const sensitivity = useMemo(
    () => ({ coldLevel, heatLevel, feedbackOffset }),
    [coldLevel, heatLevel, feedbackOffset],
  );
  const score = calcRunScore(current, sensitivity, profile.constraints, activity);
  const feelsLike = calcPersonalFeelsLike(current, sensitivity);
  const scoreReasons = useScoreReasons(current, sensitivity, profile.constraints, activity, score);
  const nowHour = now.getHours();
  const upcomingHourly = sliceFromHour(hourly, nowHour);
  const scores = scoreHours(upcomingHourly, sensitivity, profile.constraints, activity);
  const best = findBestHourToday(scores, nowHour);
  const range = findGoodRange(sliceToday(scores, nowHour), best);
  const bestTimeCards = buildBestTimeCards(scores, now, profile.activityTimeSlots);
  // 오늘 추천이 없으면 차트 제목이 안내할 다음 추천 시간 (내일 카드)
  const nextRecommendation = bestTimeCards.find((card) => card.label.startsWith('내일'));
  const [pickedHour, setPickedHour] = useState<number | null>(null);
  // 직접 고른 시각이 없으면 추천 시각, 그것도 없으면 지금 시각을 보여준다
  const selectedHour = pickedHour ?? best?.hour ?? upcomingHourly[0]?.hour ?? null;
  const selectedIndex = upcomingHourly.findIndex((h) => h.hour === selectedHour);
  const selectedWeather = selectedIndex >= 0 ? upcomingHourly[selectedIndex] : null;
  // 알림 수요 확인 버튼을 누른 시각 (다른 시각을 고르면 버튼이 다시 보인다)
  const [reminderHour, setReminderHour] = useState<number | null>(null);
  // 지금 시각을 고른 경우는 비교할 대상이 같아 비교하지 않는다
  const hourDeltas = useHourScoreDeltas(
    selectedHour === nowHour ? null : selectedWeather,
    current,
    sensitivity,
    profile.constraints,
    activity,
  );
  const rawWeather = formatRawWeather(current.temp, current.condition, current.windSpeed);
  const outfit = recommendOutfit(feelsLike, current, activity, profile.constraints);
  // 가이드 문단이 이미 말한 장비는 복장 이유 줄에서 뺀다
  const guideText = guide.state === 'ready' ? formatGuideParagraph(guide.data) : '';
  const outfitReason = buildOutfitReason(feelsLike, current, activity, outfit, guideText);

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

  /** 선택한 시간대의 러닝 알림 관심을 기록한다. (알림 기능은 아직 없어 수요만 측정) */
  const handleRequestReminder = () => {
    if (!selectedWeather) return;
    trackEvent(ANALYTICS_EVENTS.ctaClicked, {
      cta: CTA_IDS.hourReminder,
      activity,
      hour: selectedWeather.hour,
      score: scores[selectedIndex]?.score ?? 0,
      isTomorrow: isTomorrowIndex(selectedIndex, nowHour),
    });
    setReminderHour(selectedWeather.hour);
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
    // 같은 자리에 뜨는 설정 저장 토스트와 겹치지 않게 닫는다
    savedToast.setOpen(false);
    setToastOpen(true);
  };

  /** 타이머 버튼으로 활동을 마치고 활동 시간을 기록한다. 1분 미만이면 기록을 지운다. (종료 시각은 타이머 버튼을 누른 시각) */
  const handleEnd = (endedAtMs: number) => {
    if (!session) return;
    const durationSec = elapsedSeconds(session.startedAt, endedAtMs);
    // 출발 직후 바로 종료한 활동은 기록으로 남기지 않는다 (체감 시트도 묻지 않는다)
    const isDiscarded = isTooShortToRecord(durationSec);
    if (isDiscarded) removeEntry(session.entryId);
    else setDuration(session.entryId, durationSec);
    clearSession();
    setToastOpen(false);
    trackEvent(ANALYTICS_EVENTS.activityEnded, { activity, durationSec, discarded: isDiscarded });
    if (isDiscarded) return;
    // 방금 마친 기록을 체감 시트로 바로 묻는다
    const ended = useHistoryStore.getState().entries.find((e) => e.id === session.entryId);
    setSheetEntry(ended ?? null);
  };

  /** 시트에서 저장하면 닫고 기록 탭으로 이동한다 (감사 문구는 기록 탭의 토스트가 보여준다). */
  const handleSheetSaved = () => {
    setSheetEntry(null);
    navigate('/history', { state: FEEDBACK_SAVED_STATE });
  };

  /** 시트를 답하지 않고 닫는다. 이번 방문에는 다시 묻지 않고, 앱을 다시 열면 상단 카드가 묻는다. */
  const handleSheetDismiss = (entry: HistoryEntry) => {
    trackEvent(ANALYTICS_EVENTS.feedbackSheetDismissed, { activity: entry.activity });
    setFeedbackDismissedId(entry.id);
    setSheetEntry(null);
  };

  /** '저장 안 할래요'를 눌러 기록을 지우고 시트를 닫는다. */
  const handleSheetSkip = (entry: HistoryEntry) => {
    skipFeedback(entry, FEEDBACK_SOURCES.sheet);
    setSheetEntry(null);
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
    <div
      className={`space-y-10 ${introClass} ${intro.isHidden ? 'opacity-0' : ''}`}
      style={{ paddingBottom: CTA_CLEARANCE }}
    >
      <FeedbackCard hiddenEntryIds={[sheetEntry?.id ?? null, feedbackDismissedId]} />
      <HomeSummary
        activity={activity}
        score={score}
        headline={scoreToHeadline(score, activity, hasDaylightScore(current, activity))}
        weather={current}
        feelsLike={feelsLike}
        reasons={scoreReasons.reasons}
        onOpenBreakdown={scoreReasons.openSheet}
        onSelectActivity={handleSelectActivity}
      />
      <BestTimeSection cards={bestTimeCards} />
      <HomeOutfitSection
        activity={activity}
        outfit={outfit}
        outfitReason={outfitReason}
        guide={guide}
        rawWeather={rawWeather}
        location={location}
      />
      <div className="space-y-6">
        <HourlyChart
          hourly={upcomingHourly}
          scores={scores}
          selectedHour={selectedHour}
          onSelectHour={setPickedHour}
          best={best}
          range={range}
          nextRecommendation={nextRecommendation}
          activityLabel={getActivityMeta(activity).label}
          sunsetStatus={getSunsetStatus(
            current.hoursUntilSunset,
            ACTIVITY_DAYLIGHT_BUFFER_HOURS[activity],
          )}
        />
        {selectedIndex >= 0 && (
          <SelectedHourDetail
            weather={upcomingHourly[selectedIndex]}
            score={scores[selectedIndex]?.score ?? 0}
            feelsLike={calcPersonalFeelsLike(upcomingHourly[selectedIndex], sensitivity)}
            deltas={hourDeltas}
            isTomorrow={isTomorrowIndex(selectedIndex, nowHour)}
          />
        )}
        {selectedWeather && (
          <ReminderInterestButton
            hourLabel={`${isTomorrowIndex(selectedIndex, nowHour) ? '내일 ' : ''}${formatHourLabel(selectedWeather.hour)}`}
            isRequested={reminderHour === selectedWeather.hour}
            onRequest={handleRequestReminder}
            activity={activity}
          />
        )}
      </div>
      {/* 탭바 바로 위에 고정한다. 토스트가 버튼 바로 위에 뜨도록 버튼과 같은 기준(relative) 안에 둔다 */}
      <div
        className="fixed inset-x-0 z-30 bg-linear-to-t from-background from-70% to-transparent px-4 pt-6"
        style={{ bottom: TAB_BAR_OFFSET, paddingBottom: CTA_GAP }}
      >
        {/* 본문(main: max-w-md + px-4)과 같은 폭이 되도록 max-w-md에서 좌우 여백(px-4)을 뺀 max-w-104를 쓴다 */}
        <div className="relative mx-auto max-w-104">
          <DecisionButtons
            status={status}
            activityLabel={getActivityMeta(activity).label}
            activity={activity}
            startedAt={isRunning ? session.startedAt : null}
            previousNotice={previousNotice}
            onDecide={handleDecide}
            onEnd={handleEnd}
            onResume={shiftSessionStart}
            onCancel={handleCancel}
          />
          <DepartureToast
            open={toastOpen}
            activityLabel={getActivityMeta(activity).label}
            onOpenChange={setToastOpen}
            onUndo={handleCancel}
          />
          <SettingsSavedToast open={savedToast.open} onOpenChange={savedToast.setOpen} />
        </div>
      </div>
      <FeedbackSheet
        entry={sheetEntry}
        onDismiss={handleSheetDismiss}
        onSkip={handleSheetSkip}
        onSaved={handleSheetSaved}
      />
      <ScoreBreakdownSheet
        open={scoreReasons.sheetOpen}
        onOpenChange={scoreReasons.setSheetOpen}
        score={score}
        reasons={scoreReasons.reasons}
        weather={current}
        feelsLike={feelsLike}
        activity={activity}
      />
      <AppReviewDialog
        open={appReview.open}
        onSubmit={appReview.submit}
        onDismiss={appReview.dismiss}
      />
    </div>
  );
}
