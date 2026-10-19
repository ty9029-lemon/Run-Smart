import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CTA_IDS } from '../constants/analytics';
import { MESSAGES } from '../constants/messages';
import {
  requestLocationPermission,
  type LocationStatus as Status,
} from '../hooks/useLocationPermission';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';

interface LocationStatusProps {
  /** 브라우저 위치 권한 상태 */
  status: Status;
  /** 현재 위치로 날씨를 볼지 여부 (앱 내 선호) */
  enabled: boolean;
  onEnabledChange: (next: boolean) => void;
  /** true면 토글을 켤 때 바로 권한을 요청한다. false면 호출한 쪽이 나중에 요청한다. */
  requestOnEnable?: boolean;
}

/** 안내 문구를 고른다. 선호가 꺼져 있으면 서울 기준, 켜져 있으면 권한 상태에 맞춰 안내한다. */
function pickHint(enabled: boolean, status: Status, requestOnEnable: boolean): string | null {
  if (!enabled) return MESSAGES.locationOffHint;
  if (status === 'granted') return null;
  return requestOnEnable ? null : MESSAGES.locationAskOnStartHint;
}

/** 현재 위치 사용 토글 + 브라우저 권한 상태에 따른 안내 */
export default function LocationStatus({
  status,
  enabled,
  onEnabledChange,
  requestOnEnable = false,
}: LocationStatusProps) {
  const [showGuide, setShowGuide] = useState(false);
  const labelId = useId();
  const granted = status === 'granted';
  const hint = pickHint(enabled, status, requestOnEnable);

  /** 선호를 바꾸고, 켤 때 요청 모드면 권한을 요청한다. 거부되면 설정 안내를 보여준다. */
  const handleToggle = async (checked: boolean) => {
    onEnabledChange(checked);
    setShowGuide(false);
    if (!checked || !requestOnEnable || granted) return;
    trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: CTA_IDS.locationAllow });
    if (!(await requestLocationPermission())) setShowGuide(true);
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
        <Switch aria-labelledby={labelId} checked={enabled} onCheckedChange={handleToggle} />
      </div>
      {hint && <p className="mt-2 text-sm text-subtle-text">{hint}</p>}
      {enabled && !granted && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSettings}
          className="mt-3 -ml-5 text-subtle-text"
        >
          설정으로 이동
        </Button>
      )}
      {showGuide && <p className="mt-2 text-sm text-subtle-text">{MESSAGES.locationSettingsGuide}</p>}
    </div>
  );
}
