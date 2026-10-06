import { useState } from 'react';
import { MESSAGES } from '../constants/messages';
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
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-base">위치 권한</span>
        <span className={granted ? 'font-medium text-lime-pulse' : 'text-steel-border'}>
          {granted ? '허용됨' : '비활성화됨'}
        </span>
      </div>
      {!granted && onRequest && (
        <button
          type="button"
          onClick={onRequest}
          className="mt-3 mr-2 rounded-full border border-lime-pulse bg-lime-pulse px-5 py-2 text-sm font-medium text-carbon-black"
        >
          위치 허용하기
        </button>
      )}
      {!granted && (
        <button
          type="button"
          onClick={() => setShowGuide((v) => !v)}
          className="mt-3 rounded-full border border-lime-pulse px-5 py-2 text-sm font-medium text-lime-pulse"
        >
          설정으로 이동
        </button>
      )}
      {showGuide && <p className="mt-2 text-sm text-steel-border">{MESSAGES.locationSettingsGuide}</p>}
    </div>
  );
}
