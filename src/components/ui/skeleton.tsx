import * as React from "react"
import { cn } from "cn"

/** 로딩 중 자리를 잡아 두는 회색 블록. 모양(크기·모서리)은 호출처가 className으로 정한다. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn("animate-skeleton bg-border", className)}
      {...props}
    />
  )
}

export { Skeleton }
