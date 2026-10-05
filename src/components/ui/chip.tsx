import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/** 칩 스타일: 선택 상태에서만 라임을 쓴다 (pill 형태) */
const chipVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-5 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      selected: {
        true: "border-primary bg-primary text-primary-foreground",
        false: "border-input bg-transparent text-foreground hover:border-foreground",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
)

/** 선택 가능한 칩 (토글 버튼). 선택 여부는 aria-pressed로 전달한다. */
function Chip({
  className,
  selected = false,
  type = "button",
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
    />
  )
}

export { Chip, chipVariants }
