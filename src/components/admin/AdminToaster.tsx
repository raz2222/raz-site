import { useEffect, useState } from "react"

/** The admin's message channel, replacing `alert()`.
 *
 * Every failure in here used to come back as a native alert: a system dialog
 * that blocks the page, cannot be styled, reads in the browser's language
 * around Raz's Hebrew, and on a phone drops a grey box over the screen that has
 * to be dismissed before anything else can happen. Thirty-nine of them.
 *
 * This is imperative on purpose. The calls sit inside event handlers and async
 * functions spread over a dozen screens, so the replacement had to be a
 * one-for-one swap · `alert(x)` becomes `adminNotify(x)` · rather than a prop
 * threaded through every component that can fail.
 *
 * `confirm()` is untouched: it returns an answer, and a toast cannot. */
export type ToastTone = "error" | "success"
export type Toast = { id: number; message: string; tone: ToastTone }

type Listener = (toasts: Toast[]) => void

let toasts: Toast[] = []
const listeners = new Set<Listener>()
let nextId = 1

function emit() {
  for (const listener of listeners) listener(toasts)
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

/** Show a message. Errors stay until dismissed; a success gets on with it. */
export function adminNotify(message: unknown, tone: ToastTone = "error") {
  const text = typeof message === "string" ? message : String((message as { message?: string })?.message ?? message)
  if (!text.trim()) return
  const id = nextId++
  toasts = [...toasts, { id, message: text, tone }]
  emit()
  if (tone === "success") setTimeout(() => dismiss(id), 3500)
}

export function AdminToaster() {
  const [items, setItems] = useState<Toast[]>(toasts)

  useEffect(() => {
    listeners.add(setItems)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  if (items.length === 0) return null

  return (
    // Above the phone's bottom nav, and below the celebration card.
    <div className="fixed z-[100] inset-x-4 bottom-24 md:inset-x-auto md:left-6 md:bottom-6 md:w-[26rem] grid gap-2">
      {items.map((toast) => (
        <div
          key={toast.id}
          role={toast.tone === "error" ? "alert" : "status"}
          className={
            "admin-solid admin-enter rounded-lg border px-4 py-3 shadow-2xl flex items-start justify-between gap-3 " +
            (toast.tone === "error" ? "border-red-400/50 bg-background" : "border-lime/50 bg-background")
          }
        >
          <p className="text-sm leading-relaxed min-w-0 break-words">{toast.message}</p>
          <button
            onClick={() => dismiss(toast.id)}
            aria-label="סגירה"
            className="flex-none font-mono text-[10px] uppercase tracking-wide text-dim hover:text-foreground transition-colors min-w-[44px] min-h-[44px] -m-2"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
