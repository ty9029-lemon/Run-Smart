import { withObjectParticle } from '../lib/koreanParticle';
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
  locationOffNotice: '현재 위치 사용이 꺼져 있어 서울 기준으로 보여드리고 있어요.',
  locationOffHint: '꺼 두면 서울 기준으로 날씨를 보여드려요.',
  locationAskOnStartHint: '시작하면 위치 권한을 물어봐요.',
  historyEmptyDay: '이 날은 기록이 없어요.',
  toastUndo: '실행 취소',
  departureCancel: '출발 취소',
  // 사이트 설정이 허용이어도 기기(시스템) 설정이 꺼져 있으면 위치를 읽을 수 없다.
  locationSystemGuide:
    '기기의 위치 서비스도 확인해 주세요. iPhone은 설정 → 개인정보 보호 및 보안 → 위치 서비스 → Safari 웹사이트에서 "앱을 사용하는 동안"으로, Android는 설정의 위치 기능과 브라우저 앱의 위치 권한을 확인해 주세요.',
} as const;

/** 앱 만족도 팝업 문구 */
export const APP_REVIEW_MESSAGES = {
  title: 'Run Smart, 어떠셨나요?',
  description: '별점을 남겨 주시면 서비스를 개선하는 데 큰 도움이 돼요.',
  ratingLabel: '만족도 별점',
  messageLabel: '남기고 싶은 말',
  messagePlaceholder: '자유롭게 적어 주세요. (선택)',
  messagePlaceholderLow: '어떤 점이 아쉬웠나요? (선택)',
  submit: '보내기',
  submitting: '보내는 중…',
  later: '다음에 할게요',
  failed: '지금은 보내지 못했어요. 잠시 후 다시 시도해 주세요.',
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

/**
 * 출발 기록 직후 토스트 문구 (줄바꿈 \n 포함, 표시할 때 whitespace-pre-line 필요)
 * @param activityLabel 활동명 (예: 러닝)
 */
export function formatDepartureToast(activityLabel: string): string {
  return `즐거운 ${activityLabel} 되세요!\n돌아오시면 착장 피드백을 반영해 드릴게요.`;
}

/**
 * 출발을 기록한 뒤 CTA 자리에 보여주는 안내 문구
 * @param activityLabel 활동명 (예: 러닝)
 */
export function formatDepartedNotice(activityLabel: string): string {
  return `${withObjectParticle(activityLabel)} 출발했어요. 다시 만나요`;
}

/** 경고 단계별 헤드라인 문구 */
export const LEVEL_LABEL: Record<WarningLevel, string> = {
  good: '활동하기 좋아요',
  caution: '주의가 필요해요',
  careful: '신중히 검토하세요',
};

/** 위치를 알 수 없을 때 사용하는 기준 위치 */
export const DEFAULT_LOCATION = '서울 강남구';
