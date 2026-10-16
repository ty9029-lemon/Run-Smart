import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check } from "lucide-react"
import { cn } from "cn"

/**
 * 칩 스타일 (pill 형태, 여러 개를 고르는 토글 전용).
 * 선택: 라임 면(다크는 옅은 라임) + 선택 전과 같은 외곽선 + 앞쪽 체크, 패딩 좌 14 · 우 20.
 */
const chipVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border py-2 text-sm font-bold whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      selected: {
        true: "border-chip-border-selected bg-selected pl-3.5 pr-5 text-highlight",
        false: "border-chip-border bg-transparent px-5 text-foreground hover:border-foreground",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
)

/** 선택 표시용 체크 아이콘 크기 클래스 (14px) */
const CHECK_ICON_CLASS = "size-3.5"

/** 선택 가능한 칩 (토글 버튼). 선택 여부는 aria-pressed로 전달한다. */
function Chip({
  className,
  selected = false,
  type = "button",
  children,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof chipVariants>) {
  return (
    <button
      data-slot="chip"
      data-selected={selected}
      type={type}
      aria-pressed={selected ?? false}
      className={cn(chipVariants({ selected }), className)}
      {...props}
    >
      {selected && <Check aria-hidden="true" strokeWidth={2.4} className={CHECK_ICON_CLASS} />}
      {children}
    </button>
  )
}

export { Chip, chipVariants }
