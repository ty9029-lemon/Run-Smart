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

/** 경고 단계 */
export type WarningLevel = 'good' | 'caution' | 'careful';

/** 추위·더위 민감도 (각 1~5단계, 3이 보통) */
export interface Sensitivity {
  coldLevel: number;
  heatLevel: number;
}

/** 사용자 프로필 */
export interface Profile extends Sensitivity {
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

/** 복장 추천 항목 */
export interface OutfitItem {
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
}
