import * as React from "react"
import { cn } from "cn"

/** 쉬머 하이라이트: 가운데가 밝은 그라디언트(크기 200%)를 animate-skeleton이 좌우로 민다. */
const SHIMMER_CLASS =
  "bg-[linear-gradient(90deg,transparent_0%,var(--skeleton-highlight)_50%,transparent_100%)] bg-[length:200%_100%] bg-no-repeat"

/** 로딩 중 자리를 잡아 두는 회색 블록(하이라이트가 지나가는 쉬머). 모양(크기·모서리)은 호출처가 className으로 정한다. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn("animate-skeleton bg-border", SHIMMER_CLASS, className)}
      {...props}
    />
  )
}

export { Skeleton }
