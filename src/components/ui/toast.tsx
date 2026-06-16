"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "radix-ui"
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type ToastVariant = "success" | "error" | "info"

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastInput {
  title: string
  description?: string
  variant?: ToastVariant
}

let counter = 0
let items: ToastItem[] = []
const listeners = new Set<(next: ToastItem[]) => void>()

function emit() {
  for (const listener of listeners) {
    listener(items)
  }
}

function push(input: ToastInput) {
  counter += 1
  const item: ToastItem = {
    id: `toast-${counter}`,
    variant: "info",
    ...input,
  }
  items = [...items, item]
  emit()
  return item.id
}

function dismiss(id: string) {
  items = items.filter((item) => item.id !== id)
  emit()
}

/**
 * Imperative toast API, inspirado en sonner pero construido sobre radix-ui Toast
 * (sin instalar paquetes nuevos). Requiere `<Toaster />` montado una vez en el arbol.
 */
export const toast = Object.assign(
  (input: ToastInput) => push(input),
  {
    success: (title: string, description?: string) =>
      push({ title, description, variant: "success" }),
    error: (title: string, description?: string) =>
      push({ title, description, variant: "error" }),
    info: (title: string, description?: string) =>
      push({ title, description, variant: "info" }),
  }
)

const variantIcon: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="size-5 text-emerald-600" />,
  error: <CircleAlert className="size-5 text-destructive" />,
  info: <Info className="size-5 text-primary" />,
}

export function Toaster() {
  const [current, setCurrent] = React.useState<ToastItem[]>(items)

  React.useEffect(() => {
    listeners.add(setCurrent)
    return () => {
      listeners.delete(setCurrent)
    }
  }, [])

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
      {current.map((item) => (
        <ToastPrimitive.Root
          key={item.id}
          onOpenChange={(open) => {
            if (!open) dismiss(item.id)
          }}
          className={cn(
            "group pointer-events-auto flex items-start gap-3 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 shadow-lg",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full",
            "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full"
          )}
        >
          <span className="mt-0.5 shrink-0">{variantIcon[item.variant]}</span>
          <div className="flex-1 space-y-1">
            <ToastPrimitive.Title className="font-medium text-foreground">
              {item.title}
            </ToastPrimitive.Title>
            {item.description ? (
              <ToastPrimitive.Description className="text-sm text-muted-foreground">
                {item.description}
              </ToastPrimitive.Description>
            ) : null}
          </div>
          <ToastPrimitive.Close
            aria-label="Cerrar notificacion"
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 outline-none" />
    </ToastPrimitive.Provider>
  )
}
