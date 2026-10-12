import { describe, expect, it } from 'vitest';
import { PARTICIPANT_ID_MAX_LENGTH } from '../constants/analytics';
import { parseParticipantId } from './participantId';

describe('parseParticipantId', () => {
  it('유효한 참가자 코드를 읽는다', () => {
    expect(parseParticipantId('?pid=P01')).toBe('P01');
    expect(parseParticipantId('?foo=1&pid=ut_user-2')).toBe('ut_user-2');
  });

  it('파라미터가 없거나 비어 있으면 null이다', () => {
    expect(parseParticipantId('')).toBeNull();
    expect(parseParticipantId('?foo=1')).toBeNull();
    expect(parseParticipantId('?pid=')).toBeNull();
  });

  it('허용하지 않는 문자가 있으면 null이다 (이메일·한글·공백·태그)', () => {
    expect(parseParticipantId('?pid=a@b.com')).toBeNull();
    expect(parseParticipantId('?pid=김태연')).toBeNull();
    expect(parseParticipantId('?pid=P%2001')).toBeNull();
    expect(parseParticipantId('?pid=%3Cb%3E')).toBeNull();
  });

  it('최대 길이를 넘으면 null이다', () => {
    const tooLong = 'a'.repeat(PARTICIPANT_ID_MAX_LENGTH + 1);
    expect(parseParticipantId(`?pid=${tooLong}`)).toBeNull();
    expect(parseParticipantId(`?pid=${'a'.repeat(PARTICIPANT_ID_MAX_LENGTH)}`)).not.toBeNull();
  });
});
