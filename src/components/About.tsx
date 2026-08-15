import { Reveal } from "./Reveal"

const CAPABILITIES = ["עיצוב", "פיתוח", "WordPress", "React / Next.js", "Creative Coding", "הפקה ויזואלית AI", "אוטומציה"]
const TOOLS = ["Claude", "ChatGPT", "Figma", "WordPress", "React", "Next.js", "GSAP", "Higgsfield", "Kling", "Veo"]

export function About() {
  return (
    <section id="about" className="py-28 md:py-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6">
          ( עליי )
        </Reveal>
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-14 items-start">
          <Reveal>
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-black flex items-center justify-center">
              <span className="font-display font-bold text-[clamp(80px,14vw,180px)] text-white/10 select-none">
                R
              </span>
              <div className="absolute bottom-4 right-4 font-mono text-[10px] uppercase tracking-wide text-dim">
                התמונה בקרוב
              </div>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight mb-6">
                אני רז.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-dim text-base md:text-lg leading-relaxed mb-4">
                אני מפתח קריאייטיב שעובד בצומת שבין עיצוב, טכנולוגיה ו-AI.
              </p>
              <p className="text-dim text-base md:text-lg leading-relaxed mb-10">
                אני מעצב ובונה חוויות דיגיטליות, אתרים ותוכן ויזואלי למותגים שרוצים להיראות
                אחרת, לתקשר טוב יותר וליצור השפעה.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">יכולות</div>
              <div className="flex flex-wrap gap-2 mb-10">
                {CAPABILITIES.map((c) => (
                  <span key={c} className="border border-white/15 rounded-full px-4 py-1.5 text-sm">
                    {c}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="font-mono text-[11px] uppercase tracking-wide text-dim">
                {TOOLS.join(" · ")}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
