import { useNow } from '../hooks/useNow';

interface HomeHeaderProps {
  location: string;
}

/** 시간 표기 (예: 오후 3:07) */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
}

/** 홈 상단: 현재 시간, 위치 (화면 이동은 하단 탭바가 담당한다) */
export default function HomeHeader({ location }: HomeHeaderProps) {
  const now = useNow();
  return (
    <header>
      <p className="text-2xl font-bold">{formatTime(now)}</p>
      <p className="text-sm text-muted-foreground">📍 {location}</p>
    </header>
  );
}
