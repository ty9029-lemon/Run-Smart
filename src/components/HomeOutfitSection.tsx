import { LocationNotice, type LocationNoticeProps } from './GuideBox';
import OutfitPanel from './OutfitPanel';
import { MESSAGES } from '../constants/messages';
import { OUTFIT_SOURCES } from '../constants/analytics';
import { filterTipsNotInOutfit } from '../lib/guideTips';
import type { OutfitReason } from '../lib/outfitReasons';
import type { Activity, GuideState, OutfitItem } from '../types';

interface HomeOutfitSectionProps {
  activity: Activity;
  outfit: OutfitItem[];
  /** 복장 추천 근거 */
  outfitReason: OutfitReason;
  /** AI 가이드 상태 (불러오는 중 / 실패 / 완료) */
  guide: GuideState;
  /** 가이드가 실패했을 때 대신 보여주는 원시 날씨 문구 */
  rawWeather: string;
  /** 위치 권한이 없어 서울 기준일 때만 전달한다 */
  location?: LocationNoticeProps;
}

/** 가이드 상태에 맞는 설명 문단 (완료면 요약 + 상세 이유) */
function GuideParagraph({ guide, rawWeather }: Pick<HomeOutfitSectionProps, 'guide' | 'rawWeather'>) {
  if (guide.state === 'loading') {
    return (
      <p role="status" className="animate-pulse text-base text-muted-foreground">
        {MESSAGES.guideLoading}
      </p>
    );
  }
  const text =
    guide.state === 'ready' ? `${guide.data.guideMessage} ${guide.data.detailedReason}` : rawWeather;
  return <p className="text-base">{text}</p>;
}

/** 현재 날씨 추천 복장: 제목 → 가이드 문단 → 복장 카드(활동 팁 불릿 포함) */
export default function HomeOutfitSection({
  activity,
  outfit,
  outfitReason,
  guide,
  rawWeather,
  location,
}: HomeOutfitSectionProps) {
  // 복장 카드에 이미 보이는 항목을 말하는 팁은 뺀다
  const tips = guide.state === 'ready' ? filterTipsNotInOutfit(guide.data.activityTips, outfit) : [];
  return (
    <section className="space-y-3">
      <div className="space-y-3">
        <h2 className="text-xl font-bold">현재 날씨 추천 복장</h2>
        <GuideParagraph guide={guide} rawWeather={rawWeather} />
      </div>
      {location && <LocationNotice {...location} />}
      <OutfitPanel
        items={outfit}
        title={null}
        reason={outfitReason}
        tips={tips}
        source={OUTFIT_SOURCES.home}
        activity={activity}
      />
    </section>
  );
}
