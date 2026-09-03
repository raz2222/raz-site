import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { Reveal } from "@/components/Reveal"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { AutoVideo } from "@/components/AutoVideo"
import {
  ASSETS,
  CHALLENGES,
  FILM,
  GALLERY,
  PREMISE,
  RESULTS,
  SCENES,
  SCRIPT,
  SOLUTIONS,
  THE_TRICK,
} from "@/lib/serveProject"

// The case study for the self-promo film. It is a hardcoded route rather than
// a `projects` row rendered by CaseStudyAI, because the shape that makes this
// piece worth reading — assets, framework, scene-by-scene — has no columns in
// that table, and flattening it into overview/challenges/solutions is exactly
// the thin version this page exists to replace.

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  )
}

function SectionRail({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string
  title: string
  lead?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-white/10 pt-12 md:pt-16">
      <Reveal className="font-mono text-xs uppercase tracking-wide text-[#D1FE17] mb-3">{eyebrow}</Reveal>
      <Reveal delay={60}>
        <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">{title}</h2>
      </Reveal>
      {lead && (
        <Reveal delay={100} className="mt-5 text-base md:text-lg leading-relaxed text-foreground/80 max-w-3xl">
          {lead}
        </Reveal>
      )}
      <div className="mt-10 md:mt-12">{children}</div>
    </section>
  )
}

export function CaseStudyServe() {
  useDocumentMeta(
    "Serve · סרט המותג של Made by RAZ | קייס סטאדי",
    "איך נבנה סרט מותג של 26 שניות בלי סט ובלי צוות: האסטים, שיטת הפרומפטים והסצנות, שוט אחרי שוט.",
    FILM.poster
  )
  useWhatsAppMessage('היי, ראיתי את הקייס סטאדי של "Serve" ורציתי סרט כזה לעסק שלי.')
  useHreflang(`/work/${FILM.slug}`, null)

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-36 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <AutoVideo
            src={FILM.video}
            poster={FILM.poster}
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-background/70 to-background" />
        </div>
        <div className="container">
          <Breadcrumbs
            items={[{ label: "בית", to: "/" }, { label: "עבודות נבחרות", to: "/work" }, { label: FILM.title }]}
          />
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4 flex flex-wrap items-center gap-3">
            <span>{FILM.number}</span>
            <span className="surface-raised rounded-full px-3 py-0.5">סרט מותג</span>
            <span className="surface-raised rounded-full px-3 py-0.5">הפקה עצמית</span>
          </Reveal>
          <Reveal>
            <h1 className="font-display font-black text-[clamp(38px,8.5vw,110px)] leading-[0.98] tracking-tight">
              {FILM.title}
            </h1>
          </Reveal>
          <Reveal delay={100} className="mt-5 font-mono text-xs uppercase tracking-wide text-dim">
            {FILM.category} · {FILM.year}
          </Reveal>
        </div>
      </section>

      {/* The film itself. 9:16, so it gets a phone-width player rather than the
          full-bleed 21:9 band the landscape case studies use. */}
      <Reveal delay={150} className="container">
        <div className="mx-auto w-full max-w-[380px]">
          <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-neutral-900">
            <video
              src={FILM.video}
              poster={FILM.poster}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-3 text-center font-mono text-[11px] uppercase tracking-wide text-dim">
            הסרט המלא · {FILM.duration} · לחצו להפעלה עם קול
          </div>
        </div>
      </Reveal>

      {/* Premise */}
      <Reveal delay={200} className="container mt-16 md:mt-24">
        <p className="text-2xl md:text-4xl font-display font-light leading-[1.35] max-w-4xl text-foreground/90">
          {PREMISE}
        </p>
      </Reveal>

      {/* Meta */}
      <Reveal delay={240} className="container mt-16 pt-10 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <MetaItem label="שנה">{FILM.year}</MetaItem>
          <MetaItem label="פורמט">{FILM.duration}</MetaItem>
          <MetaItem label="לקוח">{FILM.client}</MetaItem>
          <MetaItem label="הכלים והמודלים">
            <div className="flex flex-wrap gap-2">
              {FILM.tools.map((t) => (
                <span key={t} className="surface-raised rounded-full px-2.5 py-1 text-xs">
                  {t}
                </span>
              ))}
            </div>
          </MetaItem>
        </div>
      </Reveal>

      <div className="container flex flex-col gap-20 md:gap-28 py-20 md:py-28">
        {/* Before you start */}
        <SectionRail eyebrow="( לפני שמתחילים )" title="הדבר האחד ששווה לדעת">
          <Reveal className="surface-raised rounded-xl p-7 md:p-10 max-w-3xl">
            <p className="text-lg md:text-xl leading-relaxed text-foreground/90">{THE_TRICK}</p>
          </Reveal>
        </SectionRail>

        {/* Stage 1 — assets */}
        <SectionRail
          eyebrow="( שלב 1 )"
          title="האסטים"
          lead="הדמות, הכדור והלוקיישנים חוזרים כמעט בכל שוט. בונים אותם פעם אחת, נועלים אותם, ומשם הם מחזיקים את הרצף · מהמגרש בפריים הראשון ועד לאנדקארד."
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border-y border-white/10">
            {ASSETS.map((a, i) => (
              <Reveal key={a.ref} delay={i * 60} className="bg-background p-6 md:p-7 flex flex-col gap-4">
                {a.image && (
                  <div className="relative aspect-[4/3] -mx-6 -mt-6 md:-mx-7 md:-mt-7 mb-1 overflow-hidden bg-neutral-900">
                    <img
                      src={a.image}
                      alt={a.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-90"
                    />
                  </div>
                )}
                <div>
                  <div dir="ltr" className="font-mono text-sm font-bold text-[#D1FE17] text-right">
                    {a.ref}
                  </div>
                  <div className="font-display font-medium text-lg mt-1">{a.name}</div>
                </div>
                <p className="text-sm leading-relaxed text-foreground/75">{a.does}</p>
              </Reveal>
            ))}
          </div>
        </SectionRail>

        {/* Stage 2 — framework */}
        <SectionRail
          eyebrow="( שלב 2 )"
          title="שיטת הפרומפטים"
          lead="לא כותבים פרומפט לכל שוט מאפס. כותבים בלוק טכני אחד, מגדירים רשימת אלמנטים, וכל סצנה נכתבת מעליהם · זה מה שגורם לשישה עולמות זרים להיחתך כסרט אחד."
        >
          <div className="grid md:grid-cols-3 gap-px bg-white/10 border-y border-white/10">
            {[
              {
                n: "01",
                t: "כותרת סגנון אחת",
                d: "אותו בלוק של אופטיקה, גריידינג וגריין נפתח כל פרומפט בסרט. משנים אותו פעם אחת · הסרט כולו משתנה איתו.",
              },
              {
                n: "02",
                t: "שמות אלמנטים זהים",
                d: "השם שמופיע בפרומפט חייב להיות בדיוק השם שרשום ב-Elements. @ball בפרומפט ו-ball באלמנטים זה לא אותו דבר, והמודל פשוט יתעלם.",
              },
              {
                n: "03",
                t: "פרומפט אחד לסצנה",
                d: "לא שוט-שוט. סצנה שלמה בפרומפט אחד, השוטים ממוספרים לפי הסדר, אותה רמת פירוט בכל אחד · כך הרצף שומר על היגיון מרחבי.",
              },
            ].map((x, i) => (
              <Reveal key={x.n} delay={i * 70} className="bg-background p-7 md:p-8">
                <div className="font-mono text-xs text-dim mb-4">{x.n}</div>
                <div className="font-display font-medium text-lg mb-2">{x.t}</div>
                <p className="text-sm leading-relaxed text-foreground/75">{x.d}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="mt-10">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">רשימת האלמנטים של הסרט</div>
            <div className="flex flex-wrap gap-2">
              {ASSETS.map((a) => (
                <span key={a.ref} dir="ltr" className="surface-raised rounded-full px-3.5 py-1.5 font-mono text-xs">
                  {a.ref}
                </span>
              ))}
            </div>
          </Reveal>
        </SectionRail>

        {/* Stage 3 — scenes */}
        <SectionRail
          eyebrow="( שלב 3 )"
          title="הסצנות"
          lead="ארבע סצנות, שלוש עשרה שוטים, עשרים ושש שניות. כל סצנה נוצרה כפרומפט אחד שלם ולא כאוסף של קליפים שהודבקו אחר כך."
        >
          <div className="flex flex-col gap-px bg-white/10 border-y border-white/10">
            {SCENES.map((s, i) => (
              <Reveal key={s.n} delay={i * 60} className="bg-background p-7 md:p-10">
                <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-12">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-wide text-[#D1FE17] mb-2">{s.n}</div>
                    <div className="font-display font-bold text-2xl md:text-3xl">{s.title}</div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {s.assets.map((a) => (
                        <span key={a} dir="ltr" className="surface-raised rounded-full px-2.5 py-1 font-mono text-[11px]">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-base leading-relaxed text-foreground/85">{s.does}</p>
                    <ol className="mt-7 flex flex-col gap-4 border-r-2 border-white/10 pr-5">
                      {s.shots.map((shot) => (
                        <li key={shot.time} className="flex flex-col gap-1">
                          <div className="flex items-baseline gap-3">
                            <span className="font-mono text-[11px] text-[#D1FE17] tabular-nums">{shot.time}</span>
                            <span className="font-display font-medium text-base">{shot.title}</span>
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/70">{shot.description}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </SectionRail>

        {/* Script */}
        <SectionRail
          eyebrow="( הקופי )"
          title="מה כתוב על המסך"
          lead="הסרט רץ מושתק ברוב המקרים, אז כל הטיעון נמצא בכתוביות. שמונה שורות, ואף אחת מהן לא מסבירה את התמונה שמעליה."
        >
          <div className="max-w-2xl flex flex-col gap-px bg-white/10 border-y border-white/10">
            {SCRIPT.map((line, i) => (
              <Reveal key={line.time} delay={i * 40} className="bg-background flex items-baseline gap-5 px-5 py-4">
                <span className="font-mono text-[11px] text-dim tabular-nums shrink-0">{line.time}</span>
                <span className="font-display text-lg md:text-xl leading-snug">{line.he}</span>
              </Reveal>
            ))}
          </div>
        </SectionRail>

        {/* Challenges */}
        <SectionRail eyebrow="( אתגרים )" title="מה היה קשה">
          <div className="flex flex-col gap-8 max-w-3xl">
            {CHALLENGES.map((c, i) => (
              <Reveal key={c.title} delay={i * 60}>
                <div className="font-display font-medium text-xl mb-2">{c.title}</div>
                <p className="text-base leading-relaxed text-foreground/80">{c.description}</p>
              </Reveal>
            ))}
          </div>
        </SectionRail>

        {/* Solutions */}
        <SectionRail eyebrow="( פתרונות )" title="איך זה נפתר">
          <div className="grid md:grid-cols-2 gap-px bg-white/10 border-y border-white/10">
            {SOLUTIONS.map((s, i) => (
              <Reveal key={s.title} delay={i * 60} className="bg-background p-7 md:p-8">
                <div className="font-display font-medium text-xl mb-3">{s.title}</div>
                <p className="text-base leading-relaxed text-foreground/80">{s.description}</p>
              </Reveal>
            ))}
          </div>
        </SectionRail>

        {/* Results */}
        <SectionRail eyebrow="( תוצאות )" title="מה יצא מזה">
          <ul className="flex flex-col gap-5 max-w-3xl">
            {RESULTS.map((r, i) => (
              <Reveal
                key={r}
                as="li"
                delay={i * 60}
                className="flex gap-3 text-lg md:text-xl leading-relaxed font-display font-light text-foreground/90"
              >
                <span className="text-[#D1FE17] shrink-0">•</span>
                <span>{r}</span>
              </Reveal>
            ))}
          </ul>
        </SectionRail>
      </div>

      {/* Gallery */}
      <section className="py-16 border-t border-white/10">
        <div className="container">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-8">פריים אחרי פריים</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GALLERY.map((item, i) => (
              <Reveal
                key={item.url}
                delay={i * 40}
                className="relative aspect-[9/16] rounded-lg overflow-hidden bg-neutral-900"
              >
                <img
                  src={item.url}
                  alt={item.caption}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 to-transparent p-3 pointer-events-none">
                  <p className="font-mono text-[10px] text-white/85">{item.caption}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden section-divider py-20 md:py-28 text-center">
        <AutoVideo
          src={FILM.video}
          poster={FILM.poster}
          className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="container relative">
          <Reveal>
            <p className="font-display text-2xl md:text-3xl font-light mb-8 max-w-xl mx-auto">
              יש לכם מוצר. יש לי רעיונות. בואו ניצור משהו שאי אפשר לגלול ממנו.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <Link
              to="/services/ai-content"
              className="inline-block font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-7 py-3.5 hover:scale-105 transition-transform"
            >
              לשירותי תוכן AI ←
            </Link>
          </Reveal>
        </div>
      </section>

      <Link to="/work" className="group relative block overflow-hidden section-divider py-16 md:py-24">
        <div className="container relative">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">כל העבודות</div>
          <div className="font-display font-bold text-3xl md:text-5xl text-gradient-accent">← עבודות נבחרות</div>
        </div>
      </Link>
    </>
  )
}
