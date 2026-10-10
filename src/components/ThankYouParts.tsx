import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** The cards the thank-you page is built from, shared with its English mirror. */

export function Card({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return <div id={id} className={cn("rounded-[14px] border border-white/10 bg-white/[0.03] p-6 md:p-8 scroll-mt-28", className)}>{children}</div>
}

export function CardLabel({ children }: { children: ReactNode }) {
  return <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-5">{children}</div>
}

export function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-4">
      <span className="flex-none w-8 h-8 rounded-[8px] bg-[#D1FE17] text-black font-mono text-sm font-bold flex items-center justify-center">{n}</span>
      <div>
        <div className="font-display text-lg font-medium leading-snug">{title}</div>
        <p className="text-dim text-sm mt-0.5">{body}</p>
      </div>
    </li>
  )
}
