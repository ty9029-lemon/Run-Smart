/** 활동 종류 */
export type Activity = 'running' | 'hiking' | 'walking' | 'cycling' | 'outing';

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

/** 사용자 프로필 */
export interface Profile {
  selectedActivities: Activity[];
  lastActivity: Activity | null;
  offsets: Record<Activity, number>;
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
