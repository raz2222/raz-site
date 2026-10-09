import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useSiteContent } from "@/hooks/useSiteContent"
import { CONTACT_INFO_DEFAULT } from "@/lib/siteContentDefaults"
import { trackEvent } from "@/lib/analytics"

// Mirrors /thank-you: what happens next, by when, and a way to skip the wait.
const STEPS = [
  { title: "I read what you sent", body: "So when we talk, I already know what it is about." },
  { title: "I get back to you by the end of the next business day", body: "By phone, WhatsApp or email, depending on what you left." },
  { title: "A short call, then a quote", body: "We work out what you need, and you get a clear quote with scope, timeline and price." },
]

export function EnglishThankYou() {
  useDocumentMeta("Thank you · RAZ", "Got your details. I'll get back to you by the end of the next business day.")
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)
  const whatsappHref = `${contact.whatsapp_url}?text=${encodeURIComponent("Hi Raz, I just left my details on your site.")}`

  useEffect(() => {
    document.documentElement.lang = "en"
    document.documentElement.dir = "ltr"
    return () => {
      document.documentElement.lang = "he"
      document.documentElement.dir = "rtl"
    }
  }, [])

  return (
    <section dir="ltr" className="pt-32 pb-24 md:pt-40 text-left">
      <div className="container max-w-2xl">
        <h1 className="font-display font-black text-3xl md:text-5xl leading-tight mb-4">
          Got it. I&apos;ll get back to you by the end of the next business day.
        </h1>
        <p className="text-dim text-lg mb-12">Here is what happens next:</p>

        <ol className="space-y-6 mb-14">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-5">
              <span className="flex-none w-9 h-9 rounded-full bg-[#D1FE17] text-black font-mono text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <div className="font-display text-lg md:text-xl font-medium">{s.title}</div>
                <p className="text-dim mt-1">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="border border-white/15 rounded-[8px] p-6 mb-14">
          <div className="font-display text-lg font-medium mb-1">Rather not wait?</div>
          <p className="text-dim mb-5">Message me on WhatsApp and we&apos;ll start there.</p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("whatsapp_click", { location: "thank_you_en" })}
            className="inline-block font-mono text-[11px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform"
          >
            WhatsApp →
          </a>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-wide">
          <Link to="/en/faq" className="underline underline-offset-4 hover:text-[#D1FE17]">Common questions →</Link>
          <Link to="/en/work" className="underline underline-offset-4 hover:text-[#D1FE17]">Meanwhile, see my work →</Link>
          <Link to="/en" className="text-dim underline underline-offset-4 hover:text-[#D1FE17]">Back home</Link>
        </div>
      </div>
    </section>
  )
}
