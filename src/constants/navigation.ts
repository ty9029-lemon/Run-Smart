import { CalendarDays, House, Settings, type LucideIcon } from 'lucide-react';

/** 하단 탭 식별자 (tab_clicked 이벤트의 tab 속성값으로도 쓴다) */
export const TAB_IDS = {
  home: 'home',
  history: 'history',
  settings: 'settings',
} as const;

export type TabId = (typeof TAB_IDS)[keyof typeof TAB_IDS];

/** 하단 탭 한 칸의 정의 */
export interface TabItem {
  id: TabId;
  path: string;
  label: string;
  icon: LucideIcon;
}

/** 하단 탭 목록 (표시 순서대로) */
export const TAB_ITEMS: readonly TabItem[] = [
  { id: TAB_IDS.home, path: '/', label: '홈', icon: House },
  { id: TAB_IDS.history, path: '/history', label: '기록', icon: CalendarDays },
  { id: TAB_IDS.settings, path: '/settings', label: '설정', icon: Settings },
];

/** 하단 탭바 본문 높이 (safe-area 제외) */
export const TAB_BAR_HEIGHT = '4rem';

/** 홈의 고정 CTA와 탭바 사이 간격 */
export const CTA_GAP = '0.75rem';

/** 고정 CTA가 가리지 않도록 홈 본문 아래에 비워 둘 높이 (CTA 버튼 + 안내 문구 + 여유) */
export const CTA_CLEARANCE = '8rem';

/** 하단 탭바 높이 + 기기 하단 safe-area. 콘텐츠 하단 여백 계산에 쓴다. */
export const TAB_BAR_OFFSET = `calc(${TAB_BAR_HEIGHT} + env(safe-area-inset-bottom))`;
