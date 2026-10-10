import { useId, useState } from "react"
import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useSiteContent } from "@/hooks/useSiteContent"
import { Card, CardLabel, Step } from "@/components/ThankYouParts"
import { useSubmittedLead } from "@/hooks/useSubmittedLead"
import { CONTACT_INFO_DEFAULT, THANK_YOU_DEFAULT } from "@/lib/siteContentDefaults"
import { trackEvent } from "@/lib/analytics"
import { BookCall } from "@/components/BookCall"
import { formatSlot } from "@/lib/slotFormat"
import { VideoPlayer } from "@/components/VideoPlayer"
import { cn } from "@/lib/utils"

/** The page after the form, built as the second conversion rather than a dead
 * end. The order is the order a lead's questions arrive in: what happens now
 * and when, can I just pick a time, what do people usually ask, and has this
 * worked for anyone like me. It ends on one obvious next step.
 *
 * Nothing here is a second copy of something editable elsewhere: the questions
 * and the story are the `thank_you_page` block in /admin/pages, and the
 * WhatsApp link is the site-wide one. */

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const id = useId()
  return (
    <div className="border-b border-white/10 last:border-0">
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={id} className="w-full flex items-center justify-between gap-6 py-4 text-right">
        <span className="font-display text-base md:text-lg font-medium">{q}</span>
        <span className={cn("flex-none w-7 h-7 rounded-full border border-white/20 flex items-center justify-center font-mono transition-transform", open && "rotate-45 border-[#D1FE17] text-[#D1FE17]")}>+</span>
      </button>
      <div id={id} role="region" className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]")}>
        <p className="overflow-hidden text-dim leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

export function ThankYou() {
  useDocumentMeta("תודה · RAZ", "קיבלתי את הפרטים, אחזור אליכם עד סוף יום העסקים הבא.")
  const lead = useSubmittedLead()
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)
  const { content: page } = useSiteContent("thank_you_page", THANK_YOU_DEFAULT)
  const [booked, setBooked] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState(0)

  const firstName = lead?.name.split(/\s+/)[0]
  const whatsappHref = `${contact.whatsapp_url}?text=${encodeURIComponent(
    booked ? `היי רז, קבעתי שיחה ל${formatSlot(booked, "he")}.` : "היי רז, השארתי עכשיו פרטים באתר."
  )}`
  const canBook = Boolean(lead?.id)
  const hasStory = Boolean(page.story_video.trim() || page.story_quote.trim())

  return (
    <section className="pt-32 pb-24 md:pt-40">
      <div className="container max-w-2xl space-y-5">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D1FE17]/10 text-[#D1FE17] font-mono text-[11px] uppercase tracking-wide px-3 py-1.5 mb-6">
            <span aria-hidden="true">✓</span> הפרטים התקבלו
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl leading-tight">
            {firstName ? `תודה ${firstName}. ` : "תודה. "}
            {booked ? "השיחה שלנו ביומן." : "הנה מה שקורה עכשיו."}
          </h1>
        </div>

        <Card>
          <CardLabel>הצעדים הבאים</CardLabel>
          <ol className="space-y-5">
            {booked ? (
              <Step n={1} title={`אני מתקשר אליכם ב${formatSlot(booked, "he")}`} body="שיחת טלפון קצרה, בלי מצגות ובלי התחייבות." />
            ) : (
              <>
                <Step n={1} title="אני חוזר אליכם בעצמי" body="בטלפון או בוואטסאפ, לפי מה שהשארתם. לא נציג ולא מוקד." />
                <Step n={2} title="עד סוף יום העסקים הבא" body="ואם נוח לכם יותר לקבוע זמן מראש, בחרו אותו כאן למטה." />
              </>
            )}
            <Step n={booked ? 2 : 3} title="שיחה קצרה ואז הצעת מחיר" body="מבינים מה צריך, ומקבלים הצעה מסודרת עם היקף, לוח זמנים ומחיר." />
          </ol>
        </Card>

        {canBook && lead?.id && (
          <Card id="book">
            <CardLabel>{booked ? "ביומן" : "רוצים לבחור זמן בעצמכם?"}</CardLabel>
            <BookCall leadId={lead.id} onBooked={setBooked} />
          </Card>
        )}

        {page.faq.length > 0 && (
          <Card>
            <CardLabel>מה שואלים אותי לפני השיחה</CardLabel>
            {page.faq.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 font-mono text-[11px] uppercase tracking-wide">
              <Link to="/guides/website-cost-guide-2026" className="underline underline-offset-4 text-dim hover:text-[#D1FE17]">מחירי בניית אתר ←</Link>
              <Link to="/guides/ai-video-cost-guide" className="underline underline-offset-4 text-dim hover:text-[#D1FE17]">מחירי סרטון AI ←</Link>
              <Link to="/faq" className="underline underline-offset-4 text-dim hover:text-[#D1FE17]">כל השאלות ←</Link>
            </div>
          </Card>
        )}

        {hasStory && (
          <Card>
            <CardLabel>לקוח מספר</CardLabel>
            {page.story_video.trim() && <VideoPlayer src={page.story_video.trim()} className="w-full aspect-video rounded-[10px] mb-5" />}
            {page.story_quote.trim() && (
              <figure>
                <div className="text-[#D1FE17] tracking-[0.2em] mb-2" aria-label="5 כוכבים">★★★★★</div>
                <blockquote className="font-display text-lg md:text-xl leading-snug">"{page.story_quote.trim()}"</blockquote>
                {page.story_name.trim() && (
                  <figcaption className="font-mono text-xs uppercase tracking-wide text-dim mt-3">
                    {page.story_name.trim()}
                    {page.story_role.trim() && <span> · {page.story_role.trim()}</span>}
                  </figcaption>
                )}
              </figure>
            )}
          </Card>
        )}

        <div className="pt-6 text-center">
          {canBook && !booked ? (
            <a
              href="#book"
              onClick={() => trackEvent("contact_click", { location: "thank_you_cta" })}
              className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-8 py-4 hover:scale-105 transition-transform"
            >
              בחירת זמן לשיחה ←
            </a>
          ) : (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent("whatsapp_click", { location: "thank_you_cta" })}
              className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-8 py-4 hover:scale-105 transition-transform"
            >
              {booked ? "רוצים להוסיף משהו? וואטסאפ ←" : "לא רוצים לחכות? וואטסאפ ←"}
            </a>
          )}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-6 font-mono text-[11px] uppercase tracking-wide">
            {canBook && !booked && (
              <a href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { location: "thank_you" })} className="underline underline-offset-4 hover:text-[#D1FE17]">
                או כתבו לי בוואטסאפ
              </a>
            )}
            <Link to="/work" className="underline underline-offset-4 text-dim hover:text-[#D1FE17]">עבודות שעשיתי</Link>
            <Link to="/" className="underline underline-offset-4 text-dim hover:text-[#D1FE17]">חזרה לדף הבית</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
