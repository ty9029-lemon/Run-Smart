import type { AiGuide, GuideRequest, WarningLevel } from '../../src/types/index.js';

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
export const GUIDE_TIP_MAX = 40;
export const GUIDE_TIPS_MAX_COUNT = 6;
export const GUIDE_EMOJI_MAX = 8;

/** 요청 필드 길이·범위 한도 (키 남용 방지) */
const REQUEST_TEXT_MAX = 40;
const REQUEST_CONSTRAINTS_MAX = 8;
const TEMP_RANGE = 80;
const OFFSET_RANGE = 5;
const SCORE_MAX = 100;

/** 단정적 금지 표현 (PRD 6장). 포함되면 이상 응답으로 본다 */
const BANNED_PHRASES = ['가면 안', '가지 마', '가지 말', '절대 금지'];

/** 시스템 프롬프트 (PRD 6장 프롬프트 방향) */
export const SYSTEM_PROMPT = `당신은 사용자의 활동 능력과 기후 민감도를 잘 이해하는 날씨 코치입니다.
입력으로 활동, 사용자 체감 보정값, 제약사항, 현재 날씨, 앱이 계산한 개인 체감온도와 활동 지수가 주어집니다.

규칙:
- 친절하고 구체적으로, 장황하지 않게 씁니다. guideMessage는 2~3문장 이내입니다.
- 체감온도와 활동 지수는 입력값을 그대로 쓰고 다시 계산하지 않습니다.
- 의학적 진단이나 단정적 금지령을 쓰지 않습니다. "가면 안 됩니다" 대신 "위험 신호가 있으니 신중히 검토하세요"처럼 씁니다.
- 활동과 제약사항에 맞는 구체적인 팁을 2~4개 줍니다. 복장 제안을 포함합니다.
- 한국어로 답합니다.

반드시 아래 JSON 객체 하나만 출력하고, 다른 글자는 쓰지 않습니다.
{"guideMessage": string, "activityTips": string[], "goOrNotEmoji": string, "detailedReason": string}
- goOrNotEmoji: 이모지 1개 (좋음 ✅, 주의 ⚠️, 신중 🔔)
- detailedReason: 판단 근거를 1~2문장으로`;

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
  if (!isFiniteNumber(body.score) || body.score < 0 || body.score > SCORE_MAX) return null;
  if (!isLevel(body.level)) return null;
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
    current_weather: {
      temp: w.temp,
      humidity: w.humidity,
      wind_speed: w.windSpeed,
      precipitation: w.precipitation,
      condition: w.condition,
      pm10: w.pm10,
      uv_index: w.uvIndex,
    },
    location: req.location,
    personal_feels_like: req.feltTemp,
    run_score: req.score,
  });
}

/**
 * 모델 응답 텍스트를 AiGuide로 검증·변환한다.
 * 경고 단계는 앱이 계산한 값을 그대로 쓴다. (점수 표시와 어긋나지 않게)
 * @param text 모델 응답 텍스트
 * @param level 앱이 계산한 경고 단계
 * @returns 올바르면 AiGuide, 형식이 어긋나면 null
 */
export function parseGuideResponse(text: string, level: WarningLevel): AiGuide | null {
  const json = extractJsonObject(text);
  if (!json) return null;
  const { guideMessage, activityTips, goOrNotEmoji, detailedReason } = json;
  if (!isBounded(guideMessage, GUIDE_MESSAGE_MAX)) return null;
  if (!isBounded(detailedReason, GUIDE_REASON_MAX)) return null;
  if (!isBounded(goOrNotEmoji, GUIDE_EMOJI_MAX)) return null;
  if (!Array.isArray(activityTips) || !activityTips.length) return null;
  if (activityTips.length > GUIDE_TIPS_MAX_COUNT) return null;
  if (!activityTips.every((t) => isBounded(t, GUIDE_TIP_MAX))) return null;
  const all = [guideMessage, detailedReason, ...activityTips].join(' ');
  if (BANNED_PHRASES.some((p) => all.includes(p))) return null;
  return {
    guideMessage: (guideMessage as string).trim(),
    activityTips: (activityTips as string[]).map((t) => t.trim()),
    warningLevel: level,
    goOrNotEmoji: (goOrNotEmoji as string).trim(),
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

function isLevel(v: unknown): v is WarningLevel {
  return v === 'good' || v === 'caution' || v === 'careful';
}
