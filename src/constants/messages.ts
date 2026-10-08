import type { WarningLevel } from '../types';

/** PRD 6장 실패 처리 문구 */
export const MESSAGES = {
  noActivity: '활동을 먼저 선택해 주세요.',
  locationDenied:
    '위치 정보가 있어야 가장 정확한 날씨 정보를 제공해 드릴 수 있어요. 설정에서 위치 권한을 허용해 주세요.',
  weatherFailed: '날씨 정보를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.',
  guideLoading: 'AI 가이드를 준비하고 있어요…',
  useCurrentLocation: '현재 위치로 사용',
  // 브라우저는 설정 화면을 직접 열 수 없어 안내 문구로 대신한다.
  locationSettingsGuide:
    '브라우저 주소창 왼쪽의 자물쇠(사이트 설정)에서 위치 권한을 허용해 주세요.',
  historyEmptyDay: '이 날은 기록이 없어요.',
  decisionGo: '가기로 기록했어요.',
  decisionSkip: '안 가기로 기록했어요.',
  decisionCancel: '취소하기',
  // 사이트 설정이 허용이어도 기기(시스템) 설정이 꺼져 있으면 위치를 읽을 수 없다.
  locationSystemGuide:
    '기기의 위치 서비스도 확인해 주세요. iPhone은 설정 → 개인정보 보호 및 보안 → 위치 서비스 → Safari 웹사이트에서 "앱을 사용하는 동안"으로, Android는 설정의 위치 기능과 브라우저 앱의 위치 권한을 확인해 주세요.',
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
