/** 한글 음절 유니코드 범위 (가 ~ 힣) */
const HANGUL_SYLLABLE_START = 0xac00;
const HANGUL_SYLLABLE_END = 0xd7a3;
/** 한글 음절에서 종성(받침) 경우의 수 (받침 없음 포함) */
const JONGSEONG_COUNT = 28;

/**
 * 단어 뒤에 붙일 목적격 조사(을/를)를 받침 유무로 골라 붙인다.
 * 한글로 끝나지 않으면 '을(를)'로 붙인다.
 * @param word 조사를 붙일 단어 (예: 러닝)
 * @returns 조사가 붙은 단어 (예: 러닝을, 자전거를)
 */
export function withObjectParticle(word: string): string {
  const last = word.charCodeAt(word.length - 1);
  if (Number.isNaN(last) || last < HANGUL_SYLLABLE_START || last > HANGUL_SYLLABLE_END) {
    return `${word}을(를)`;
  }
  const hasBatchim = (last - HANGUL_SYLLABLE_START) % JONGSEONG_COUNT !== 0;
  return `${word}${hasBatchim ? '을' : '를'}`;
}
