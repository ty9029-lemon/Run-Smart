import { useEffect } from 'react';
import { initAnalytics } from '@/lib/analytics';

/** 마운트 시 클라이언트에서 Amplitude를 한 번 초기화한다. (렌더 출력 없음) */
export default function AnalyticsInit() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}
