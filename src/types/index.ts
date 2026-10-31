import type { OUTFIT_ICON_KEYS } from '../constants/outfitIcons';

/** 활동 종류 */
export type Activity = 'running' | 'hiking' | 'walking' | 'cycling';

/** 제약사항 종류 */
export type Constraint =
  | 'kneeIssue'
  | 'footIssue'
  | 'uvSensitive'
  | 'dustSensitive'
  | 'asthma'
  | 'rhinitis';

/** 주로 활동하는 시간대 */
export type ActivityTimeSlot =
  | 'beforeWork'
  | 'afterWork'
  | 'weekdayDaytime'
  | 'weekendMorning'
  | 'weekendEvening'
  | 'irregular';

/** 가기 결정 */
export type Decision = 'go';

/** 운동 후 체감 피드백 (추웠어요 / 적당했어요 / 더웠어요) */
export type Feedback = 'cold' | 'good' | 'hot';

/** 경고 단계 */
export type WarningLevel = 'good' | 'caution' | 'careful';

/** 러닝 전용 5단계 (경고 단계를 더 잘게 나눈 것) */
export type ScoreTier = 'excellent' | 'good' | 'fair' | 'caution' | 'careful';

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
  /** 주로 활동하는 시간대 (비어 있어도 된다) */
  activityTimeSlots: ActivityTimeSlot[];
  /** 현재 위치로 날씨를 볼지 여부 (false면 서울 기준) */
  useCurrentLocation: boolean;
}

/** 현재 날씨 */
export interface Weather {
  temp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  pm10: number;
  /** PM2.5 농도(㎍/㎥). 실측을 받았을 때만 있다 */
  pm25?: number;
  /**
   * pm10의 출처. 'observed'는 측정소 실측, 'model'은 예측 모델 값,
   * 'adjusted'는 모델 값을 현재 실측과의 차이로 보정한 값(시간대별 예보),
   * 'none'은 값을 구하지 못한 것(pm10의 0은 자리 채움일 뿐이라 실제 농도로 쓰면 안 된다)
   */
  pm10Source?: 'observed' | 'model' | 'adjusted' | 'none';
  uvIndex: number;
  /** 낮이면 true, 밤이면 false */
  isDay: boolean;
  /** 이 시각부터 일몰까지 남은 시간(h). 일몰 이후면 음수, 정보가 없으면 undefined */
  hoursUntilSunset?: number;
  /** 이 날씨의 시각(0~23시). 해 진 뒤 저녁인지 가릴 때 쓰며, 없으면 저녁 예외를 적용하지 않는다 */
  hour?: number;
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

/** 미세먼지 등급 (날씨 카드·복장·AI 가이드 공통) */
export type DustGrade = '좋음' | '보통' | '나쁨' | '매우나쁨';

/** 자외선 표시 등급 (낮음·보통·높음) */
export type UvLevel = '낮음' | '보통' | '높음';

/** 자외선 등급 (복장의 선글라스·선크림 기준과 같다) */
export type UvGrade = '보통' | '높음';

/** AI 가이드 요청 본문 (PRD 6장 입력 형식 + 앱이 계산한 체감온도·점수) */
export interface GuideRequest {
  activityLabel: string;
  offset: number;
  constraintLabels: string[];
  weather: Weather;
  feltTemp: number;
  score: number;
  level: WarningLevel;
  /** 러닝 5단계 (러닝이 아니거나 기존 클라이언트면 없음) */
  scoreTier?: ScoreTier;
  location: string;
  /** 앱이 정한 미세먼지 등급 (없으면 기존 클라이언트) */
  dustGrade?: DustGrade;
  /** 앱이 정한 자외선 등급 */
  uvGrade?: UvGrade;
  /** AI 가이드가 마스크를 언급해도 되는지 (false면 언급하지 않는다. 없으면 기존 클라이언트) */
  maskAllowed?: boolean;
  /** 앱이 화면에 추천한 복장 이름 목록. 가이드의 복장 팁이 화면과 어긋나지 않게 알려 준다 (없으면 기존 클라이언트) */
  outfitLabels?: string[];
  /** 해는 졌지만 러닝 저녁 구간(일조 감점이 없는 시간)인지. true면 가이드가 "밝은 시간대"를 권하지 않는다 (없으면 기존 클라이언트) */
  eveningRun?: boolean;
}

/** 복장 추천 항목 분류 (화면에서 그룹 소제목으로 쓴다) */
export type OutfitCategory = 'top' | 'bottom' | 'outer' | 'shoes' | 'gear';

/** 복장 일러스트 종류 (label이 아니라 모양 기준으로 묶은 키) */
export type OutfitIconKey = (typeof OUTFIT_ICON_KEYS)[number];

/** 복장 추천 항목 */
export interface OutfitItem {
  category: OutfitCategory;
  icon: OutfitIconKey;
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
  /** 결정 당시 추천 복장 (이전 기록에는 없음) */
  outfit?: OutfitItem[];
  /** 운동 후 체감 피드백 */
  feedback?: Feedback;
  /** 피드백을 남긴 시각(ISO) */
  feedbackAt?: string;
  /** 활동 시간(초). 종료 버튼을 눌러 활동을 마친 기록에만 있다 */
  durationSec?: number;
  /** 사용자가 입력한 실제 이동 거리(km) */
  distanceKm?: number;
  /** 사용자가 입력한 실제 착용 복장 */
  actualOutfit?: string;
}

/** 운동 후 피드백과 함께 남기는 선택 입력 */
export interface FeedbackDetail {
  distanceKm?: number;
  actualOutfit?: string;
}
