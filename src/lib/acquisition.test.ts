import { describe, expect, it } from 'vitest';
import { ACQUISITION_VALUE_MAX_LENGTH } from '../constants/analytics';
import { parseAcquisition } from './acquisition';

describe('parseAcquisition', () => {
  it('utm 파라미터를 속성 이름으로 바꿔 읽는다', () => {
    expect(parseAcquisition('?utm_source=x&utm_medium=social&utm_campaign=ut1')).toEqual({
      utmSource: 'x',
      utmMedium: 'social',
      utmCampaign: 'ut1',
    });
  });

  it('없는 파라미터는 포함하지 않는다', () => {
    expect(parseAcquisition('')).toEqual({});
    expect(parseAcquisition('?pid=P01&utm_source=threads')).toEqual({ utmSource: 'threads' });
  });

  it('허용하지 않는 형식의 값은 버린다', () => {
    expect(parseAcquisition('?utm_source=a@b.com&utm_campaign=ut1')).toEqual({ utmCampaign: 'ut1' });
    expect(parseAcquisition('?utm_source=%3Cb%3E')).toEqual({});
    expect(parseAcquisition('?utm_source=%EC%8A%A4%EB%A0%88%EB%93%9C')).toEqual({});
  });

  it('최대 길이를 넘는 값은 버린다', () => {
    const tooLong = 'a'.repeat(ACQUISITION_VALUE_MAX_LENGTH + 1);
    expect(parseAcquisition(`?utm_source=${tooLong}`)).toEqual({});
  });
});
