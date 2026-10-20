import { Skeleton } from '@/components/ui/skeleton';

/** 글 한 줄의 높이(24px, text-base)에 맞춘 줄 스켈레톤의 기본 폭 */
const DEFAULT_LINE_WIDTHS = ['w-full', 'w-full', 'w-11/12', 'w-2/3'];

interface SkeletonLinesProps {
  /** 줄마다의 폭(Tailwind 클래스). 줄 수는 이 배열의 길이다 */
  widths?: string[];
  /** 줄 사이 간격 등을 정하는 컨테이너 클래스 */
  className?: string;
}

/** 본문 글이 들어올 자리를 줄 단위로 잡는다. 줄 높이를 24px로 맞춰 본문이 들어와도 덜 밀린다. */
export default function SkeletonLines({
  widths = DEFAULT_LINE_WIDTHS,
  className = '',
}: SkeletonLinesProps) {
  return (
    <div aria-hidden="true" className={className}>
      {widths.map((width, index) => (
        <div key={index} className="flex h-6 items-center">
          <Skeleton className={`h-4 rounded-md ${width}`} />
        </div>
      ))}
    </div>
  );
}
