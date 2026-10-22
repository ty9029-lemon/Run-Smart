import { useRef } from 'react';
import { LocationNotice, type LocationNoticeProps } from './GuideBox';
import OutfitPanel from './OutfitPanel';
import SkeletonLines from './SkeletonLines';
import { MESSAGES } from '../constants/messages';
import { ACTIVITY_SCREENS, OUTFIT_SOURCES, SECTION_IDS } from '../constants/analytics';
import { FADE_IN_CLASS } from '../constants/motion';
import { useSectionViewed } from '../hooks/useSectionViewed';
import { filterTipsNotInOutfit, formatGuideParagraph } from '../lib/guideTips';
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

/** AI 가이드가 완성돼 화면에 보인 문단. 일정 비율·시간 이상 보이면 노출 이벤트를 한 번 보낸다. */
function ReadyGuideText({ text, activity }: { text: string; activity: Activity }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  useSectionViewed(textRef, SECTION_IDS.aiGuide, { screen: ACTIVITY_SCREENS.home, activity });
  return (
    <p ref={textRef} className={`text-base ${FADE_IN_CLASS}`}>
      {text}
    </p>
  );
}

/** 가이드 상태에 맞는 설명 문단 (완료면 요약 + 상세 이유) */
function GuideParagraph({
  guide,
  rawWeather,
  activity,
}: Pick<HomeOutfitSectionProps, 'guide' | 'rawWeather' | 'activity'>) {
  if (guide.state === 'loading') {
    return (
      <div role="status" aria-busy="true">
        <span className="sr-only">{MESSAGES.guideLoading}</span>
        <SkeletonLines />
      </div>
    );
  }
  if (guide.state === 'ready') {
    return <ReadyGuideText text={formatGuideParagraph(guide.data)} activity={activity} />;
  }
  const text = rawWeather;
  return <p className={`text-base ${FADE_IN_CLASS}`}>{text}</p>;
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
        <GuideParagraph guide={guide} rawWeather={rawWeather} activity={activity} />
      </div>
      {location && <LocationNotice {...location} />}
      <OutfitPanel
        items={outfit}
        title={null}
        reason={outfitReason}
        tips={tips}
        isTipsLoading={guide.state === 'loading'}
        source={OUTFIT_SOURCES.home}
        activity={activity}
      />
    </section>
  );
}
