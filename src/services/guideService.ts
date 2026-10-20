import { CONSTRAINTS, getActivityMeta } from '../constants/activities';
import { GUIDE_API_PATH, GUIDE_RETRY_COUNT, GUIDE_TIMEOUT_MS } from '../constants/api';
import { getDustGrade, getUvGrade, shouldRecommendMask } from '../lib/airGrade';
import { calcAppliedOffset, calcPersonalFeelsLike } from '../lib/feelsLike';
import { readGuideCache, writeGuideCache } from '../lib/guideCache';
import { recommendOutfit } from '../lib/outfit';
import { calcRunScore, scoreToLevel, scoreToTier } from '../lib/runScore';
import type { Activity, AiGuide, Constraint, GuideRequest, Sensitivity, Weather } from '../types';

/** 가이드 요청 입력 (PRD 6장 입력 형식) */
export interface GuideInput {
  activity: Activity;
  sensitivity: Sensitivity;
  constraints: Constraint[];
  weather: Weather;
  /** 헤더에 표시하는 위치 이름 */
  location: string;
}

/** 앱 입력을 서버 요청 본문으로 바꾼다. 체감온도·점수는 앱 계산값을 함께 보낸다. */
export function buildGuideRequest(input: GuideInput): GuideRequest {
  const { activity, sensitivity, constraints, weather, location } = input;
  const score = calcRunScore(weather, sensitivity, constraints, activity);
  const feltTemp = calcPersonalFeelsLike(weather, sensitivity);
  return {
    activityLabel: getActivityMeta(activity).label,
    offset: calcAppliedOffset(weather, sensitivity),
    constraintLabels: CONSTRAINTS.filter((c) => constraints.includes(c.id)).map(
      (c) => c.label,
    ),
    weather,
    feltTemp,
    score,
    level: scoreToLevel(score),
    scoreTier: scoreToTier(score, activity) ?? undefined,
    location,
    dustGrade: getDustGrade(weather.pm10),
    uvGrade: getUvGrade(weather.uvIndex),
    maskAllowed: shouldRecommendMask(constraints, weather.pm10),
    // 화면의 복장 카드와 같은 계산이라 가이드가 다른 옷을 권하지 않는다
    outfitLabels: recommendOutfit(feltTemp, weather, activity, constraints).map((item) => item.label),
  };
}

/** 한 번 요청한다. 실패(HTTP 오류, 제한 시간 초과)는 에러로 던진다. */
async function requestGuide(body: GuideRequest): Promise<AiGuide> {
  const res = await fetch(GUIDE_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(GUIDE_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`가이드 요청 실패: ${res.status}`);
  return (await res.json()) as AiGuide;
}

/**
 * AI 가이드를 조회한다. 1시간 이내 같은 요청의 캐시가 있으면 그대로 쓴다.
 * 실패하면 정해진 횟수만큼 다시 시도하고, 그래도 실패하면 마지막 에러를 던진다.
 * @param body 가이드 요청 (buildGuideRequest로 만든다)
 */
export async function fetchGuide(body: GuideRequest): Promise<AiGuide> {
  const cached = readGuideCache(body);
  if (cached) return cached;
  let lastError: unknown;
  for (let attempt = 0; attempt <= GUIDE_RETRY_COUNT; attempt += 1) {
    try {
      const guide = await requestGuide(body);
      writeGuideCache(body, guide);
      return guide;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}
