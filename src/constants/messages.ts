import type { WarningLevel } from '../types';

/** PRD 6장 실패 처리 문구 */
export const MESSAGES = {
  noActivity: '활동을 먼저 선택해 주세요.',
  locationDenied:
    '위치 정보가 있어야 가장 정확한 날씨 정보를 제공해 드릴 수 있어요. 설정에서 위치 권한을 허용해 주세요.',
  weatherFailed: '날씨 정보를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.',
} as const;

/**
 * AI 가이드를 받지 못했을 때 보여주는 원시 날씨 문구 (PRD 6장)
 * @param temp 기온(°C)
 * @param condition 날씨 상태
 * @param windSpeed 풍속(m/s)
 */
export function formatRawWeather(
  temp: number,
  condition: string,
  windSpeed: number,
): string {
  return `날씨: ${temp}°C, ${condition}, 바람 ${windSpeed}m/s`;
}

/** 경고 단계별 헤드라인 문구 */
export const LEVEL_LABEL: Record<WarningLevel, string> = {
  good: '활동하기 좋아요',
  caution: '주의가 필요해요',
  careful: '신중히 검토하세요',
};

/** 위치를 알 수 없을 때 사용하는 기준 위치 */
export const DEFAULT_LOCATION = '서울 강남구';
