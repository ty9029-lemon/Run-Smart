interface StepIndicatorProps {
  current: number;
  total: number;
  /** 현재 단계의 제목. 있으면 단계가 바뀔 때 스크린 리더에 읽어 준다 */
  stepTitle?: string;
}

/** 온보딩 진행 표시 (막대 + "n / total") */
export default function StepIndicator({ current, total, stepTitle }: StepIndicatorProps) {
  return (
    <div aria-label={`${total}단계 중 ${current + 1}단계`}>
      <div className="mb-2 flex gap-2">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-md transition-colors duration-(--motion-duration-fast) ease-(--motion-ease-main) ${
              i <= current ? 'bg-lime-pulse' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {current + 1} / {total}
      </p>
      {/* 단계가 바뀌면 새 단계를 읽어 준다. 화면에는 보이지 않는다 */}
      {stepTitle && (
        <p role="status" aria-live="polite" className="sr-only">
          {`${total}단계 중 ${current + 1}단계, ${stepTitle}`}
        </p>
      )}
    </div>
  );
}
