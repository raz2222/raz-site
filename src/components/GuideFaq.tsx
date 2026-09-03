import { useId, useState } from "react"
import { cn } from "@/lib/utils"
import type { FaqItem } from "@/lib/supabase"

// Callers import the schema builder from lib/faqSchema; it lives there so this
// file exports components only and fast refresh keeps working.

function Row({ q, a, dir }: { q: string; a: string; dir: "rtl" | "ltr" }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="border-b border-white/10 py-6">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className={cn("w-full flex items-center justify-between gap-6 group", dir === "rtl" ? "text-right" : "text-left")}
      >
        <span className="font-display text-lg md:text-xl font-medium group-hover:text-[#D1FE17] transition-colors">{q}</span>
        <span className={cn("font-mono text-xl transition-transform flex-none", open && "rotate-45")}>+</span>
      </button>
      <div
        id={id}
        role="region"
        aria-hidden={!open}
        className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]")}
      >
        <div className="overflow-hidden">
          <p className="text-dim text-base leading-relaxed max-w-2xl">{a}</p>
        </div>
      </div>
    </div>
  )
}

export function GuideFaq({ items, dir, heading }: { items: FaqItem[]; dir: "rtl" | "ltr"; heading: string }) {
  if (!items.length) return null
  return (
    <section dir={dir} className={cn("py-16 border-t border-white/10", dir === "rtl" ? "text-right" : "text-left")}>
      <div className="container max-w-3xl">
        <div className="font-mono text-xs uppercase tracking-wide text-dim mb-8">{heading}</div>
        {items.map((f) => (
          <Row key={f.q} q={f.q} a={f.a} dir={dir} />
        ))}
      </div>
    </section>
  )
}
