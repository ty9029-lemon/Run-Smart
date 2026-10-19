import type { ActivityTimeSlot } from '../types';

/** 요일 구분 (평일 / 주말) */
export type DayType = 'weekday' | 'weekend';

/** 시간대별 시각 범위(양 끝 시 포함)와 해당 요일 */
export interface TimeSlotRange {
  startHour: number;
  endHour: number;
  dayType: DayType;
}

/** 특정 시각이 없는 '항상 다름'을 뺀 시간대 */
export type RangedTimeSlot = Exclude<ActivityTimeSlot, 'irregular'>;

/** 온보딩 시간대별 베스트 시간 탐색 범위 */
export const TIME_SLOT_RANGES: Record<RangedTimeSlot, TimeSlotRange> = {
  beforeWork: { startHour: 6, endHour: 9, dayType: 'weekday' },
  afterWork: { startHour: 18, endHour: 21, dayType: 'weekday' },
  weekdayDaytime: { startHour: 11, endHour: 16, dayType: 'weekday' },
  weekendMorning: { startHour: 6, endHour: 10, dayType: 'weekend' },
  weekendEvening: { startHour: 17, endHour: 21, dayType: 'weekend' },
};

/** 이 시각(시) 전은 오전, 이후는 오후로 본다 */
export const NOON_HOUR = 12;

/** 하루 중 베스트 시간 카드 최대 장수 */
export const MAX_BEST_TIME_CARDS = 2;
