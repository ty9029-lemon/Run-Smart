import { ACQUISITION_PARAMS, ACQUISITION_VALUE_MAX_LENGTH } from '../constants/analytics';

/** 허용하는 유입 채널 값 문자 (영문·숫자·하이픈·밑줄·점) */
const ACQUISITION_VALUE_PATTERN = /^[A-Za-z0-9_.-]+$/;

/**
 * URL 쿼리에서 유입 채널(utm_source·utm_medium·utm_campaign)을 읽어 속성 이름으로 바꿔 돌려준다.
 * 허용 형식(영문·숫자·-·_·., 최대 길이 이내)이 아닌 값은 버린다.
 * @param search location.search 형태의 쿼리 문자열 (예: '?utm_source=x&utm_campaign=ut1')
 * @returns 속성 이름 → 값 (없으면 빈 객체). 예: { utmSource: 'x', utmCampaign: 'ut1' }
 */
export function parseAcquisition(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  for (const [param, property] of Object.entries(ACQUISITION_PARAMS)) {
    const value = params.get(param);
    const isValid =
      value && value.length <= ACQUISITION_VALUE_MAX_LENGTH && ACQUISITION_VALUE_PATTERN.test(value);
    if (isValid) result[property] = value;
  }
  return result;
}
