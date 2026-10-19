import { useNow } from '../hooks/useNow';

interface HomeHeaderProps {
  location: string;
}

/** 시간 표기 (예: 오후 3:07) */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
}

/** 홈 상단: 위치, 현재 시간 (화면 이동은 하단 탭바가 담당한다) */
export default function HomeHeader({ location }: HomeHeaderProps) {
  const now = useNow();
  return (
    <header className="space-y-1">
      <p className="text-xs font-medium text-subtle-text">📍 {location}</p>
      <p className="text-2xl font-bold">{formatTime(now)}</p>
    </header>
  );
}
