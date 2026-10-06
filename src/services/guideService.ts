import { CONSTRAINTS, getActivityMeta } from '../constants/activities';
import { GUIDE_API_PATH, GUIDE_RETRY_COUNT, GUIDE_TIMEOUT_MS } from '../constants/api';
import { calcPersonalFeelsLike } from '../lib/feelsLike';
import { calcRunScore, scoreToLevel } from '../lib/runScore';
import type { Activity, AiGuide, Constraint, GuideRequest, Weather } from '../types';

/** 가이드 요청 입력 (PRD 6장 입력 형식) */
export interface GuideInput {
  activity: Activity;
  offset: number;
  constraints: Constraint[];
  weather: Weather;
  /** 헤더에 표시하는 위치 이름 */
  location: string;
}

/** 앱 입력을 서버 요청 본문으로 바꾼다. 체감온도·점수는 앱 계산값을 함께 보낸다. */
export function buildGuideRequest(input: GuideInput): GuideRequest {
  const { activity, offset, constraints, weather, location } = input;
  const score = calcRunScore(weather, offset, constraints);
  return {
    activityLabel: getActivityMeta(activity).label,
    offset,
    constraintLabels: CONSTRAINTS.filter((c) => constraints.includes(c.id)).map(
      (c) => c.label,
    ),
    weather,
    feltTemp: calcPersonalFeelsLike(weather, offset),
    score,
    level: scoreToLevel(score),
    location,
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
 * AI 가이드를 조회한다. 실패하면 정해진 횟수만큼 다시 시도하고,
 * 그래도 실패하면 마지막 에러를 던진다.
 * @param input 활동·보정값·제약사항·날씨·위치
 */
export async function fetchGuide(input: GuideInput): Promise<AiGuide> {
  const body = buildGuideRequest(input);
  let lastError: unknown;
  for (let attempt = 0; attempt <= GUIDE_RETRY_COUNT; attempt += 1) {
    try {
      return await requestGuide(body);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}
