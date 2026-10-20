import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * 칩 스타일 (pill 형태, 여러 개를 고르는 토글 또는 하나를 고르는 라디오 그룹).
 * 선택: 옅은 라임 면 + 라임 외곽선 (라이트·다크 공통, 체크 아이콘 없음).
 */
const chipVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full border px-5 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      selected: {
        true: "border-chip-border-selected bg-chip-selected text-highlight",
        false: "border-chip-border bg-transparent text-foreground hover:border-foreground",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
)

/** 선택 가능한 칩. 기본은 토글 버튼이라 aria-pressed로 선택 여부를 전달한다(라디오로 쓸 때는 role·aria-checked를 넘기고 aria-pressed를 끈다). */
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
      {children}
    </button>
  )
}

export { Chip, chipVariants }
