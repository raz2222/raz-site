import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"

const CAPABILITIES = ["עיצוב", "פיתוח", "WordPress", "React / Next.js", "Creative Coding", "הפקה ויזואלית AI", "אוטומציה"]
const TOOLS = ["Claude", "ChatGPT", "Figma", "WordPress", "React", "Next.js", "GSAP", "Higgsfield", "Kling", "Veo"]

export function About() {
  useDocumentMeta(
    "עליי — RAZ",
    "רז אברמוב — מפתח קריאייטיב שעובד בצומת שבין עיצוב, טכנולוגיה ו-AI."
  )

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6">
          ( עליי )
        </Reveal>

        <div className="grid md:grid-cols-[1fr_1.2fr] gap-14 items-start mb-24">
          <Reveal>
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900">
              <img
                src="/images/raz-portrait.jpeg"
                alt="רז אברמוב"
                className="absolute inset-0 w-full h-full object-cover grayscale"
              />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <h1 className="font-display font-bold text-[clamp(30px,5.4vw,64px)] leading-[1.1] tracking-tight mb-8">
                היי, אני רז.
              </h1>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-dim text-base md:text-lg leading-relaxed mb-4">
                התחלתי בפיתוח — קוד, לוגיקה, בניית דברים שעובדים. עם הזמן עיצוב נכנס לתמונה,
                כי אתר טוב הוא לא רק קוד נכון, הוא גם החלטה איך דבר צריך להרגיש.
              </p>
              <p className="text-dim text-base md:text-lg leading-relaxed">
                ה-AI שינה את הדרך שבה אני עובד לא כי הוא מחליף מיומנות, אלא כי הוא מקצר את
                המרחק בין רעיון לתוצר — מה שפעם דרש צוות ויום צילום, היום אפשר להפיק לבד,
                באותה רמת גימור.
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal className="max-w-2xl mb-24">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">פילוסופיה</div>
          <p className="text-xl md:text-2xl font-display font-light leading-snug">
            הכלי לא חשוב. התוצאה כן. פרויקט שצריך WordPress מקבל WordPress. פרויקט שצריך
            Next.js מקבל Next.js. אם AI יכול לקצר הפקה בלי לפגוע באיכות — הוא נכנס לתמונה.
            אני לא מוכר כלי, אני בוחר את הכלי שמתאים לתוצאה.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-14">
          <Reveal>
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">יכולות</div>
            <div className="flex flex-wrap gap-2">
              {CAPABILITIES.map((c) => (
                <span key={c} className="border border-white/15 rounded-full px-4 py-1.5 text-sm">
                  {c}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">כלים</div>
            <div className="font-mono text-[13px] text-dim leading-relaxed">
              {TOOLS.join(" · ")}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
