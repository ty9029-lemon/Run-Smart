import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CTA_IDS } from '../constants/analytics';
import { MESSAGES } from '../constants/messages';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import type { LocationStatus as Status } from '../hooks/useLocationPermission';

interface LocationStatusProps {
  status: Status;
  /** 있으면 [위치 허용하기] 버튼을 보여준다 (온보딩용) */
  onRequest?: () => void;
}

/** 위치 권한 상태 표시 ("허용됨" / "비활성화됨") + 설정 이동 안내 */
export default function LocationStatus({ status, onRequest }: LocationStatusProps) {
  const [showGuide, setShowGuide] = useState(false);
  const granted = status === 'granted';

  /** [위치 허용하기] 클릭을 기록하고 권한 요청을 실행한다. */
  const handleRequest = () => {
    trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: CTA_IDS.locationAllow });
    onRequest?.();
  };

  /** [설정으로 이동] 클릭을 기록하고 안내 문구를 토글한다. */
  const handleSettings = () => {
    trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: CTA_IDS.locationSettings });
    setShowGuide((v) => !v);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-base">위치 권한</span>
        <span className={granted ? 'font-medium text-lime-pulse' : 'text-steel-border'}>
          {granted ? '허용됨' : '비활성화됨'}
        </span>
      </div>
      {!granted && onRequest && (
        <Button type="button" size="sm" onClick={handleRequest} className="mt-3 mr-2">
          위치 허용하기
        </Button>
      )}
      {!granted && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSettings}
          className="mt-3"
        >
          설정으로 이동
        </Button>
      )}
      {showGuide && <p className="mt-2 text-sm text-steel-border">{MESSAGES.locationSettingsGuide}</p>}
    </div>
  );
}
