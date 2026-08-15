import { useState } from "react"
import { faqGroups } from "@/lib/faq"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"
import { cn } from "@/lib/utils"

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10 py-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-right gap-6"
      >
        <span className="font-display text-lg md:text-xl font-medium">{q}</span>
        <span className={cn("font-mono text-xl transition-transform flex-none", open && "rotate-45")}>
          +
        </span>
      </button>
      <div className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <p className="text-dim text-base leading-relaxed max-w-2xl">{a}</p>
        </div>
      </div>
    </div>
  )
}

export function Faq() {
  useDocumentMeta(
    "שאלות ותשובות — RAZ",
    "שאלות נפוצות על בניית אתרים, WordPress, פיתוח מותאם אישית וסרטוני AI לעסקים."
  )

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( שאלות ותשובות )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(28px,4.6vw,54px)] leading-[1.15] tracking-tight">
            שאלות שאנשים שואלים
            <br />
            לפני שהם כותבים לי.
          </h1>
        </Reveal>

        <div className="mt-16 flex flex-col gap-16 max-w-3xl">
          {faqGroups.map((group) => (
            <div key={group.title}>
              <h2 className="font-mono text-xs uppercase tracking-wide text-dim mb-2">
                {group.title}
              </h2>
              <div>
                {group.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
