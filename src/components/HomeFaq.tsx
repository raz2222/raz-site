import { useId, useState } from "react"
import { Link } from "react-router-dom"
import { useFaqGroups } from "@/hooks/useContent"
import { Reveal } from "./Reveal"
import { Eyebrow } from "./Eyebrow"
import { cn } from "@/lib/utils"

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="border-b border-white/10 py-6">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between text-right gap-6 group"
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

export function HomeFaq() {
  const { faqGroups, loading } = useFaqGroups()

  if (loading || faqGroups.length === 0) return null

  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container md:text-center md:flex md:flex-col md:items-center">
        <Reveal className="mb-4">
          <Eyebrow>שאלות ותשובות</Eyebrow>
        </Reveal>
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            שאלות שאנשים שואלים
            <br />
            לפני שהם כותבים לי.
          </h2>
        </Reveal>

        <div className="mt-16 flex flex-col gap-16 max-w-3xl md:mx-auto md:text-right w-full">
          {faqGroups.map((group) => (
            <div key={group.id}>
              <div className="font-mono text-xs uppercase tracking-wide text-dim mb-2">{group.title}</div>
              <div>
                {group.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <Reveal className="mt-10">
          <Link
            to="/faq"
            className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
          >
            כל השאלות והתשובות ←
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
