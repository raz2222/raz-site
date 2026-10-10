import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useSiteContent } from "@/hooks/useSiteContent"
import { CONTACT_INFO_DEFAULT } from "@/lib/siteContentDefaults"
import { trackEvent } from "@/lib/analytics"
import { BookCall } from "@/components/BookCall"
import { Card, CardLabel, Step } from "@/components/ThankYouParts"
import { useSubmittedLead } from "@/hooks/useSubmittedLead"
import { formatSlot } from "@/lib/slotFormat"

// Mirrors /thank-you: what happens next, by when, and a way to skip the wait.

export function EnglishThankYou() {
  useDocumentMeta("Thank you · RAZ", "Got your details. I'll get back to you by the end of the next business day.")
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)
  const lead = useSubmittedLead()
  const [booked, setBooked] = useState<string | null>(null)
  const whatsappHref = `${contact.whatsapp_url}?text=${encodeURIComponent("Hi Raz, I just left my details on your site.")}`
  const firstName = lead?.name.split(/\s+/)[0]

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
      <div className="container max-w-2xl space-y-5">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D1FE17]/10 text-[#D1FE17] font-mono text-[11px] uppercase tracking-wide px-3 py-1.5 mb-6">
            <span aria-hidden="true">✓</span> Details received
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl leading-tight">
            {firstName ? `Thanks ${firstName}. ` : "Thanks. "}
            {booked ? "Our call is in the calendar." : "Here is what happens now."}
          </h1>
        </div>

        <Card>
          <CardLabel>Next steps</CardLabel>
          <ol className="space-y-5">
            {booked ? (
              <Step n={1} title={`I call you on ${formatSlot(booked, "en")} (Israel time)`} body="A short phone call. No slides, no commitment." />
            ) : (
              <>
                <Step n={1} title="I get back to you myself" body="By phone, WhatsApp or email, depending on what you left." />
                <Step n={2} title="By the end of the next business day" body="Or pick a time yourself below, if that suits you better." />
              </>
            )}
            <Step n={booked ? 2 : 3} title="A short call, then a quote" body="We work out what you need, and you get a clear quote with scope, timeline and price." />
          </ol>
        </Card>

        {lead?.id && (
          <Card id="book">
            <CardLabel>{booked ? "In the calendar" : "Rather pick a time yourself? (Israel time)"}</CardLabel>
            <BookCall leadId={lead.id} lang="en" onBooked={setBooked} />
          </Card>
        )}

        <div className="pt-6 text-center">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("whatsapp_click", { location: "thank_you_en" })}
            className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-8 py-4 hover:scale-105 transition-transform"
          >
            {booked ? "Anything to add? WhatsApp →" : "Rather not wait? WhatsApp →"}
          </a>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-6 font-mono text-[11px] uppercase tracking-wide">
            <Link to="/en/faq" className="underline underline-offset-4 text-dim hover:text-[#D1FE17]">Common questions</Link>
            <Link to="/en/work" className="underline underline-offset-4 text-dim hover:text-[#D1FE17]">My work</Link>
            <Link to="/en" className="underline underline-offset-4 text-dim hover:text-[#D1FE17]">Back home</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
