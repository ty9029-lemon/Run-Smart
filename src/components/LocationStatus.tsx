import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CTA_IDS } from '../constants/analytics';
import { MESSAGES } from '../constants/messages';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import type { LocationStatus as Status } from '../hooks/useLocationPermission';

interface LocationStatusProps {
  status: Status;
  /** 있으면 상태 텍스트 대신 권한 요청 토글을 보여준다 (온보딩용). 허용 여부를 반환한다. */
  onRequest?: () => Promise<boolean> | void;
}

/** 위치 권한 상태 표시 ("허용됨" / "비활성화됨") + 권한 요청 토글 + 설정 이동 안내 */
export default function LocationStatus({ status, onRequest }: LocationStatusProps) {
  const [showGuide, setShowGuide] = useState(false);
  const labelId = useId();
  const granted = status === 'granted';

  /** 토글을 켜면 클릭을 기록하고 권한을 요청한다. 거부되면 설정 안내를 보여준다. */
  const handleToggle = async (checked: boolean) => {
    if (!checked || !onRequest) return;
    trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: CTA_IDS.locationAllow });
    const allowed = await onRequest();
    if (allowed === false) setShowGuide(true);
  };

  /** [설정으로 이동] 클릭을 기록하고 안내 문구를 토글한다. */
  const handleSettings = () => {
    trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: CTA_IDS.locationSettings });
    setShowGuide((v) => !v);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span id={labelId} className="text-base">위치 권한</span>
        {onRequest ? (
          // 허용 후에는 앱에서 철회할 수 없으므로 켜진 채로 비활성화한다.
          <Switch
            aria-labelledby={labelId}
            checked={granted}
            disabled={granted}
            onCheckedChange={handleToggle}
          />
        ) : (
          <span className={granted ? 'font-medium text-lime-pulse' : 'text-steel-border'}>
            {granted ? '허용됨' : '비활성화됨'}
          </span>
        )}
      </div>
      {!granted && (
        <Button
          type="button"
          variant={onRequest ? 'ghost' : 'outline'}
          size="sm"
          onClick={handleSettings}
          className={onRequest ? 'mt-3 -ml-5 text-steel-border' : 'mt-3'}
        >
          설정으로 이동
        </Button>
      )}
      {showGuide && <p className="mt-2 text-sm text-steel-border">{MESSAGES.locationSettingsGuide}</p>}
    </div>
  );
}
