import { PARTICIPANT_ID_MAX_LENGTH, PARTICIPANT_ID_PARAM } from '../constants/analytics';

/** 허용하는 참가자 코드 문자 (영문·숫자·하이픈·밑줄) */
const PARTICIPANT_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * URL 쿼리에서 UT 참가자 코드를 읽는다.
 * 코드가 없거나 허용 형식(영문·숫자·-·_, 최대 길이 이내)이 아니면 null을 돌려준다.
 * @param search location.search 형태의 쿼리 문자열 (예: '?pid=P01')
 * @returns 유효한 참가자 코드 또는 null
 */
export function parseParticipantId(search: string): string | null {
  const value = new URLSearchParams(search).get(PARTICIPANT_ID_PARAM);
  if (!value || value.length > PARTICIPANT_ID_MAX_LENGTH) return null;
  return PARTICIPANT_ID_PATTERN.test(value) ? value : null;
}
