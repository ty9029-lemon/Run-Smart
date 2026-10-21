import { Skeleton } from '@/components/ui/skeleton';
import SkeletonLines from './SkeletonLines';
import { MESSAGES } from '../constants/messages';
import { CTA_CLEARANCE, CTA_GAP, TAB_BAR_OFFSET } from '../constants/navigation';

/** 지표 칸 수 (HomeScoreCard와 같은 3열 2행) */
const METRIC_COUNT = 6;

/** 복장 아이콘 칸 수 (3열 2행) */
const OUTFIT_ITEM_COUNT = 6;

/** 선택한 시간 상세의 지표 타일 수 (3열 2행) */
const DETAIL_TILE_COUNT = 6;

/** 시간대 막대 높이(px). 막대마다 달라 차트처럼 보이게 한다. 한 칸의 최대 높이는 160px(h-40) */
const CHART_BAR_HEIGHTS = [64, 96, 120, 104, 80, 56, 72, 88];

/** 점수 카드가 들어올 자리 (링 88px + 지표 6칸 + 점수 이유 한 줄) */
function ScoreCardSkeleton() {
  return (
    <section className="space-y-4 rounded-panel bg-card p-6">
      <div className="flex items-center gap-6">
        <Skeleton className="size-22 shrink-0 rounded-full" />
        <Skeleton className="h-7 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-3 gap-x-5 gap-y-3 pl-2">
        {Array.from({ length: METRIC_COUNT }, (_, index) => (
          <div key={index} className="h-11 space-y-1.5">
            <Skeleton className="h-3.5 w-10 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex h-[41px] items-center justify-between gap-3 border-t pt-3">
        <Skeleton className="h-5 w-1/2 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>
    </section>
  );
}

/** 베스트 시간 카드 두 장이 들어올 자리 */
function BestTimeSkeleton() {
  return (
    <section className="space-y-3">
      <Skeleton className="h-7 w-32 rounded-md" />
      <div className="flex gap-3">
        <Skeleton className="h-31 flex-1 rounded-panel" />
        <Skeleton className="h-31 flex-1 rounded-panel" />
      </div>
    </section>
  );
}

/** 현재 날씨 추천 복장(가이드 문단 + 복장 패널)이 들어올 자리 */
function OutfitSkeleton() {
  return (
    <section className="space-y-3">
      <div className="space-y-3">
        <Skeleton className="h-7 w-48 rounded-md" />
        <SkeletonLines />
      </div>
      <div className="rounded-panel bg-card p-6">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: OUTFIT_ITEM_COUNT }, (_, index) => (
            <div key={index} className="flex flex-col items-center gap-2 px-1 py-3">
              <Skeleton className="size-16 rounded-2xl" />
              <Skeleton className="h-3 w-12 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 시간대 차트(제목 두 줄 + 막대)와 선택한 시간 상세가 들어올 자리 */
function ChartSkeleton() {
  return (
    <div className="space-y-6">
      <section className="-mx-4 space-y-4">
        <div className="flex h-[55px] flex-col justify-center gap-2 px-4">
          <Skeleton className="h-5 w-56 rounded-md" />
          <Skeleton className="h-5 w-40 rounded-md" />
        </div>
        <div className="flex h-44 items-end gap-3 pb-3 pl-4">
          {CHART_BAR_HEIGHTS.map((height, index) => (
            <Skeleton
              key={index}
              className="w-8 shrink-0 rounded-t-lg"
              style={{ height }}
            />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <div className="h-16 space-y-2">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: DETAIL_TILE_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-[68px] rounded-[12px]" />
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * 홈 데이터를 기다리는 동안 보여주는 스켈레톤.
 * HomeReady와 같은 순서·간격·바닥 여백으로 그려 데이터가 도착해도 화면이 덜 움직이게 한다.
 * 위치·시각 헤더는 항상 실제로 보이므로 여기서 그리지 않는다.
 */
export default function HomeSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="space-y-10"
      style={{ paddingBottom: CTA_CLEARANCE }}
    >
      <span className="sr-only">{MESSAGES.homeLoading}</span>
      <div>
        <div className="flex gap-2">
          <Skeleton className="h-[38px] w-16 rounded-full" />
          <Skeleton className="h-[38px] w-16 rounded-full" />
          <Skeleton className="h-[38px] w-16 rounded-full" />
        </div>
        <div className="mt-5 mb-4 flex h-[33px] items-center">
          <Skeleton className="h-6 w-4/5 rounded-md" />
        </div>
        <ScoreCardSkeleton />
      </div>
      <BestTimeSkeleton />
      <OutfitSkeleton />
      <ChartSkeleton />
      {/* HomeReady의 하단 고정 버튼과 같은 위치에 자리만 잡는다 */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 z-30 bg-linear-to-t from-background from-70% to-transparent px-4 pt-6"
        style={{ bottom: TAB_BAR_OFFSET, paddingBottom: CTA_GAP }}
      >
        <div className="mx-auto max-w-104">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
