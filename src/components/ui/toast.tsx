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
        "flex items-center justify-between gap-4 rounded-panel border border-card-border-ink bg-card-charcoal p-4 text-pure-white shadow-lg",
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-4 data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
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
