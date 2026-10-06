import Anthropic from '@anthropic-ai/sdk';
import type { AiGuide, GuideRequest } from '../src/types/index.js';
import {
  GUIDE_FORMAT_RETRIES,
  GUIDE_MAX_TOKENS,
  GUIDE_MODEL,
  GUIDE_REQUEST_TIMEOUT_MS,
  SYSTEM_PROMPT,
  findGuideProblem,
  buildUserPrompt,
  parseGuideRequest,
  parseGuideResponse,
} from './_lib/guideCore.js';
import { logServerError } from './_lib/serverLog.js';

/** 서버리스 함수 최대 실행 시간(초) */
export const config = { maxDuration: 30 };

/** HTTP 상태 코드 */
const STATUS_BAD_REQUEST = 400;
const STATUS_METHOD_NOT_ALLOWED = 405;
const STATUS_BAD_GATEWAY = 502;
const STATUS_SERVER_ERROR = 500;

/** JSON 응답을 만든다. */
function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Claude에 한 번 요청해 응답 텍스트를 돌려준다. */
async function askClaude(client: Anthropic, req: GuideRequest): Promise<string> {
  const message = await client.messages.create({
    model: GUIDE_MODEL,
    max_tokens: GUIDE_MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(req) }],
  });
  return message.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('');
}

/** 형식이 올바른 가이드를 받을 때까지 정해진 횟수만큼 요청한다. */
async function generateGuide(client: Anthropic, req: GuideRequest): Promise<AiGuide | null> {
  for (let attempt = 0; attempt <= GUIDE_FORMAT_RETRIES; attempt += 1) {
    const text = await askClaude(client, req);
    const guide = parseGuideResponse(text, req.level);
    if (guide) return guide;
    logServerError(`모델 응답 검사 실패 (${attempt + 1}번째): ${findGuideProblem(text)}`);
  }
  return null;
}

/** POST /api/guide : 날씨·프로필을 받아 AI 가이드를 돌려준다. */
export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ error: 'server_not_configured' }, STATUS_SERVER_ERROR);
  const body: unknown = await request.json().catch(() => null);
  const guideRequest = parseGuideRequest(body);
  if (!guideRequest) return json({ error: 'invalid_request' }, STATUS_BAD_REQUEST);
  try {
    const client = new Anthropic({
      apiKey,
      timeout: GUIDE_REQUEST_TIMEOUT_MS,
      maxRetries: 0,
    });
    const guide = await generateGuide(client, guideRequest);
    if (!guide) {
      logServerError('모델 응답 형식 오류로 재시도 소진');
      return json({ error: 'invalid_model_output' }, STATUS_BAD_GATEWAY);
    }
    return json(guide);
  } catch (e) {
    logServerError('Claude 요청 실패', e);
    return json({ error: 'upstream_failed' }, STATUS_BAD_GATEWAY);
  }
}

/** POST 외 메서드는 허용하지 않는다. */
export function GET(): Response {
  return json({ error: 'method_not_allowed' }, STATUS_METHOD_NOT_ALLOWED);
}
