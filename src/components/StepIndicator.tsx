interface StepIndicatorProps {
  current: number;
  total: number;
}

/** 온보딩 진행 표시 (막대 + "n / total") */
export default function StepIndicator({ current, total }: StepIndicatorProps) {
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
    </div>
  );
}
