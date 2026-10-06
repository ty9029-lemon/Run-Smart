import { MESSAGES } from '../constants/messages';
import type { AiGuide, GuideState } from '../types';

interface GuideBoxProps {
  /** AI 가이드 상태 (불러오는 중 / 실패 / 완료) */
  guide: GuideState;
  /** 가이드가 실패했을 때 대신 보여주는 원시 날씨 문구 */
  rawWeather: string;
  /** 위치 권한이 없어 서울 기준일 때 안내를 보여줄지 */
  showLocationNotice: boolean;
}

/** 위치 권한 안내 문구 */
function LocationNotice() {
  return <p className="text-sm text-steel-border">📍 {MESSAGES.locationDenied}</p>;
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
export default function GuideBox({ guide, rawWeather, showLocationNotice }: GuideBoxProps) {
  return (
    <section className="space-y-3 rounded-panel border border-card-border-ink bg-card-charcoal p-6">
      <GuideBody guide={guide} rawWeather={rawWeather} />
      {showLocationNotice && <LocationNotice />}
    </section>
  );
}
