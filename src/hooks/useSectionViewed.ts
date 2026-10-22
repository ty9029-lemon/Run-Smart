import type { RefObject } from 'react';
import {
  SECTION_VIEW_DWELL_MS,
  SECTION_VIEW_RATIO,
  type SectionId,
} from '../constants/analytics';
import { ANALYTICS_EVENTS, trackEvent, type AnalyticsProps } from '../lib/analytics';
import { useViewedOnce } from './useViewedOnce';

/**
 * 개선 요소가 일정 비율·시간 이상 보였을 때 마운트당 한 번만 section_viewed 이벤트를 보낸다.
 * @param ref 노출을 관찰할 요소의 ref
 * @param section 어떤 개선 요소인지
 * @param props 이벤트에 더할 속성 (화면, 활동 등)
 */
export function useSectionViewed(
  ref: RefObject<Element | null>,
  section: SectionId,
  props: AnalyticsProps = {},
): void {
  useViewedOnce(ref, () => trackEvent(ANALYTICS_EVENTS.sectionViewed, { section, ...props }), {
    ratio: SECTION_VIEW_RATIO,
    dwellMs: SECTION_VIEW_DWELL_MS,
  });
}
