/** 복장 근거 한 줄에 덧붙이는 조건 근거의 최대 개수 */
export const MAX_OUTFIT_EXTRA_REASONS = 2;

/** 기본 근거 문장에 보여줄 상의·겉옷·하의 이름의 최대 개수 */
export const MAX_OUTFIT_BASE_LABELS = 3;

/** 복장 근거 문구 */
export const OUTFIT_REASON_MESSAGES = {
  warmup: '운동하면 체온이 올라 한 단계 가볍게 맞췄어요.',
  rain: '비가 와서',
  wind: '바람이 강해',
  dark: '어두워서',
  uv: '자외선이 강해',
  glare: '햇빛이 강해',
  dust: '미세먼지에 대비해',
  coldAir: '찬 공기에 대비해',
  knee: '무릎 보호를 위해',
  ice: '빙판에 대비해',
} as const;

/** 기본 근거 문장 (체감온도와 상의·겉옷·하의) */
export function formatOutfitBase(feelsLike: number, labels: string[]): string {
  return `체감 ${feelsLike}°C 구간이라 ${labels.join(' · ')} 차림으로 맞췄어요.`;
}
