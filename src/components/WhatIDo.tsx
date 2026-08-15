import { Link } from "react-router-dom"
import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"

const PILLARS = [
  {
    n: "01",
    title: "חוויות דיגיטליות",
    tagline: "אתרים שלא מרגישים כמו תבנית.",
    video: "/videos/raz-showreel-7.mp4",
    items: [
      "עיצוב אתרים",
      "פיתוח קריאייטיב",
      "אתרים אינטראקטיביים",
      "איקומרס",
      "דפי נחיתה",
      "פיתוח WordPress",
      "פיתוח מותאם אישית",
      "פונקציונליות מבוססת AI",
    ],
    href: "/services",
    cta: "לצפייה בפרויקטי אתרים ←",
    ctaHref: "/work",
  },
  {
    n: "02",
    title: "ויז'ואל ותוכן AI",
    tagline: "רעיונות ויזואליים בלי מגבלות הפקה מסורתיות.",
    video: "/videos/raz-showreel-2.mp4",
    items: [
      "פרסומות AI",
      "סרטוני מוצר",
      "ויז'ואלים לקמפיינים",
      "תוכן לרשתות חברתיות",
      "צילום AI",
      "בימוי קריאייטיבי",
      "פיתוח קונספט",
    ],
    href: "/services",
    cta: "לצפייה בפרויקטי ויז'ואל ←",
    ctaHref: "/work",
  },
]

export function WhatIDo() {
  return (
    <section id="services" className="py-28 md:py-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( מה אני עושה )
        </Reveal>
        <Reveal delay={60}>
          <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight">
            שתי אומנויות. עין אחת.
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-16 mt-16">
          {PILLARS.map((p, i) => (
            <Reveal key={p.n} delay={i * 120}>
              <div className="relative aspect-video rounded-sm overflow-hidden bg-neutral-900 mb-6">
                <AutoVideo
                  src={p.video}
                  className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]"
                />
              </div>
              <div className="font-mono text-xs text-dim mb-3">{p.n}</div>
              <h3 className="font-display font-medium text-2xl md:text-3xl mb-3">{p.title}</h3>
              <p className="text-dim mb-8">{p.tagline}</p>
              <div className="flex flex-col">
                {p.items.map((item) => (
                  <Link
                    key={item}
                    to={p.href}
                    className="group flex items-center gap-3 py-4 px-3 -mx-3 border-b border-white/10 text-[15px] transition-colors hover:bg-[#D1FE17] hover:text-black hover:border-b-transparent"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current flex-none" />
                    {item}
                  </Link>
                ))}
              </div>
              <Link to={p.ctaHref} className="inline-block mt-8 font-mono text-xs uppercase tracking-wide underline underline-offset-4">
                {p.cta}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
