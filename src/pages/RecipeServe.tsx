import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"
import { CopyBlock } from "@/components/CopyBlock"
import { RecipeGate, useRecipeGate } from "@/components/RecipeGate"
import { CookieConsent } from "@/components/CookieConsent"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { Wordmark } from "@/components/icons/Wordmark"
import {
  ASSETS,
  FILM,
  SCENES,
  SCRIPT,
  THE_CUT,
  THE_TRICK,
  UNUSED_WORLDS,
  VO_LINE,
} from "@/lib/serveProject"

// Unlisted on purpose. Raz hands this link out on Instagram; it is not in the
// nav, not in the sitemap, not prerendered and not linked from any other page,
// and it carries robots=noindex. The only way in is the link itself.
//
// It renders outside PublicLayout so a follower who lands here gets the guide
// and not the whole site's chrome — same treatment as /gift.

const TOOLS: { name: string; what: string }[] = [
  { name: "Higgsfield", what: "הבית של הכל · Elements, Cinema Studio וההרצות עצמן." },
  { name: "GPT Image 2", what: "קומפוזיציית המאסטר. הכי טוב בלציית להוראות מסגור מספריות." },
  { name: "Seedance 2.5", what: "רוב השוטים · ההגשה, הבריחה מהמסך, הראש ושולחן הפרומפטים." },
  { name: "Seedance 2.0", what: "השוט הארוך של Let's Talk, שבו האותיות נבנות על הקיר." },
]

function Stage({
  n,
  title,
  lead,
  children,
}: {
  n: string
  title: string
  lead?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-white/10 pt-12 md:pt-16">
      <Reveal className="font-mono text-xs uppercase tracking-wide text-[#D1FE17] mb-3">{n}</Reveal>
      <Reveal delay={60}>
        <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">{title}</h2>
      </Reveal>
      {lead && (
        <Reveal delay={100} className="mt-5 text-base md:text-lg leading-relaxed text-foreground/80 max-w-3xl">
          {lead}
        </Reveal>
      )}
      <div className="mt-10">{children}</div>
    </section>
  )
}

export function RecipeServe({ gated = false }: { gated?: boolean }) {
  const { unlocked, unlock } = useRecipeGate(FILM.slug, gated)

  useDocumentMeta(
    "איך בניתי את Serve",
    "איך נבנה הסרט Serve: השיטה, הסצנות שוט אחרי שוט, שני פרומפטים מלאים להעתקה והקופי המלא.",
    FILM.poster,
    undefined,
    { noindex: true }
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header — no site nav. Whoever is here came from one link. */}
      <header className="border-b border-white/10">
        <div className="container flex items-center justify-between py-5">
          <Link to="/" aria-label="Made by RAZ">
            <Wordmark className="h-4 w-auto text-foreground" />
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-wide text-dim">
            {gated ? "מדריך" : "מדריך · לא מפורסם"}
          </span>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="container pt-16 pb-12 md:pt-24">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            ( מתנה לעוקבים )
          </Reveal>
          <Reveal delay={60}>
            <h1 className="font-display font-black text-[clamp(34px,7vw,84px)] leading-[1.02] tracking-tight">
              איך בניתי את <span className="text-gradient-accent">Serve</span>
            </h1>
          </Reveal>
          <Reveal delay={110} className="mt-6 text-lg md:text-xl leading-relaxed text-foreground/80 max-w-2xl">
            סרט מותג של 26 שניות, בלי סט ובלי צוות. פירקתי אותו לשלבים · השיטה שמחזיקה
            אותו, מה קורה בכל שוט, ושני פרומפטים מלאים כמו שהם, להעתקה ולשימוש.
          </Reveal>
          <Reveal delay={150} className="mt-8 flex flex-wrap gap-2">
            {FILM.tools.map((t) => (
              <span key={t} className="surface-raised rounded-full px-3.5 py-1.5 font-mono text-xs">
                {t}
              </span>
            ))}
          </Reveal>
        </section>

        {/* The film */}
        <section className="container pb-16">
          <Reveal className="mx-auto w-full max-w-[360px]">
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
            <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-wide text-dim">
              זה מה שבונים · {FILM.duration}
            </p>
          </Reveal>
        </section>

        {!unlocked && (
          <RecipeGate
            slug={FILM.slug}
            title={`איך בניתי את ${FILM.title}`}
            bullets={[
              "השיטה שמחזיקה דמות אחת זהה בשישה עולמות שונים",
              "פירוק מלא של הסרט, שוט אחרי שוט עם טיימקודים",
              "שני פרומפטים מלאים כמו שרצו, להעתקה ולשימוש",
              "הקופי המלא של הסרט והשורה המדוברת",
            ]}
            onUnlock={unlock}
          />
        )}

        {unlocked && (
        <div className="container flex flex-col gap-20 md:gap-24 pb-24">
          {/* Before you start */}
          <Stage n="( לפני שמתחילים )" title="הכלים, ושני הדברים ששווים לדעת">
            <div className="grid md:grid-cols-2 gap-px bg-white/10 border-y border-white/10">
              {TOOLS.map((t, i) => (
                <Reveal key={t.name} delay={i * 50} className="bg-background p-6 md:p-7">
                  <div dir="ltr" className="font-mono text-sm font-bold text-[#D1FE17] text-right mb-2">
                    {t.name}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/75">{t.what}</p>
                </Reveal>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-5 mt-8">
              <Reveal delay={120} className="surface-raised rounded-xl p-7 md:p-8">
                <div className="font-mono text-[11px] uppercase tracking-wide text-[#D1FE17] mb-3">
                  הטריק בהפקה
                </div>
                <p className="text-base leading-relaxed text-foreground/90">{THE_TRICK}</p>
              </Reveal>
              <Reveal delay={160} className="surface-raised rounded-xl p-7 md:p-8">
                <div className="font-mono text-[11px] uppercase tracking-wide text-[#D1FE17] mb-3">
                  הטריק בעריכה
                </div>
                <p className="text-base leading-relaxed text-foreground/90">{THE_CUT}</p>
              </Reveal>
            </div>
          </Stage>

          {/* Stage 1 */}
          <Stage
            n="( שלב 1 )"
            title="בונים את האסטים"
            lead="לפני שנוגעים בווידאו · מייצרים את כל מה שחוזר יותר מפעם אחת ונועלים אותו. את הדמות מוסיפים ב-Higgsfield תחת Elements בשם @Me, וזה חייב להיות בדיוק אותו שם שמופיע בפרומפטים למטה."
          >
            <div className="flex flex-col gap-px bg-white/10 border-y border-white/10">
              {ASSETS.map((a, i) => (
                <Reveal key={a.ref} delay={i * 50} className="bg-background p-6 md:p-7">
                  <div className="grid md:grid-cols-[160px_1fr] gap-4 md:gap-10 items-start">
                    <div>
                      <div dir="ltr" className="font-mono text-sm font-bold text-[#D1FE17] text-right">
                        {a.ref}
                      </div>
                      <div className="font-display font-medium text-base mt-1 text-dim">{a.name}</div>
                    </div>
                    <p className="text-sm md:text-base leading-relaxed text-foreground/80">{a.does}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Stage>

          {/* Stage 2 */}
          <Stage
            n="( שלב 2 )"
            title="קומפוזיציית המאסטר"
            lead="זה השלב שאי אפשר לדלג עליו, וזה גם השלב שרוב האנשים מדלגים עליו. הם מייצרים כל שוט מאפס ומקווים שהדמות תישאר אותה דמות. היא לא."
          >
            <div className="grid md:grid-cols-3 gap-px bg-white/10 border-y border-white/10">
              {[
                {
                  n: "01",
                  t: "תמונה אחת שהיא המאסטר",
                  d: "לפני כל וידאו · מייצרים סטיל אחד של הדמות בעמדת העבודה, ומצהירים בתוך הפרומפט עצמו שהקומפוזיציה הזו תשוכפל לכל סביבה שתבוא אחריה. זה משנה מה המודל שומר.",
                },
                {
                  n: "02",
                  t: "מסגור במספרים",
                  d: "«ווייד שוט יפה» זה לא הוראה, זה משאלה. מקבעים באחוזי פריים איפה יושבת הדמות ואיפה הראש, כמה מהפריים תופסת העמדה, ומאיזה מרחק וגובה מצלמים. מספר אפשר לשחזר.",
                },
                {
                  n: "03",
                  t: "לאסור, לא רק לבקש",
                  d: "רוב הפרומפט הוא מה אסור: ששום דבר לא יחצה את הדמות, שכל רגל שולחן וכל נעל ייגעו בקרקע, שהעמדה לא תרחף. בלי זה כל סביבה חדשה מזיזה משהו.",
                },
              ].map((x, i) => (
                <Reveal key={x.n} delay={i * 70} className="bg-background p-6 md:p-7">
                  <div className="font-mono text-xs text-dim mb-4">{x.n}</div>
                  <div className="font-display font-medium text-lg mb-2">{x.t}</div>
                  <p className="text-sm leading-relaxed text-foreground/75">{x.d}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={80} className="mt-8 surface-raised rounded-xl p-6 md:p-7">
              <div className="font-mono text-[11px] uppercase tracking-wide text-[#D1FE17] mb-3">
                מה מחליפים כדי לקבל עולם חדש
              </div>
              <p className="text-sm md:text-base leading-relaxed text-foreground/80">
                רק את תיאור הסביבה. כל השאר · המסגור, הוורדרוב, הפוזה, האיסורים · נשאר מילה
                במילה. אצלי אותה עמדת עבודה כבר רצה ב:
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {UNUSED_WORLDS.map((w) => (
                  <li key={w} className="flex gap-2.5 text-sm leading-relaxed text-foreground/75">
                    <span className="text-[#D1FE17] shrink-0">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </Stage>

          {/* Stage 3 */}
          <Stage
            n="( שלב 3 )"
            title="הסצנות"
            lead="סצנה אחת בפרומפט אחד, לא שוט-שוט. שתיים מהן כאן במלואן, מילה במילה כמו שרצו · מריצים ב-Cinema Studio אחרי ש-@Me כבר יושב ב-Elements. על השאר כתבתי את העיקרון שגורם להן לעבוד."
          >
            <div className="flex flex-col gap-14">
              {SCENES.map((s, i) => (
                <Reveal key={s.n} delay={i * 40}>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-3">
                    <span className="font-mono text-xs uppercase tracking-wide text-[#D1FE17]">{s.n}</span>
                    <h3 className="font-display font-bold text-2xl md:text-3xl">{s.title}</h3>
                  </div>
                  <p className="text-base leading-relaxed text-foreground/80 max-w-3xl mb-4">{s.does}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    <span className="rounded-full px-2.5 py-1 font-mono text-[11px] bg-accent-ghost text-[#D1FE17]">
                      {s.model}
                    </span>
                    {s.assets.map((a) => (
                      <span
                        key={a}
                        dir="ltr"
                        className="surface-raised rounded-full px-2.5 py-1 font-mono text-[11px]"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                  {s.prompt ? (
                    <CopyBlock label={`${s.n} · ${s.title}`} text={s.prompt} />
                  ) : (
                    <div className="surface-raised rounded-lg p-6">
                      {s.hint && (
                        <div className="font-mono text-[11px] uppercase tracking-wide text-[#D1FE17] mb-3">
                          העיקרון
                        </div>
                      )}
                      <p className="text-sm md:text-base leading-relaxed text-foreground/80">
                        {s.hint ?? s.note}
                      </p>
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
          </Stage>

          {/* Stage 4 */}
          <Stage
            n="( שלב 4 )"
            title="הקופי"
            lead="הסרט רץ מושתק, אז הכתוביות נושאות את כל הטיעון. שימו לב שאף שורה לא מתארת את התמונה שמעליה · היא ממשיכה אותה. אם השורה מסבירה את הפריים, מחקו אחת מהן."
          >
            <div className="max-w-2xl flex flex-col gap-px bg-white/10 border-y border-white/10">
              {SCRIPT.map((line, i) => (
                <Reveal key={line.time} delay={i * 40} className="bg-background flex items-baseline gap-5 px-5 py-4">
                  <span className="font-mono text-[11px] text-dim tabular-nums shrink-0">{line.time}</span>
                  <span className="font-display text-lg leading-snug">{line.he}</span>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120} className="mt-6">
              <CopyBlock label="הקופי המלא" text={SCRIPT.map((l) => l.he).join("\n")} />
            </Reveal>

            <Reveal delay={160} className="mt-8 surface-raised rounded-xl p-6 md:p-7">
              <div className="font-mono text-[11px] uppercase tracking-wide text-[#D1FE17] mb-3">
                והשורה המדוברת
              </div>
              <p className="font-display text-lg leading-snug">{VO_LINE}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                היא לא זהה לכתובית הראשונה · הכתובית נוסחה מחדש כדי לעבוד מושתקת. את השורה המדוברת
                כותבים בתוך הפרומפט של שוט הראש כהוראת ליפ-סינק, ולא מוסיפים אותה בעריכה.
              </p>
            </Reveal>
          </Stage>

          {/* Close */}
          <section className="border-t border-white/10 pt-14 text-center">
            <Reveal>
              <p className="font-display text-2xl md:text-3xl font-light leading-snug max-w-xl mx-auto">
                בניתם משהו עם זה? שלחו לי · אני באמת מסתכל.
              </p>
            </Reveal>
            <Reveal delay={80} className="mt-8 flex flex-wrap gap-3 justify-center">
              <a
                href="https://www.instagram.com/madebyraz.co.il/"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm font-bold uppercase tracking-wide surface-raised rounded-[8px] px-6 py-3 hover:text-[#D1FE17] transition-colors"
              >
                Instagram
              </a>
              <Link
                to={`/work/${FILM.slug}`}
                className="font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
              >
                הקייס סטאדי המלא ←
              </Link>
            </Reveal>
          </section>
        </div>
        )}
      </main>

      <footer className="border-t border-white/10">
        <div className="container py-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="font-mono text-[11px] uppercase tracking-wide text-dim hover:text-foreground transition-colors">
            madebyraz.co.il ←
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-wide text-dim">© Made by RAZ</span>
        </div>
      </footer>

      <WhatsAppButton />
      <CookieConsent />
    </div>
  )
}
