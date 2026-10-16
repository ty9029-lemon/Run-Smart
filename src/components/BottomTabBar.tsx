import { NavLink, useLocation } from 'react-router-dom';
import { cn } from 'cn';
import { TAB_BAR_HEIGHT, TAB_IDS, TAB_ITEMS, type TabItem } from '../constants/navigation';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';

/**
 * 탭을 눌렀을 때 이동 이벤트를 기록한다. 이미 보고 있는 탭은 기록하지 않는다.
 * 기록 탭은 기존 지표(history_opened)도 함께 보낸다.
 */
function trackTabClick(tab: TabItem, currentPath: string): void {
  if (tab.path === currentPath) return;
  trackEvent(ANALYTICS_EVENTS.tabClicked, { tab: tab.id });
  if (tab.id === TAB_IDS.history) trackEvent(ANALYTICS_EVENTS.historyOpened);
}

/** 화면 하단에 고정되는 주요 메뉴 (홈 / 기록 / 설정) */
export default function BottomTabBar() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md" style={{ height: TAB_BAR_HEIGHT }}>
        {TAB_ITEMS.map((tab) => (
          <li key={tab.id} className="flex-1">
            <NavLink
              to={tab.path}
              end
              onClick={() => trackTabClick(tab, pathname)}
              className={({ isActive }) =>
                cn(
                  'relative flex h-full flex-col items-center justify-center gap-1 text-xs font-medium',
                  // 라이트에서는 글자색만으로 활성 구분이 약해 상단에 라임 막대를 더한다 (다크는 라임 글자로 충분)
                  isActive
                    ? 'text-highlight before:absolute before:inset-x-[30%] before:top-0 before:h-0.5 before:rounded-full before:bg-primary dark:before:hidden'
                    : 'text-muted-foreground',
                )
              }
            >
              <tab.icon aria-hidden="true" className="size-6" />
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
