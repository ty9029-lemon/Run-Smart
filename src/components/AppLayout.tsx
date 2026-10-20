import { useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { HOME_INTRO_KEY, PAGE_FADE_CLASS } from '../constants/motion';
import { TAB_BAR_OFFSET } from '../constants/navigation';
import { hasIntroPlayed } from '../lib/introPlayed';
import BottomTabBar from './BottomTabBar';

/** 홈 경로 */
const HOME_PATH = '/';

/**
 * 이 경로로 옮겨 왔을 때 페이드를 걸지 정한다.
 * 홈을 처음 보는 경우는 홈 자체의 순차 등장이 있으므로 페이드를 겹치지 않는다.
 */
function shouldFadeInto(pathname: string): boolean {
  return !(pathname === HOME_PATH && !hasIntroPlayed(HOME_INTRO_KEY));
}

/**
 * 온보딩 이후 화면의 공통 레이아웃: 본문 + 하단 탭바 (탭바에 가리지 않도록 하단 여백 확보).
 * 탭을 옮기면 새 페이지가 페이드로 나타나고 스크롤은 맨 위로 돌아간다.
 */
export default function AppLayout() {
  const { pathname } = useLocation();
  // 앱에 처음 들어온 화면은 페이드 없이 보여주고, 이후 경로가 바뀔 때만 페이드를 건다.
  const [page, setPage] = useState({ path: pathname, isFading: false });
  if (page.path !== pathname) setPage({ path: pathname, isFading: shouldFadeInto(pathname) });

  const isFirstPath = useRef(true);
  useLayoutEffect(() => {
    // 새로고침 직후에는 브라우저의 스크롤 복원을 건드리지 않는다.
    if (isFirstPath.current) {
      isFirstPath.current = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <div
        key={page.path}
        className={page.isFading ? PAGE_FADE_CLASS : ''}
        style={{ paddingBottom: TAB_BAR_OFFSET }}
      >
        <Outlet />
      </div>
      <BottomTabBar />
    </>
  );
}
