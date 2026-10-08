/** 활동 종류 */
export type Activity = 'running' | 'hiking' | 'walking' | 'cycling';

/** 제약사항 종류 */
export type Constraint =
  | 'kneeIssue'
  | 'uvSensitive'
  | 'dustSensitive'
  | 'asthma';

/** 가기 / 안 가기 결정 */
export type Decision = 'go' | 'skip';

/** 운동 후 체감 피드백 (추웠어요 / 적당했어요 / 더웠어요) */
export type Feedback = 'cold' | 'good' | 'hot';

/** 경고 단계 */
export type WarningLevel = 'good' | 'caution' | 'careful';

/** 추위·더위 민감도 (각 1~5단계, 3이 보통) */
export interface Sensitivity {
  coldLevel: number;
  heatLevel: number;
  /** 운동 후 피드백으로 학습한 체감온도 보정(°C). 음수면 더 춥게, 양수면 더 덥게 느낀다 */
  feedbackOffset?: number;
}

/** 사용자 프로필 */
export interface Profile extends Sensitivity {
  feedbackOffset: number;
  selectedActivities: Activity[];
  lastActivity: Activity | null;
  constraints: Constraint[];
}

/** 현재 날씨 */
export interface Weather {
  temp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  pm10: number;
  uvIndex: number;
  /** 낮이면 true, 밤이면 false */
  isDay: boolean;
  /** 이 시각부터 일몰까지 남은 시간(h). 일몰 이후면 음수, 정보가 없으면 undefined */
  hoursUntilSunset?: number;
}

/** 시간대별 날씨 (1시간 단위) */
export interface HourlyWeather extends Weather {
  hour: number;
}

/** AI 가이드 (PRD 6장 출력 형식) */
export interface AiGuide {
  guideMessage: string;
  activityTips: string[];
  warningLevel: WarningLevel;
  goOrNotEmoji: string;
  detailedReason: string;
}

/** 홈에서 AI 가이드 칸이 보여줄 상태 */
export type GuideState =
  | { state: 'loading' }
  | { state: 'failed' }
  | { state: 'ready'; data: AiGuide };

/** AI 가이드 요청 본문 (PRD 6장 입력 형식 + 앱이 계산한 체감온도·점수) */
export interface GuideRequest {
  activityLabel: string;
  offset: number;
  constraintLabels: string[];
  weather: Weather;
  feltTemp: number;
  score: number;
  level: WarningLevel;
  location: string;
}

/** 복장 추천 항목 분류 (화면에서 그룹 소제목으로 쓴다) */
export type OutfitCategory = 'top' | 'bottom' | 'outer' | 'shoes' | 'gear';

/** 복장 추천 항목 */
export interface OutfitItem {
  category: OutfitCategory;
  emoji: string;
  label: string;
}

/** 활동 히스토리 한 건 */
export interface HistoryEntry {
  id: string;
  date: string;
  activity: Activity;
  decision: Decision;
  weatherSummary: string;
  guide: AiGuide;
  /** 결정 당시 개인 체감온도(°C) */
  feelsLike?: number;
  /** 운동 후 체감 피드백 */
  feedback?: Feedback;
  /** 피드백을 남긴 시각(ISO) */
  feedbackAt?: string;
}
