import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useFaqGroups } from "@/hooks/useContent"
import { useSiteContent } from "@/hooks/useSiteContent"
import { CONTACT_INFO_DEFAULT, TESTIMONIALS_DEFAULT } from "@/lib/siteContentDefaults"
import { trackEvent } from "@/lib/analytics"

// The moment after the form is the one where a lead is paying the most
// attention, so the page says what happens next and by when, offers a way to
// skip the wait, and answers what people ask before the first call. Every
// answer here comes from content that already exists (the FAQ, the
// testimonials), so it is edited where it always was.
const STEPS = [
  { title: "אני עובר על מה ששלחתם", body: "כדי שכשנדבר, כבר אדע על מה." },
  { title: "חוזר אליכם עד סוף יום העסקים הבא", body: "בטלפון או בוואטסאפ, לפי מה שהשארתם." },
  { title: "שיחה קצרה ואז הצעת מחיר", body: "מבינים מה צריך, ומקבלים הצעה מסודרת עם היקף, לוח זמנים ומחיר." },
]

export function ThankYou() {
  useDocumentMeta("תודה · RAZ", "קיבלתי את הפרטים, אחזור אליכם עד סוף יום העסקים הבא.")
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)
  const { content: testimonials } = useSiteContent("home_testimonials", TESTIMONIALS_DEFAULT)
  const { faqGroups } = useFaqGroups()

  // One question per group: how long a site takes, and how an AI video works.
  const questions = faqGroups.map((g) => g.items[0]).filter(Boolean)
  const story = testimonials.items[0]
  const whatsappHref = `${contact.whatsapp_url}?text=${encodeURIComponent("היי רז, השארתי עכשיו פרטים באתר.")}`

  return (
    <section className="pt-32 pb-24 md:pt-40">
      <div className="container max-w-2xl">
        <h1 className="font-display font-black text-3xl md:text-5xl leading-tight mb-4">
          קיבלתי. אחזור אליכם עד סוף יום העסקים הבא.
        </h1>
        <p className="text-dim text-lg mb-12">ככה זה ממשיך מכאן:</p>

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
          <div className="font-display text-lg font-medium mb-1">לא בא לכם לחכות?</div>
          <p className="text-dim mb-5">כתבו לי בוואטסאפ ונתחיל משם.</p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("whatsapp_click", { location: "thank_you" })}
            className="inline-block font-mono text-[11px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform"
          >
            לוואטסאפ ←
          </a>
        </div>

        {questions.length > 0 && (
          <div className="mb-14">
            <h2 className="font-display font-bold text-2xl mb-6">מה שואלים אותי לפני השיחה</h2>
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.q}>
                  <div className="font-display text-lg font-medium mb-1">{q.q}</div>
                  <p className="text-dim leading-relaxed">{q.a}</p>
                </div>
              ))}
            </div>
            <Link to="/faq" className="inline-block mt-6 font-mono text-[11px] uppercase tracking-wide underline underline-offset-4 text-dim hover:text-[#D1FE17]">
              לכל השאלות ←
            </Link>
          </div>
        )}

        {story && (
          <figure className="mb-14 border-r-2 border-[#D1FE17] pr-5">
            <blockquote className="font-display text-xl leading-snug mb-3">"{story.quote}"</blockquote>
            <figcaption className="font-mono text-xs uppercase tracking-wide text-dim">
              {story.name}
              {story.role && <span> · {story.role}</span>}
            </figcaption>
          </figure>
        )}

        <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-wide">
          <Link to="/work" className="underline underline-offset-4 hover:text-[#D1FE17]">בינתיים, עבודות שעשיתי ←</Link>
          <Link to="/" className="text-dim underline underline-offset-4 hover:text-[#D1FE17]">חזרה לדף הבית</Link>
        </div>
      </div>
    </section>
  )
}
