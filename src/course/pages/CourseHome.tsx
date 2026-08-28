import { useEffect } from "react"
import { useLesson, useLessons, useCourseAccess, useCourseConfig, useProgress } from "../hooks/useCourse"
import { formatPrice } from "../lib/config"
import { VideoEmbed } from "../components/VideoEmbed"
import { SyllabusList } from "../components/SyllabusList"
import { BtnLink, CheckIcon, CourseSection, Eyebrow } from "../components/ui"

const OUTCOMES = [
  { n: "01", h: "פרסומת מוצר", p: "מ־URL של מוצר ל־Marketing Studio, או קולנועי ב־Cinema Studio + Seedance." },
  { n: "02", h: "UGC בכמות", p: "דובר קבוע ב־Soul ID, ארבע וריאציות שמשנות משתנה אחד בכל פעם." },
  { n: "03", h: "סרט קצר / טריילר", p: "תסריט → shot list → הפקה שוט־שוט → הרכבה עם המשכיות אמיתית." },
  { n: "04", h: "פס ייצור", p: "Supercomputer ו־MCP מתוך Claude, batching, ותיקון תקלות שיטתי." },
]

const INCLUDES = [
  ["14 סרטוני הדגמת־מסך", " — 10–16 דק׳ כל אחד, ~3 שעות וידאו"],
  ["6 קבצי הורדה", " — צ׳יטשיט מבנה פרומפט, אוצר מילים למצלמה, צ׳קליסט עקביות, בוחר מודל, תבנית shot list, מחשבון קרדיטים"],
  ["פרויקט גמר מודרך", " עם צ׳קליסט הגשה עצמית"],
  ["עדכונים שוטפים", " — Higgsfield משחררת כמעט כל שבוע; החומר מתעדכן מהמקור הרשמי"],
  ["מומלץ מנוי Higgsfield פעיל", " בזמן הקורס — התרגילים בנויים לפרוטוטייפ זול"],
]

const FAQ = [
  ["כמה זמן לוקח לסיים?", "~3 שעות וידאו, ~4.5 שעות עם התרגילים. אפשר לסיים בסוף שבוע ולהתחיל ליישם. פרויקט הגמר לוקח עוד יומיים־שלושה של עבודה עצמאית."],
  ["צריך לשלם ל־Higgsfield בנפרד?", "כן. הקורס מלמד איך להשתמש ב־Higgsfield; הכלי עצמו הוא מנוי נפרד שלהם. התרגילים בנויים לפרוטוטייפ זול (720p בלי אודיו) כדי לחסוך קרדיטים."],
  ["Higgsfield משתנה כל הזמן — הקורס יתיישן?", "החומר מתעדכן מהמקור הרשמי של Higgsfield על בסיס שבועי. הליבה (מבנה פרומפט, עקביות, shot list) עמידה לשינויי גרסאות ממילא."],
  ["למי הקורס מתאים?", "מתחיל גמור עד בינוני. אם כבר יש לך רקע ב־AI video — אפשר לדלג על מודול 0 ולהתחיל מהיסודות של הפרומפט."],
  ["יש החזר?", "שיעור 1 חינם לפני שקונים — כדי שתדע בדיוק מה אתה מקבל. מדיניות ההחזר המלאה תופיע בדף התשלום."],
]

export function CourseHome() {
  const { lessons, loading: lessonsLoading } = useLessons()
  const { lesson: freeLesson } = useLesson("01-hanof")
  const { hasAccess } = useCourseAccess()
  const { config } = useCourseConfig()
  const { done } = useProgress()
  const price = formatPrice(config.price_agorot, config.currency)

  // Support deep links to #curriculum / #buy from the nav.
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash)
      el?.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  const totalLessons = lessons.length || 14

  return (
    <>
      {/* hero */}
      <CourseSection className="pt-10 md:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <Eyebrow>קורס דיגיטלי · עברית</Eyebrow>
            <h1 className="font-display text-[clamp(2rem,7vw,3.4rem)] font-black leading-[1.1] tracking-tight">
              להוציא סרטון AI אמיתי — לא הגרלה בכל לחיצה
            </h1>
            <p className="mt-4 max-w-md text-lg text-dim">
              מאפס עד פרסומת מוצר, קליפ קצר או UGC ב־Higgsfield. בלי צוות, בלי סטודיו, בלי ניסיון קודם.
            </p>
            <ul className="mt-6 grid gap-2.5">
              {[
                "לכתוב פרומפט שמחזיר את מה שדמיינת",
                "לשמור אותה דמות ואותו מקום לאורך עשרה שוטים",
                "לפרק תסריט ל־shot list ולחבר לסרט שנראה מכוון",
                "לבחור את הכלי והמודל הנכונים — במקום לנחש",
              ].map((t) => (
                <li key={t} className="flex max-w-md gap-2.5">
                  <CheckIcon />
                  <span className="text-foreground/90">{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <BtnLink to="/checkout" size="lg">
                קנה גישה · {price}
              </BtnLink>
              <BtnLink to="/lesson/01-hanof" variant="ghost" size="lg">
                צפה בשיעור החינם
              </BtnLink>
            </div>
            <p className="mt-4 font-mono text-xs text-dim">
              13 שיעורים + פרויקט גמר · ~3 שעות וידאו · גישה לכל החיים + עדכונים
            </p>
          </div>

          <div className="rounded border border-white/10 bg-white/[0.03]">
            <div className="p-3">
              <VideoEmbed url={freeLesson?.video_url ?? null} title="שיעור 1 · הנוף של Higgsfield" />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
              <div className="min-w-0">
                <strong className="block truncate font-semibold">שיעור 1 · הנוף של Higgsfield</strong>
                <span className="font-mono text-xs text-dim">Tools · Models · Presets · קרדיטים · זכויות</span>
              </div>
              <span className="flex-none rounded bg-[#D1FE17] px-2 py-1 font-mono text-[0.65rem] font-medium text-background">
                חינם · 10:00
              </span>
            </div>
          </div>
        </div>
      </CourseSection>

      {/* outcomes */}
      <CourseSection className="border-y border-white/10 bg-white/[0.02]">
        <Eyebrow>בסוף הקורס</Eyebrow>
        <h2 className="font-display text-2xl font-bold md:text-3xl">מה תדע לעשות בעצמך</h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {OUTCOMES.map((o) => (
            <div key={o.n} className="bg-background p-5">
              <div className="font-mono text-xs text-[#D1FE17]">{o.n}</div>
              <h3 className="mt-2 font-display text-base font-bold">{o.h}</h3>
              <p className="mt-1 text-xs leading-relaxed text-dim">{o.p}</p>
            </div>
          ))}
        </div>
      </CourseSection>

      {/* curriculum */}
      <CourseSection id="curriculum">
        <Eyebrow>תוכנית הקורס</Eyebrow>
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          {totalLessons - 1} שיעורים + פרויקט גמר
        </h2>
        <p className="mt-2 max-w-2xl text-dim">
          כל שיעור: סרטון הדגמת־מסך + דף טקסט (מה נאמר, תרגיל, קבצים להורדה). פרומפטים באנגלית.
        </p>
        {lessonsLoading ? (
          <p className="mt-8 font-mono text-xs uppercase tracking-wide text-dim">טוען…</p>
        ) : lessons.length === 0 ? (
          <p className="mt-8 text-sm text-dim">התוכן עוד לא נטען. חזרו בקרוב.</p>
        ) : (
          <SyllabusList lessons={lessons} done={done} hasAccess={hasAccess} />
        )}
      </CourseSection>

      {/* includes + price */}
      <CourseSection id="buy" className="border-y border-white/10 bg-white/[0.02]">
        <div className="grid items-start gap-10 md:grid-cols-[1.2fr_0.8fr] md:gap-14">
          <div>
            <Eyebrow>מה כלול</Eyebrow>
            <h2 className="font-display text-2xl font-bold md:text-3xl">קורס אחד, גישה לכל החיים</h2>
            <ul className="mt-6 grid gap-3.5">
              {INCLUDES.map(([b, rest]) => (
                <li key={b} className="flex gap-2.5">
                  <CheckIcon />
                  <span className="text-foreground/90">
                    <b className="font-bold text-foreground">{b}</b>
                    {rest}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded border border-white/20 bg-white/[0.03] p-6 md:sticky md:top-24">
            <div className="font-display text-4xl font-black leading-none">
              {price} <span className="font-mono text-base font-normal text-dim">חד־פעמי</span>
            </div>
            <p className="mt-2 text-xs text-dim">גישה לכל החיים · שיעור 1 חינם לפני שקונים</p>
            <BtnLink to="/checkout" size="lg" className="mt-5 w-full">
              רכוש גישה
            </BtnLink>
            <BtnLink to="/lesson/01-hanof" variant="ghost" size="lg" className="mt-2.5 w-full">
              התחל מהשיעור החינמי
            </BtnLink>
            <p className="mt-3 text-center font-mono text-[0.7rem] text-dim">
              התחברות עם אימייל · גישה נפתחת עם אישור התשלום
            </p>
          </div>
        </div>
      </CourseSection>

      {/* faq */}
      <CourseSection>
        <Eyebrow>שאלות נפוצות</Eyebrow>
        <h2 className="font-display text-2xl font-bold md:text-3xl">לפני שקונים</h2>
        <div className="mt-6">
          {FAQ.map(([q, a], i) => (
            <details key={q} className="border-b border-white/10 py-4" {...(i === 0 ? { open: true } : {})}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-bold [&::-webkit-details-marker]:hidden">
                {q}
                <span className="font-mono text-[#D1FE17]">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-dim">{a}</p>
            </details>
          ))}
        </div>
      </CourseSection>
    </>
  )
}
