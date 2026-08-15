import { Reveal } from "./Reveal"

export function Positioning() {
  return (
    <section className="py-28 md:py-40">
      <div className="container grid md:grid-cols-[1.2fr_1fr] gap-14 items-center">
        <div>
          <Reveal>
            <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.2] tracking-tight max-w-3xl">
              להיות טובים זה לא מספיק
              <br />
              אם אתם נראים כמו כולם.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-8 max-w-xl text-dim text-base md:text-lg leading-relaxed">
              עסקים יכולים להיות מצוינים ועדיין להיראות בינוניים בדיגיטל. אני מחבר עיצוב, פיתוח
              ו-AI כדי להפוך רעיונות לחוויות דיגיטליות שאנשים באמת זוכרים.
            </p>
          </Reveal>
        </div>
        <Reveal delay={180} className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900">
          <video
            src="/videos/raz-showreel-5.mp4"
            muted
            loop
            playsInline
            autoPlay
            className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]"
          />
        </Reveal>
      </div>
    </section>
  )
}
