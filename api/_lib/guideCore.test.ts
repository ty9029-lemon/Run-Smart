import { describe, expect, it } from 'vitest';
import {
  GUIDE_MESSAGE_MAX,
  GUIDE_TIP_MAX,
  GUIDE_TIPS_MAX_COUNT,
  SYSTEM_PROMPT,
  buildUserPrompt,
  findGuideProblem,
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
    isDay: true,
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

  it('isDay가 없으면(기존 클라이언트) 통과하고, boolean이 아니면 거부한다', () => {
    const { isDay, ...rest } = VALID_REQUEST.weather;
    expect(isDay).toBe(true);
    expect(parseGuideRequest({ ...VALID_REQUEST, weather: rest })).not.toBeNull();
    const bad = { ...VALID_REQUEST, weather: { ...VALID_REQUEST.weather, isDay: 'yes' } };
    expect(parseGuideRequest(bad)).toBeNull();
  });

  it('등급 필드가 올바르면 통과하고, 없으면(기존 클라이언트) 통과하며, 알 수 없는 값은 거부한다', () => {
    const graded = { ...VALID_REQUEST, dustGrade: '좋음', uvGrade: '높음' };
    expect(parseGuideRequest(graded)).not.toBeNull();
    expect(parseGuideRequest(VALID_REQUEST)).not.toBeNull();
    expect(parseGuideRequest({ ...VALID_REQUEST, dustGrade: '양호' })).toBeNull();
    expect(parseGuideRequest({ ...VALID_REQUEST, uvGrade: '강함' })).toBeNull();
    expect(parseGuideRequest({ ...VALID_REQUEST, maskAllowed: false })).not.toBeNull();
    expect(parseGuideRequest({ ...VALID_REQUEST, maskAllowed: 'no' })).toBeNull();
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

  it('낮/밤 정보를 담고, 밤이면 false다', () => {
    const night = { ...VALID_REQUEST, weather: { ...VALID_REQUEST.weather, isDay: false } };
    const parsed = JSON.parse(buildUserPrompt(parseGuideRequest(night)!));
    expect(parsed.current_weather.is_day).toBe(false);
    expect(JSON.parse(buildUserPrompt(parseGuideRequest(VALID_REQUEST)!)).current_weather.is_day).toBe(true);
  });
});

describe('밤 규칙', () => {
  const NIGHT_REQUEST = { ...VALID_REQUEST, weather: { ...VALID_REQUEST.weather, isDay: false } };

  it('시스템 프롬프트가 밤에는 안전 중심으로 쓰고 햇빛·자외선·쾌적을 말하지 않게 한다', () => {
    expect(SYSTEM_PROMPT).toContain('is_day가 false(밤)');
    expect(SYSTEM_PROMPT).toContain('햇빛·자외선·선글라스·자외선 차단제는 말하지 않습니다');
    expect(SYSTEM_PROMPT).toContain('자외선 민감이 있어도 밤에는 쓰지 않습니다');
    expect(SYSTEM_PROMPT).toContain('"쾌적하다"');
  });

  it('선크림 팁 규칙은 낮에만 적용한다', () => {
    expect(SYSTEM_PROMPT).toContain('is_day가 true(낮)이면');
  });

  it('밤이면 프롬프트의 is_day가 false이고, 밤에는 내일 일몰까지의 시간이 양수라 헷갈리므로 일몰 시간은 담지 않는다', () => {
    const withSunset = {
      ...NIGHT_REQUEST,
      weather: { ...NIGHT_REQUEST.weather, hoursUntilSunset: 17.8 },
    };
    const parsed = JSON.parse(buildUserPrompt(parseGuideRequest(withSunset)!));
    expect(parsed.current_weather.is_day).toBe(false);
    expect(parsed.current_weather).not.toHaveProperty('hours_until_sunset');
  });

  it('밤인데 햇빛·선글라스·자외선 차단·쾌적을 말하면 응답을 거른다', () => {
    const sun = { ...VALID_OUTPUT, detailedReason: '햇빛이 나올 때를 대비해 외출하세요.' };
    const comfy = { ...VALID_OUTPUT, guideMessage: '러닝하기 좋은 쾌적한 날씨네요.' };
    const tip = { ...VALID_OUTPUT, activityTips: ['선글라스 챙기기'] };
    for (const body of [sun, comfy, tip]) {
      expect(parseGuideResponse(JSON.stringify(body), 'good', true, false)).toBeNull();
      expect(findGuideProblem(JSON.stringify(body), true, false)).toBe('night_phrase');
    }
  });

  it('낮이거나 낮밤을 모르면 같은 문구도 통과한다', () => {
    const sun = { ...VALID_OUTPUT, detailedReason: '햇빛이 강하니 선글라스를 챙기세요.' };
    expect(parseGuideResponse(JSON.stringify(sun), 'good', true, true)).not.toBeNull();
    expect(parseGuideResponse(JSON.stringify(sun), 'good')).not.toBeNull();
  });

  it('밤에 어두운 환경의 안전을 말하는 응답은 통과한다', () => {
    const safe = { ...VALID_OUTPUT, activityTips: ['반사 장비 착용하기', '밝은 길로 다니기'] };
    expect(parseGuideResponse(JSON.stringify(safe), 'caution', true, false)).not.toBeNull();
  });
});

describe('러닝 저녁 구간(evening_run)', () => {
  const EVENING_REQUEST = {
    ...VALID_REQUEST,
    weather: { ...VALID_REQUEST.weather, isDay: false },
    eveningRun: true,
  };

  it('boolean이면 통과하고 프롬프트에 evening_run으로 담긴다', () => {
    const req = parseGuideRequest(EVENING_REQUEST);
    expect(req).not.toBeNull();
    expect(JSON.parse(buildUserPrompt(req!)).evening_run).toBe(true);
  });

  it('없으면 프롬프트에 담기지 않고, boolean이 아니면 거절한다', () => {
    const req = parseGuideRequest(VALID_REQUEST);
    expect(JSON.parse(buildUserPrompt(req!))).not.toHaveProperty('evening_run');
    expect(parseGuideRequest({ ...EVENING_REQUEST, eveningRun: 'yes' })).toBeNull();
  });

  it('시스템 프롬프트가 저녁 구간에는 밝은 시간대를 권하지 않고 긍정 총평을 허용하게 한다', () => {
    expect(SYSTEM_PROMPT).toContain('evening_run이 true이면');
    expect(SYSTEM_PROMPT).toContain('밝은 시간대를 권하는');
    expect(SYSTEM_PROMPT).toContain('햇빛·자외선·선글라스·자외선 차단제는 여전히 말하지 않습니다');
  });

  it('저녁 구간에서는 "쾌적" 같은 긍정 총평을 거르지 않는다', () => {
    const comfy = { ...VALID_OUTPUT, guideMessage: '러닝하기 좋은 쾌적한 날씨네요.' };
    expect(parseGuideResponse(JSON.stringify(comfy), 'good', true, false, true)).not.toBeNull();
    expect(findGuideProblem(JSON.stringify(comfy), true, false, true)).toBeNull();
  });

  it('저녁 구간이어도 햇빛·선글라스·자외선 차단 문구는 거른다', () => {
    const sun = { ...VALID_OUTPUT, detailedReason: '햇빛이 나올 때를 대비해 외출하세요.' };
    const tip = { ...VALID_OUTPUT, activityTips: ['선글라스 챙기기'] };
    for (const body of [sun, tip]) {
      expect(parseGuideResponse(JSON.stringify(body), 'good', true, false, true)).toBeNull();
      expect(findGuideProblem(JSON.stringify(body), true, false, true)).toBe('night_phrase');
    }
  });

  it('저녁 구간이 아니면 밤에 "쾌적"을 계속 거른다', () => {
    const comfy = { ...VALID_OUTPUT, guideMessage: '러닝하기 좋은 쾌적한 날씨네요.' };
    expect(parseGuideResponse(JSON.stringify(comfy), 'good', true, false, false)).toBeNull();
  });
});

describe('러닝 점수 단계(scoreTier)', () => {
  it('올바른 단계는 통과하고 프롬프트에 담긴다', () => {
    const req = parseGuideRequest({ ...VALID_REQUEST, scoreTier: 'good' });
    expect(req).not.toBeNull();
    expect(JSON.parse(buildUserPrompt(req!)).score_tier).toBe('good');
  });

  it('없으면(기존 클라이언트) 그대로 통과하고 프롬프트에 단계가 없다', () => {
    const req = parseGuideRequest(VALID_REQUEST);
    expect(req).not.toBeNull();
    expect(JSON.parse(buildUserPrompt(req!)).score_tier).toBeUndefined();
  });

  it('알 수 없는 단계는 거절한다', () => {
    expect(parseGuideRequest({ ...VALID_REQUEST, scoreTier: 'great' })).toBeNull();
  });
});

describe('buildUserPrompt - 등급', () => {
  it('앱이 정한 미세먼지·자외선 등급을 담는다', () => {
    const graded = { ...VALID_REQUEST, dustGrade: '좋음', uvGrade: '보통', maskAllowed: false };
    const parsed = JSON.parse(buildUserPrompt(parseGuideRequest(graded)!));
    expect(parsed.current_weather.dust_grade).toBe('좋음');
    expect(parsed.current_weather.uv_grade).toBe('보통');
    expect(parsed.mask_allowed).toBe(false);
  });
});

describe('parseGuideResponse', () => {
  it('올바른 JSON은 변환하고 경고 단계는 앱 계산값을 쓴다', () => {
    const guide = parseGuideResponse(JSON.stringify(VALID_OUTPUT), 'caution');
    expect(guide?.warningLevel).toBe('caution');
    expect(guide?.goOrNotEmoji).toBe('⚠️');
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

  it('팁이 한도 안에서 길어도 통과한다', () => {
    const longTip = { ...VALID_OUTPUT, activityTips: ['가'.repeat(GUIDE_TIP_MAX)] };
    expect(parseGuideResponse(JSON.stringify(longTip), 'good')).not.toBeNull();
    const tooLong = { ...VALID_OUTPUT, activityTips: ['가'.repeat(GUIDE_TIP_MAX + 1)] };
    expect(parseGuideResponse(JSON.stringify(tooLong), 'good')).toBeNull();
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

  it('마스크 언급이 허용되지 않았는데 마스크·넥게이터 문구가 있으면 null', () => {
    const inTip = { ...VALID_OUTPUT, activityTips: ['마스크 준비하기'] };
    const inMessage = { ...VALID_OUTPUT, guideMessage: '넥게이터로 입을 보호하세요.' };
    expect(parseGuideResponse(JSON.stringify(inTip), 'good', false)).toBeNull();
    expect(parseGuideResponse(JSON.stringify(inMessage), 'good', false)).toBeNull();
  });

  it('마스크 언급이 허용됐거나 허용 여부를 모르면 마스크 문구도 통과한다', () => {
    const withMask = { ...VALID_OUTPUT, activityTips: ['마스크 준비하기'] };
    expect(parseGuideResponse(JSON.stringify(withMask), 'good', true)).not.toBeNull();
    expect(parseGuideResponse(JSON.stringify(withMask), 'good')).not.toBeNull();
  });
});

describe('복장 목록(outfitLabels)', () => {
  const withOutfit = { ...VALID_REQUEST, outfitLabels: ['기능성 얇은 긴팔', '반바지 또는 레깅스', '러닝화'] };

  it('올바른 복장 목록은 통과하고 프롬프트에 담긴다', () => {
    const parsed = JSON.parse(buildUserPrompt(parseGuideRequest(withOutfit)!));
    expect(parsed.recommended_outfit).toEqual(['기능성 얇은 긴팔', '반바지 또는 레깅스', '러닝화']);
  });

  it('없으면(기존 클라이언트) 통과하고 프롬프트에도 없다', () => {
    const parsed = JSON.parse(buildUserPrompt(parseGuideRequest(VALID_REQUEST)!));
    expect(parsed.recommended_outfit).toBeUndefined();
  });

  it('배열이 아니거나 너무 많거나 문자열이 아니면 거절한다', () => {
    expect(parseGuideRequest({ ...VALID_REQUEST, outfitLabels: '긴팔' })).toBeNull();
    expect(parseGuideRequest({ ...VALID_REQUEST, outfitLabels: Array(13).fill('러닝화') })).toBeNull();
    expect(parseGuideRequest({ ...VALID_REQUEST, outfitLabels: [1] })).toBeNull();
  });

  it('시스템 프롬프트가 복장 일치와 자외선 차단제·선글라스 문구 규칙을 담는다', () => {
    expect(SYSTEM_PROMPT).toContain('recommended_outfit');
    expect(SYSTEM_PROMPT).toContain('자외선 차단제 바르기');
    expect(SYSTEM_PROMPT).toContain('선글라스 챙기기');
  });

  it('시스템 프롬프트가 요약·팁·근거에서 같은 소재를 반복하지 않는 규칙을 담는다', () => {
    expect(SYSTEM_PROMPT).toContain('같은 소재');
    expect(SYSTEM_PROMPT).toContain('한 단락으로 이어 붙여');
    expect(SYSTEM_PROMPT).toContain('날씨 수치와 총평은 다시 쓰지 않습니다');
  });

  it('시스템 프롬프트가 자외선 등급이 높음일 때만 차단을 권하도록 한다', () => {
    expect(SYSTEM_PROMPT).toContain('"높음"일 때만 이 두 문장의 행동 권유에 자외선 차단을 넣습니다');
    expect(SYSTEM_PROMPT).toContain('uv_grade와 관계없이 activityTips에 "자외선 차단제 바르기"');
  });
});
