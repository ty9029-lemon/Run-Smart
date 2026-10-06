import { describe, expect, it } from 'vitest';
import {
  GUIDE_MESSAGE_MAX,
  GUIDE_TIPS_MAX_COUNT,
  buildUserPrompt,
  parseGuideRequest,
  parseGuideResponse,
} from './guideCore.js';

/** 올바른 요청 본문 */
const VALID_REQUEST = {
  activityLabel: '러닝',
  offset: -2,
  constraintLabels: ['무릎 문제'],
  weather: {
    temp: 12,
    humidity: 65,
    windSpeed: 8,
    precipitation: 0,
    condition: '흐림',
    pm10: 45,
    uvIndex: 2,
  },
  feltTemp: 8,
  score: 72,
  level: 'good',
  location: '서울 강남구',
};

/** 올바른 모델 응답 */
const VALID_OUTPUT = {
  guideMessage: '오늘 기온 12°C는 당신 기준 8°C처럼 느껴질 거예요.',
  activityTips: ['긴팔 상의 권장', '수분 준비'],
  goOrNotEmoji: '✅',
  detailedReason: '바람이 있지만 비는 없어요.',
};

describe('parseGuideRequest', () => {
  it('올바른 본문은 통과한다', () => {
    expect(parseGuideRequest(VALID_REQUEST)).not.toBeNull();
  });

  it('본문이 객체가 아니면 거부한다', () => {
    expect(parseGuideRequest(null)).toBeNull();
    expect(parseGuideRequest('text')).toBeNull();
  });

  it('숫자가 아니거나 범위를 벗어난 값은 거부한다', () => {
    const badWeather = { ...VALID_REQUEST, weather: { ...VALID_REQUEST.weather, temp: 'x' } };
    expect(parseGuideRequest(badWeather)).toBeNull();
    expect(parseGuideRequest({ ...VALID_REQUEST, offset: 99 })).toBeNull();
    expect(parseGuideRequest({ ...VALID_REQUEST, score: 101 })).toBeNull();
  });

  it('알 수 없는 경고 단계와 지나치게 긴 문자열은 거부한다', () => {
    expect(parseGuideRequest({ ...VALID_REQUEST, level: 'danger' })).toBeNull();
    const longLabel = { ...VALID_REQUEST, activityLabel: '가'.repeat(500) };
    expect(parseGuideRequest(longLabel)).toBeNull();
  });
});

describe('buildUserPrompt', () => {
  it('PRD 6장 입력 형식의 키를 담는다', () => {
    const parsed = JSON.parse(buildUserPrompt(parseGuideRequest(VALID_REQUEST)!));
    expect(parsed.activity).toBe('러닝');
    expect(parsed.user_temp_offset).toBe(-2);
    expect(parsed.current_weather.wind_speed).toBe(8);
    expect(parsed.personal_feels_like).toBe(8);
  });
});

describe('parseGuideResponse', () => {
  it('올바른 JSON은 변환하고 경고 단계는 앱 계산값을 쓴다', () => {
    const guide = parseGuideResponse(JSON.stringify(VALID_OUTPUT), 'caution');
    expect(guide?.warningLevel).toBe('caution');
    expect(guide?.activityTips).toEqual(['긴팔 상의 권장', '수분 준비']);
  });

  it('코드블록으로 감싼 JSON도 받아들인다', () => {
    const text = '```json\n' + JSON.stringify(VALID_OUTPUT) + '\n```';
    expect(parseGuideResponse(text, 'good')).not.toBeNull();
  });

  it('JSON이 아니거나 필드가 빠지면 null', () => {
    expect(parseGuideResponse('안내드릴게요', 'good')).toBeNull();
    const { detailedReason, ...missing } = VALID_OUTPUT;
    expect(detailedReason).toBeTruthy();
    expect(parseGuideResponse(JSON.stringify(missing), 'good')).toBeNull();
  });

  it('메시지가 지나치게 길면 이상 응답으로 본다', () => {
    const long = { ...VALID_OUTPUT, guideMessage: '가'.repeat(GUIDE_MESSAGE_MAX + 1) };
    expect(parseGuideResponse(JSON.stringify(long), 'good')).toBeNull();
  });

  it('팁이 너무 많거나 비어 있으면 null', () => {
    const many = { ...VALID_OUTPUT, activityTips: Array(GUIDE_TIPS_MAX_COUNT + 1).fill('팁') };
    expect(parseGuideResponse(JSON.stringify(many), 'good')).toBeNull();
    const none = { ...VALID_OUTPUT, activityTips: [] };
    expect(parseGuideResponse(JSON.stringify(none), 'good')).toBeNull();
  });

  it('단정적 금지 표현이 있으면 null', () => {
    const banned = { ...VALID_OUTPUT, guideMessage: '오늘은 가면 안 됩니다.' };
    expect(parseGuideResponse(JSON.stringify(banned), 'careful')).toBeNull();
  });
});
