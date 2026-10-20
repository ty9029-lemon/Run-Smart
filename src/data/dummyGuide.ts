import { getActivityMeta } from '../constants/activities';
import { getDustGrade, shouldRecommendMask } from '../lib/airGrade';
import { calcPersonalFeelsLike } from '../lib/feelsLike';
import { isKneeBraceNeeded } from '../lib/outfitConditions';
import { calcRunScore, scoreToLevel } from '../lib/runScore';
import { isColdAir, isDryAir } from '../lib/scoreFactors';
import type {
  Activity,
  AiGuide,
  Constraint,
  Sensitivity,
  WarningLevel,
  Weather,
} from '../types';

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
};

/** 제약사항별 팁 */
const CONSTRAINT_TIPS: Partial<Record<Constraint, string>> = {
  kneeIssue: '무릎 보호대 체크',
  footIssue: '쿠션 좋은 신발 신기',
  uvSensitive: '자외선 차단제 바르기',
  asthma: '흡입기 등 개인 약 챙기기',
};

/** 해가 진 뒤에 덧붙이는 팁 */
const NIGHT_TIP = '반사 장비와 조명 챙기기';

/** 마스크 팁 (천식·비염·미세먼지 민감의 등급 조건을 만족할 때만 보여 준다) */
const MASK_TIP = '미세먼지 스포츠 마스크 고려';

/** 비염 체크 시 찬 공기·건조한 공기에서 보여 주는 팁 */
const RHINITIS_COLD_TIP = '찬 공기가 콧속을 자극해요. 티슈를 챙기고 넥워머로 코와 입을 가려 보세요';
const RHINITIS_DRY_TIP = '공기가 건조해요. 활동 전후로 물을 충분히 드세요';

/**
 * 비염을 체크했을 때 날씨에 맞는 팁을 만든다. (점수·복장과 같은 찬 공기·건조 기준)
 * @param constraints 제약사항
 * @param weather 날씨
 */
function buildRhinitisTips(constraints: Constraint[], weather: Weather): string[] {
  if (!constraints.includes('rhinitis')) return [];
  const tips: string[] = [];
  if (isColdAir(weather.temp)) tips.push(RHINITIS_COLD_TIP);
  if (isDryAir(weather.humidity)) tips.push(RHINITIS_DRY_TIP);
  return tips;
}

/**
 * 제약사항 팁을 지금 활동에서 보여 줄지 판단한다. (복장 추천과 같은 규칙)
 * 무릎 보호대 팁은 산책을 뺀 활동에만 보여 준다.
 */
function isConstraintTipNeeded(constraint: Constraint, activity: Activity): boolean {
  return constraint !== 'kneeIssue' || isKneeBraceNeeded(activity);
}

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
 * @param sensitivity 추위·더위 민감도
 * @param constraints 제약사항
 */
export function buildDummyGuide(
  activity: Activity,
  weather: Weather,
  sensitivity: Sensitivity,
  constraints: Constraint[],
): AiGuide {
  const score = calcRunScore(weather, sensitivity, constraints, activity);
  const level = scoreToLevel(score);
  const felt = calcPersonalFeelsLike(weather, sensitivity);
  const isNight = weather.isDay === false;
  const constraintTips = constraints
    .filter((c) => isConstraintTipNeeded(c, activity))
    // 밤에는 햇빛이 없으므로 자외선 차단제 팁을 쓰지 않는다
    .filter((c) => !(isNight && c === 'uvSensitive'))
    .map((c) => CONSTRAINT_TIPS[c])
    .filter((tip): tip is string => Boolean(tip));
  const maskTips = shouldRecommendMask(constraints, weather.pm10) ? [MASK_TIP] : [];
  return {
    guideMessage: buildMessage(weather, felt, level),
    activityTips: [
      ...ACTIVITY_TIPS[activity],
      ...constraintTips,
      ...buildRhinitisTips(constraints, weather),
      ...maskTips,
      ...(isNight ? [NIGHT_TIP] : []),
    ],
    warningLevel: level,
    goOrNotEmoji: LEVEL_EMOJI[level],
    detailedReason: `${getActivityMeta(activity).label} 기준 활동 지수는 ${score}점이에요. ${weather.condition}, 풍속 ${weather.windSpeed}m/s, 미세먼지 ${getDustGrade(weather.pm10)}(${weather.pm10}㎍/㎥)를 종합했어요.`,
  };
}
