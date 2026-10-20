import * as React from "react"
import { cn } from "cn"
import { Toast as ToastPrimitive } from "radix-ui"

/** 토스트가 화면에 머무는 시간(ms) */
const TOAST_DURATION_MS = 5000

const ToastProvider = ({
  duration = TOAST_DURATION_MS,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Provider>) => (
  <ToastPrimitive.Provider duration={duration} {...props} />
)

/** 토스트가 쌓이는 위치 (화면 하단 중앙, 모바일 폭에서도 좌우 여백 유지) */
function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      className={cn(
        "fixed inset-x-0 bottom-6 z-50 mx-auto flex w-full max-w-md flex-col gap-2 px-4 outline-none",
        className
      )}
      {...props}
    />
  )
}

function Toast({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Root>) {
  return (
    <ToastPrimitive.Root
      className={cn(
        // 배경과 반대 톤으로 눈에 띄게 한다 (다크는 흰 면, 라이트는 #111111 면 — DESIGN.md 토스트 규칙)
        "flex items-center justify-between gap-4 rounded-panel border border-toast-border bg-toast p-4 text-toast-foreground shadow-toast",
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-4 data-[state=open]:fade-in-0 data-[state=open]:duration-(--motion-duration-fast) data-[state=open]:ease-(--motion-ease-main)",
        "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-2 data-[state=closed]:fade-out-0 data-[state=closed]:duration-(--motion-duration-fast) data-[state=closed]:ease-(--motion-ease-exit)",
        className
      )}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      className={cn("text-sm leading-snug", className)}
      {...props}
    />
  )
}

export { Toast, ToastDescription, ToastProvider, ToastViewport }
export const ToastAction = ToastPrimitive.Action
