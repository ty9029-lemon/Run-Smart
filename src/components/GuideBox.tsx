import { useState } from 'react';
import { MESSAGES } from '../constants/messages';
import type { CoordsError } from '../hooks/useCoords';
import type { LocationStatus } from '../hooks/useLocationPermission';
import type { AiGuide, GuideState } from '../types';

/** 위치 권한이 없을 때 보여주는 안내와 [현재 위치로 사용] 버튼에 필요한 값 */
export interface LocationNoticeProps {
  status: LocationStatus;
  /** 위치를 읽지 못한 이유 (읽기에 실패했을 때만) */
  error?: CoordsError;
  /** 브라우저 위치 권한 요청 */
  onRequest: () => Promise<boolean>;
}

interface GuideBoxProps {
  /** AI 가이드 상태 (불러오는 중 / 실패 / 완료) */
  guide: GuideState;
  /** 가이드가 실패했을 때 대신 보여주는 원시 날씨 문구 */
  rawWeather: string;
  /** 위치 권한이 없어 서울 기준일 때만 전달한다 (없으면 안내 없음) */
  location?: LocationNoticeProps;
}

/** 위치 거부(1)나 확인 불가(2)는 기기 설정 때문일 수 있어 기기 설정 안내를 함께 보여준다. */
const DEVICE_GUIDE_ERROR_CODES: readonly number[] = [1, 2];

/**
 * 위치 권한 안내와 [현재 위치로 사용] 버튼.
 * 차단(denied)으로 보여도 일단 읽어 보고, 실패하면 설정 안내를 펼친다.
 * (사이트 설정을 바꿨는데 앱이 이전 상태를 들고 있을 수 있다.)
 */
function LocationNotice({ error, onRequest }: LocationNoticeProps) {
  const [showGuide, setShowGuide] = useState(false);
  const handleClick = async () => {
    const succeeded = await onRequest();
    if (!succeeded) setShowGuide(true);
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-steel-border">📍 {MESSAGES.locationDenied}</p>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-full border border-lime-pulse bg-lime-pulse px-5 py-2 text-sm font-medium text-carbon-black"
      >
        {MESSAGES.useCurrentLocation}
      </button>
      {showGuide && (
        <p className="text-sm text-steel-border">{MESSAGES.locationSettingsGuide}</p>
      )}
      {error && DEVICE_GUIDE_ERROR_CODES.includes(error.code) && (
        <p className="text-sm text-steel-border">{MESSAGES.locationSystemGuide}</p>
      )}
    </div>
  );
}

/** AI 가이드 본문 (요약 + 팁 불릿 + 상세 이유) */
function GuideContent({ guide }: { guide: AiGuide }) {
  return (
    <>
      <p className="mb-3 text-base">
        <span className="mr-2 text-xl">{guide.goOrNotEmoji}</span>
        {guide.guideMessage}
      </p>
      <ul className="mb-3 list-disc space-y-1 pl-5 text-sm">
        {guide.activityTips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
      <p className="text-sm text-steel-border">{guide.detailedReason}</p>
    </>
  );
}

/** 가이드 상태에 맞는 본문을 고른다. */
function GuideBody({ guide, rawWeather }: Pick<GuideBoxProps, 'guide' | 'rawWeather'>) {
  if (guide.state === 'ready') return <GuideContent guide={guide.data} />;
  if (guide.state === 'loading') {
    return (
      <p role="status" className="animate-pulse text-base text-steel-border">
        {MESSAGES.guideLoading}
      </p>
    );
  }
  return <p className="text-base">{rawWeather}</p>;
}

/** AI 가이드 메시지 박스. 불러오는 동안은 안내를, 실패하면 원시 날씨 문구를 보여준다. */
export default function GuideBox({ guide, rawWeather, location }: GuideBoxProps) {
  return (
    <section className="space-y-3 rounded-panel border border-card-border-ink bg-card-charcoal p-6">
      <GuideBody guide={guide} rawWeather={rawWeather} />
      {location && <LocationNotice {...location} />}
    </section>
  );
}
