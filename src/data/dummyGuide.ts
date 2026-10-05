import { getActivityMeta } from '../constants/activities';
import { calcPersonalFeelsLike } from '../lib/feelsLike';
import { calcRunScore, scoreToLevel } from '../lib/runScore';
import type { Activity, AiGuide, Constraint, WarningLevel, Weather } from '../types';

/** 경고 단계별 이모지 */
const LEVEL_EMOJI: Record<WarningLevel, string> = {
  good: '✅',
  caution: '⚠️',
  careful: '🔔',
};

/** 경고 단계별 추천 문구 (단정적 금지 표현 사용 안 함) */
const LEVEL_MESSAGE: Record<WarningLevel, string> = {
  good: '지금 활동하시기 좋은 컨디션이에요.',
  caution: '활동은 가능하지만 몇 가지 확인해 보세요.',
  careful: '위험 신호가 있으니 신중히 검토해 보세요.',
};

/** 활동별 기본 팁 */
const ACTIVITY_TIPS: Record<Activity, string[]> = {
  running: ['워밍업 스트레칭 5분', '수분 준비'],
  hiking: ['미끄럼 방지 신발 확인', '여분 겉옷과 물 챙기기'],
  walking: ['편한 신발 착용', '가벼운 수분 준비'],
  cycling: ['헬멧 착용', '바람을 고려해 겉옷 챙기기'],
  outing: ['외출 시간대 확인', '가벼운 겉옷 챙기기'],
};

/** 제약사항별 팁 */
const CONSTRAINT_TIPS: Partial<Record<Constraint, string>> = {
  kneeIssue: '무릎 보호대 체크',
  uvSensitive: '자외선 차단제 바르기',
  dustSensitive: '미세먼지 마스크 고려',
  asthma: '흡입기 등 개인 약 챙기기',
};

/** 가이드 본문 구성 */
function buildMessage(weather: Weather, felt: number, level: WarningLevel): string {
  const base = `오늘 기온 ${weather.temp}°C는 당신 기준 ${felt}°C처럼 느껴질 거예요.`;
  const wind = `바람 ${weather.windSpeed}m/s, 습도 ${weather.humidity}%.`;
  return `${base} ${wind} ${LEVEL_MESSAGE[level]}`;
}

/**
 * 더미 AI 가이드를 만든다. (M2에서 실제 AI 응답으로 교체)
 * @param activity 활동
 * @param weather 날씨
 * @param offset 체감 온도 보정값
 * @param constraints 제약사항
 */
export function buildDummyGuide(
  activity: Activity,
  weather: Weather,
  offset: number,
  constraints: Constraint[],
): AiGuide {
  const score = calcRunScore(weather, offset, constraints);
  const level = scoreToLevel(score);
  const felt = calcPersonalFeelsLike(weather, offset);
  const constraintTips = constraints
    .map((c) => CONSTRAINT_TIPS[c])
    .filter((tip): tip is string => Boolean(tip));
  return {
    guideMessage: buildMessage(weather, felt, level),
    activityTips: [...ACTIVITY_TIPS[activity], ...constraintTips],
    warningLevel: level,
    goOrNotEmoji: LEVEL_EMOJI[level],
    detailedReason: `${getActivityMeta(activity).label} 기준 활동 지수는 ${score}점이에요. ${weather.condition}, 풍속 ${weather.windSpeed}m/s, 미세먼지 ${weather.pm10}㎍/㎥를 종합했어요.`,
  };
}
