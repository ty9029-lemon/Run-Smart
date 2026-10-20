import type {
  AiGuide,
  DustGrade,
  GuideRequest,
  ScoreTier,
  UvGrade,
  WarningLevel,
} from '../../src/types/index.js';

/** 사용하는 Claude 모델 */
export const GUIDE_MODEL = 'claude-haiku-4-5';
/** 응답 최대 토큰 (2~3줄 요약 + 팁이라 짧게) */
export const GUIDE_MAX_TOKENS = 1024;
/** Claude 요청 제한 시간(ms). 서버리스 maxDuration 안에 끝나도록 짧게 둔다 */
export const GUIDE_REQUEST_TIMEOUT_MS = 9000;
/** 형식 오류 시 서버가 다시 요청하는 횟수 */
export const GUIDE_FORMAT_RETRIES = 1;

/** 응답 필드 길이 한도 (PRD 6장: 과도히 길면 이상 응답) */
export const GUIDE_MESSAGE_MAX = 300;
export const GUIDE_REASON_MAX = 300;
export const GUIDE_TIP_MAX = 60;
export const GUIDE_TIPS_MAX_COUNT = 6;

/** 요청 필드 길이·범위 한도 (키 남용 방지) */
const REQUEST_TEXT_MAX = 40;
const REQUEST_CONSTRAINTS_MAX = 8;
/** 복장 이름 목록 최대 개수 */
const REQUEST_OUTFIT_MAX = 12;
const TEMP_RANGE = 80;
const OFFSET_RANGE = 5;
const SCORE_MAX = 100;

/** 경고 단계별 이모지. 점수 표시와 어긋나지 않도록 모델이 아니라 서버가 정한다 */
const LEVEL_EMOJI: Record<WarningLevel, string> = {
  good: '✅',
  caution: '⚠️',
  careful: '🔔',
};

/** 단정적 금지 표현 (PRD 6장). 포함되면 이상 응답으로 본다 */
const BANNED_PHRASES = ['가면 안', '가지 마', '가지 말', '절대 금지'];

/** 앱이 정하는 등급 값 (src/types의 DustGrade·UvGrade와 같다) */
const DUST_GRADES: readonly DustGrade[] = ['좋음', '보통', '나쁨'];
const UV_GRADES: readonly UvGrade[] = ['보통', '높음'];

/** 마스크를 언급하면 안 되는 상황(maskAllowed가 false)에서 응답에 들어가면 안 되는 표현 */
const DUST_GEAR_PHRASES = ['마스크', '넥게이터'];

/** 시스템 프롬프트 (PRD 6장 프롬프트 방향) */
export const SYSTEM_PROMPT = `당신은 사용자의 활동 능력과 기후 민감도를 잘 이해하는 날씨 코치입니다.
입력으로 활동, 사용자 체감 보정값, 제약사항, 현재 날씨, 앱이 계산한 개인 체감온도와 활동 지수가 주어집니다.

규칙:
- 친절하고 구체적으로, 장황하지 않게 씁니다. guideMessage는 2~3문장 이내입니다.
- 체감온도와 활동 지수는 입력값을 그대로 쓰고 다시 계산하지 않습니다.
- 의학적 진단이나 단정적 금지령을 쓰지 않습니다. "가면 안 됩니다" 대신 "위험 신호가 있으니 신중히 검토하세요"처럼 씁니다.
- 활동과 제약사항에 맞는 구체적인 팁을 1~4개 줍니다. 옷·신발 같은 복장은 앱이 카드로 따로 보여 주므로 팁에 쓰지 않고, 준비물·몸 관리·주의할 행동만 씁니다.
- recommended_outfit이 주어지면 앱이 화면에 카드로 보여 주는 복장입니다. 이 목록에 있는 항목(옷, 신발, 장비)은 팁에 다시 쓰지 않습니다. 목록에 있는 선글라스·모자 같은 준비물도 팁에서 반복하지 않습니다. guideMessage에서 복장을 말할 때는 이 목록과 일치해야 하고, 목록에 없는 옷(예: 목록에 긴팔이 있는데 반팔)을 권하지 않습니다.
- 자외선 차단제는 "자외선 차단제 바르기", 선글라스는 "선글라스 챙기기"로 각각 따로 한 줄씩 씁니다. 한 팁에 둘을 묶지 않습니다.
- guideMessage와 detailedReason은 홈 화면에서 한 단락으로 이어 붙여 보입니다. guideMessage는 오늘의 총평과 날씨 수치(체감온도, 습도, 미세먼지, 자외선 등급)를 한 번만 말하고 행동 권유는 쓰지 않습니다. detailedReason은 제약사항과 활동에 맞춘 구체적인 행동 권유를 쓰고, 날씨 수치와 총평은 다시 쓰지 않습니다. 제약사항이 없으면 날씨에 맞는 행동 한 가지만 씁니다. 같은 소재(자외선 차단, 선글라스, 준비 운동, 수분, "쾌적하다" 같은 결론 등)를 두 곳 이상에서 말하지 않습니다.
- 미세먼지와 자외선 등급은 입력된 dust_grade, uv_grade를 그대로 씁니다. 숫자를 보고 직접 등급을 다시 판단하지 않습니다.
- mask_allowed가 false이면 미세먼지를 위험 요인으로 말하지 않고, 마스크·넥게이터·호흡기 보호를 언급하지 않습니다. true일 때만 마스크를 권해도 됩니다.
- 제약사항에 비염이 있으면 기온이 5°C 미만일 때 찬 공기, 습도가 30% 미만일 때 건조함을 팁에 반영합니다. 휴지·티슈는 복장 칩이 따로 안내하므로 팁에 쓰지 않습니다.
- uv_grade가 "높음"이 아니면 자외선이 강하다고 쓰지 않고, 자외선 차단을 권하지 않습니다. 등급은 수치로만 말합니다. "높음"일 때만 행동 권유에 자외선 차단을 넣습니다.
- 활동이 산책이면 무릎 보호대 팁을 쓰지 않습니다.
- 제약사항에 발 문제가 있으면 신발은 복장 카드가 안내하므로 쓰지 않고, "러닝 전후 발 스트레칭하기"처럼 활동 전후 발 관리 팁을 하나 넣습니다.
- 각 팁은 20자 이내의 짧은 구절로 씁니다. 괄호 설명과 부연은 붙이지 않습니다. 예: "수분 챙기기", "자외선 차단제 바르기", "러닝 전후 발 스트레칭하기"
- score_tier가 주어지면 그 단계에 맞춰 어조를 조절합니다. excellent=가볍고 긍정적으로, good=긍정적으로, fair=담백하게, caution=확인할 점을 중심으로 차분하게, careful=위험 신호와 쉬어가는 선택지를 부드럽게 제안합니다. 단계와 어긋나는 표현(careful인데 달리기 좋다고 말하는 것 등)은 쓰지 않습니다.
- 한국어로 답합니다.

반드시 아래 JSON 객체 하나만 출력하고, 다른 글자는 쓰지 않습니다.
{"guideMessage": string, "activityTips": string[], "detailedReason": string}
- detailedReason: 제약사항과 활동에 맞춘 행동 권유를 1~2문장으로 (날씨 수치와 총평 반복 금지)`;

/**
 * 요청 본문을 검증해 GuideRequest로 좁힌다.
 * @param body JSON으로 파싱된 요청 본문
 * @returns 올바르면 GuideRequest, 아니면 null
 */
export function parseGuideRequest(body: unknown): GuideRequest | null {
  if (!isRecord(body) || !isRecord(body.weather)) return null;
  const w = body.weather;
  const numbers = [w.temp, w.humidity, w.windSpeed, w.precipitation, w.pm10, w.uvIndex];
  if (!numbers.every(isFiniteNumber)) return null;
  if (!isText(w.condition) || !isText(body.activityLabel) || !isText(body.location)) {
    return null;
  }
  const labels = body.constraintLabels;
  if (!Array.isArray(labels) || labels.length > REQUEST_CONSTRAINTS_MAX) return null;
  if (!labels.every(isText)) return null;
  if (!isInRange(body.offset, OFFSET_RANGE)) return null;
  if (!isInRange(body.feltTemp, TEMP_RANGE) || !isInRange(w.temp, TEMP_RANGE)) return null;
  if (w.isDay !== undefined && typeof w.isDay !== 'boolean') return null;
  if (body.dustGrade !== undefined && !DUST_GRADES.includes(body.dustGrade as DustGrade)) {
    return null;
  }
  if (body.uvGrade !== undefined && !UV_GRADES.includes(body.uvGrade as UvGrade)) return null;
  if (body.maskAllowed !== undefined && typeof body.maskAllowed !== 'boolean') return null;
  const outfit = body.outfitLabels;
  if (outfit !== undefined) {
    if (!Array.isArray(outfit) || outfit.length > REQUEST_OUTFIT_MAX || !outfit.every(isText)) {
      return null;
    }
  }
  if (!isFiniteNumber(body.score) || body.score < 0 || body.score > SCORE_MAX) return null;
  if (!isLevel(body.level)) return null;
  if (body.scoreTier !== undefined && !isScoreTier(body.scoreTier)) return null;
  return body as unknown as GuideRequest;
}

/**
 * Claude에 보낼 사용자 메시지를 만든다.
 * @param req 검증된 요청
 */
export function buildUserPrompt(req: GuideRequest): string {
  const { weather: w } = req;
  return JSON.stringify({
    activity: req.activityLabel,
    user_temp_offset: req.offset,
    constraints: req.constraintLabels,
    mask_allowed: req.maskAllowed,
    recommended_outfit: req.outfitLabels,
    current_weather: {
      temp: w.temp,
      humidity: w.humidity,
      wind_speed: w.windSpeed,
      precipitation: w.precipitation,
      condition: w.condition,
      pm10: w.pm10,
      dust_grade: req.dustGrade,
      uv_index: w.uvIndex,
      uv_grade: req.uvGrade,
      is_day: w.isDay !== false,
    },
    location: req.location,
    personal_feels_like: req.feltTemp,
    run_score: req.score,
    score_tier: req.scoreTier,
  });
}

/** 검증 결과: 문제가 있으면 problem, 통과하면 json */
type GuideCheck = { problem: string } | { json: Record<string, unknown> };

/** 모델 응답 텍스트를 검사한다. 문제 이유는 필드 이름만 담는다. (응답 내용은 담지 않는다) */
function checkGuide(text: string, maskAllowed?: boolean): GuideCheck {
  const json = extractJsonObject(text);
  if (!json) return { problem: 'not_json' };
  const { guideMessage, activityTips, detailedReason } = json;
  if (!isBounded(guideMessage, GUIDE_MESSAGE_MAX)) return { problem: 'guideMessage' };
  if (!isBounded(detailedReason, GUIDE_REASON_MAX)) return { problem: 'detailedReason' };
  if (!Array.isArray(activityTips) || !activityTips.length) return { problem: 'tips_empty' };
  if (activityTips.length > GUIDE_TIPS_MAX_COUNT) return { problem: 'tips_count' };
  if (!activityTips.every((t) => isBounded(t, GUIDE_TIP_MAX))) return { problem: 'tip_length' };
  const all = [guideMessage, detailedReason, ...activityTips].join(' ');
  const banned = BANNED_PHRASES.find((p) => all.includes(p));
  if (banned) return { problem: 'banned_phrase' };
  if (maskAllowed === false && DUST_GEAR_PHRASES.some((p) => all.includes(p))) {
    return { problem: 'mask_not_allowed' };
  }
  return { json };
}

/**
 * 모델 응답이 검사를 통과하지 못한 이유를 돌려준다. 통과하면 null.
 * @param text 모델 응답 텍스트
 * @param maskAllowed 마스크를 언급해도 되는지 (false인데 마스크 문구가 있으면 문제로 본다)
 */
export function findGuideProblem(text: string, maskAllowed?: boolean): string | null {
  const checked = checkGuide(text, maskAllowed);
  return 'problem' in checked ? checked.problem : null;
}

/**
 * 모델 응답 텍스트를 AiGuide로 검증·변환한다.
 * 경고 단계는 앱이 계산한 값을 그대로 쓴다. (점수 표시와 어긋나지 않게)
 * @param text 모델 응답 텍스트
 * @param level 앱이 계산한 경고 단계
 * @param maskAllowed 마스크를 언급해도 되는지
 * @returns 올바르면 AiGuide, 형식이 어긋나면 null
 */
export function parseGuideResponse(
  text: string,
  level: WarningLevel,
  maskAllowed?: boolean,
): AiGuide | null {
  const checked = checkGuide(text, maskAllowed);
  if ('problem' in checked) return null;
  const { guideMessage, activityTips, detailedReason } = checked.json;
  return {
    guideMessage: (guideMessage as string).trim(),
    activityTips: (activityTips as string[]).map((t) => t.trim()),
    warningLevel: level,
    goOrNotEmoji: LEVEL_EMOJI[level],
    detailedReason: (detailedReason as string).trim(),
  };
}

/** 응답에서 첫 `{`부터 마지막 `}`까지를 JSON 객체로 파싱한다. (코드블록 감싸기 허용) */
function extractJsonObject(text: string): Record<string, unknown> | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const parsed: unknown = JSON.parse(text.slice(start, end + 1));
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isInRange(v: unknown, limit: number): boolean {
  return isFiniteNumber(v) && Math.abs(v) <= limit;
}

function isText(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0 && v.length <= REQUEST_TEXT_MAX;
}

function isBounded(v: unknown, max: number): v is string {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= max;
}

/** 러닝 5단계 키 */
const SCORE_TIERS: readonly ScoreTier[] = ['excellent', 'good', 'fair', 'caution', 'careful'];

function isScoreTier(v: unknown): v is ScoreTier {
  return SCORE_TIERS.includes(v as ScoreTier);
}

function isLevel(v: unknown): v is WarningLevel {
  return v === 'good' || v === 'caution' || v === 'careful';
}
