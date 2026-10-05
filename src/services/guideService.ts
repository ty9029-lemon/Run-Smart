import { buildDummyGuide } from '../data/dummyGuide';
import type { Activity, AiGuide, Constraint, Weather } from '../types';

/** 가이드 요청 입력 (PRD 6장 입력 형식) */
export interface GuideInput {
  activity: Activity;
  offset: number;
  constraints: Constraint[];
  weather: Weather;
}

/**
 * AI 가이드를 조회한다. (M1: 더미 생성 / M2에서 실제 AI API로 교체)
 * @param input 활동·보정값·제약사항·날씨
 */
export async function fetchGuide(input: GuideInput): Promise<AiGuide> {
  return buildDummyGuide(
    input.activity,
    input.weather,
    input.offset,
    input.constraints,
  );
}
