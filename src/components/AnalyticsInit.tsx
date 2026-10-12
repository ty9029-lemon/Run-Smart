import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '@/lib/analytics';

/**
 * 마운트 시 분석 도구를 한 번 초기화하고, 경로(pathname)가 바뀔 때마다 페이지뷰를 기록한다.
 * 쿼리·해시만 바뀐 경우는 기록하지 않는다. (렌더 출력 없음, BrowserRouter 안에 둔다)
 */
export default function AnalyticsInit() {
  const { pathname } = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  // 선언 순서대로 실행되므로 초기화(속성 등록) 뒤에 페이지뷰가 기록된다
  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return null;
}
