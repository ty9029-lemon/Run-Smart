import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNow } from '../hooks/useNow';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';

interface HomeHeaderProps {
  location: string;
}

/** 시간 표기 (예: 오후 3:07) */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
}

/** 홈 상단: 현재 시간, 위치, 기록/설정 진입 */
export default function HomeHeader({ location }: HomeHeaderProps) {
  const now = useNow();
  return (
    <header className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold">{formatTime(now)}</p>
        <p className="text-sm text-steel-border">📍 {location}</p>
      </div>
      <nav className="flex items-center gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link to="/history" onClick={() => trackEvent(ANALYTICS_EVENTS.historyOpened)}>
            기록
          </Link>
        </Button>
        <Button asChild variant="secondary" size="icon-sm">
          <Link to="/settings" aria-label="설정">
            <Settings />
          </Link>
        </Button>
      </nav>
    </header>
  );
}
