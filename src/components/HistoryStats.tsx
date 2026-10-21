import { Info } from 'lucide-react';
import { HISTORY_MESSAGES } from '../constants/messages';
import { MS_PER_SECOND } from '../constants/thresholds';
import { formatDistanceKm } from '../lib/distance';
import { formatElapsed } from '../lib/formatElapsed';
import { calcPaceSecPerKm, formatPace } from '../lib/pace';
import type { HistoryEntry } from '../types';

/** 큰 숫자로 보여줄 기록 한 칸 */
interface Stat {
  label: string;
  value: string;
}

/**
 * 기록에서 보여줄 숫자(거리, 페이스, 시간)를 고른다. 값이 없는 칸은 뺀다.
 * 페이스는 거리와 시간이 모두 있을 때만 계산한다.
 * @param entry 활동 기록
 */
export function buildStats(entry: HistoryEntry): Stat[] {
  const stats: Stat[] = [];
  const { distanceKm, durationSec } = entry;
  if (distanceKm !== undefined) {
    stats.push({ label: HISTORY_MESSAGES.distanceLabel, value: formatDistanceKm(distanceKm) });
  }
  const pace = calcPaceSecPerKm(distanceKm, durationSec);
  if (pace !== null) stats.push({ label: HISTORY_MESSAGES.paceLabel, value: formatPace(pace) });
  if (durationSec !== undefined) {
    const value = formatElapsed(durationSec * MS_PER_SECOND);
    stats.push({ label: HISTORY_MESSAGES.durationLabel, value });
  }
  return stats;
}

/**
 * 거리를 넣으면 페이스를 볼 수 있다는 안내가 필요한지 확인한다.
 * 활동을 마쳐 시간은 있는데 거리가 없는 기록에만 보여 준다.
 * @param entry 활동 기록
 */
export function needsDistanceHint(entry: HistoryEntry): boolean {
  return entry.distanceKm === undefined && entry.durationSec !== undefined;
}

/**
 * 거리·페이스·시간을 큰 숫자로 나란히 보여준다. 보여줄 값이 없으면 그리지 않는다.
 * 거리가 없는 기록에는 거리를 추가하는 방법을 눈에 띄는 안내 배너(i 아이콘)로 알린다.
 */
export default function HistoryStats({ entry }: { entry: HistoryEntry }) {
  const stats = buildStats(entry);
  if (stats.length === 0) return null;
  return (
    <>
      <dl className="mt-5 grid auto-cols-fr grid-flow-col gap-3">
        {stats.map(({ label, value }) => (
          // 화면에는 숫자가 위, 이름이 아래에 오지만 읽을 때는 이름이 먼저 오도록 DOM 순서는 dt가 앞이다
          <div key={label} className="flex flex-col-reverse">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-2xl font-bold leading-tight tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      {needsDistanceHint(entry) && (
        <div role="note" className="mt-4 flex items-start gap-2 rounded-[12px] bg-info p-3 text-sm">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-info-foreground" />
          <p>{HISTORY_MESSAGES.distanceHint}</p>
        </div>
      )}
    </>
  );
}
