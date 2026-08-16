import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useProjects } from "@/hooks/useProjects"

const HIGHLIGHTS = [
  { title: "בניית אתרים באמצעות AI", text: "אתר שלם, מרעיון לאתר חי, בשבריר מהזמן שזה לוקח בתהליך מסורתי.", video: "/videos/raz-showreel-7.mp4" },
  { title: "WordPress ו-Elementor", text: "כשגמישות ניהול תוכן היא הדרישה — הפלטפורמה הכי מוכחת בעולם, בעבודה מקצועית.", video: "/videos/raz-showreel-5.mp4" },
  { title: "דפי נחיתה ממוקדי המרה", text: "עמוד אחד, מסר אחד, קריאה לפעולה אחת — בנוי למכור.", video: "/videos/raz-showreel.mp4" },
  { title: "שדרוג אתרים קיימים", text: "לא תמיד צריך לבנות מאפס. שדרוג מדויק יכול לשנות הכל.", video: "/videos/raz-showreel-4.mp4" },
]

const PROCESS = [
  { n: "01", title: "בריף ואפיון", text: "מבינים מה העסק צריך, מי הקהל, ומה האתר צריך להשיג בפועל." },
  { n: "02", title: "קונספט עיצובי", text: "בונים כמה כיווני עיצוב ובודקים אותם מהר, לא בוחרים כיוון אחד ומקווים שהוא נכון." },
  { n: "03", title: "פיתוח", text: "כתיבת קוד תחת בקרה מקצועית — כל רכיב נבדק, לא רק מיוצר." },
  { n: "04", title: "השקה", text: "עלייה לאוויר, חיבור דומיין, ומעקב ראשוני אחרי שהאתר חי." },
]

function Cta({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <a
      href="https://madebyraz.co.il/contact"
      className={`inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-8 py-4 hover:scale-105 transition-transform ${className}`}
    >
      {children}
    </a>
  )
}

export function WebLanding() {
  useDocumentMeta(
    "בניית אתרים מקצועית עם AI ו-WordPress — RAZ",
    "אתר מקצועי לעסק שלכם — בנייה מותאמת אישית באמצעות AI או WordPress/Elementor. מהיר, מדויק, בנוי למכור."
  )
  const { projects } = useProjects()
  const featured = projects.slice(0, 3)

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-12 py-4 bg-background/40 backdrop-blur-xl border-b border-white/5">
        <a href="/" className="font-display font-bold text-xl tracking-tight">RAZ</a>
        <Cta>בואו נתחיל ←</Cta>
      </nav>

      <section className="relative min-h-[100dvh] overflow-hidden flex flex-col justify-center pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#141412] via-[#0b0b0b] to-black" />
          <AutoVideo src="/videos/raz-showreel-7.mp4" className="absolute inset-0 w-full h-full object-cover opacity-40 contrast-[1.05] brightness-[0.85]" />
        </div>
        <div className="px-5 md:px-12">
          <Reveal>
            <h1 className="font-display font-bold text-[clamp(34px,6vw,76px)] leading-[1.05] tracking-tight max-w-4xl">
              אתר שנראה כמו העסק שלכם באמת.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 max-w-xl text-dim text-lg md:text-xl leading-relaxed">
              בניית אתרים מקצועית באמצעות AI ו-WordPress — מהיר, מדויק, ובנוי כדי להביא לקוחות.
            </p>
          </Reveal>
          <Reveal delay={180} className="mt-10 flex flex-wrap items-center gap-6">
            <Cta>קבלו הצעת מחיר תוך יום ←</Cta>
            <a href="#work" className="font-mono text-xs uppercase tracking-wide text-dim hover:text-foreground transition-colors">
              לצפייה בעבודות ↓
            </a>
          </Reveal>
        </div>
      </section>

      {featured.length > 0 && (
        <section id="work" className="py-24 md:py-32 border-t border-white/10">
          <div className="container">
            <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-10">עבודות נבחרות</Reveal>
            <div className="grid md:grid-cols-3 gap-4">
              {featured.map((p, i) => (
                <Reveal key={p.slug} delay={i * 80} className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900 group">
                  {p.video && (
                    <AutoVideo src={p.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 right-4 left-4">
                    <div className="font-display font-medium text-lg text-white">{p.title}</div>
                    <div className="font-mono text-[11px] uppercase tracking-wide text-white/70">{p.category}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 md:py-32 border-t border-white/10">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-6">
            {HIGHLIGHTS.map((h, i) => (
              <Reveal key={h.title} delay={i * 60} className="border border-white/15 rounded-lg overflow-hidden">
                <div className="relative aspect-video bg-neutral-900">
                  <AutoVideo src={h.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]" />
                </div>
                <div className="p-6">
                  <div className="font-display font-medium text-xl mb-2">{h.title}</div>
                  <div className="text-dim text-sm leading-relaxed">{h.text}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 border-t border-white/10">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-10">תהליך העבודה</Reveal>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {PROCESS.map((s, i) => (
              <Reveal key={s.n} delay={i * 60}>
                <div className="font-mono text-xs text-dim mb-3">{s.n}</div>
                <div className="font-display font-medium text-lg mb-2">{s.title}</div>
                <p className="text-dim text-sm leading-relaxed">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-white/10 text-center">
        <div className="container">
          <Reveal>
            <h2 className="font-display font-bold text-[clamp(28px,4.6vw,52px)] leading-[1.15] tracking-tight max-w-xl mx-auto mb-8">
              בואו נבנה את האתר הבא שלכם.
            </h2>
          </Reveal>
          <Reveal delay={80}><Cta>להתחיל עכשיו ←</Cta></Reveal>
          <Reveal delay={140} className="mt-8">
            <a href="https://madebyraz.co.il" className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 text-dim">
              לכל העבודות והשירותים באתר הראשי ←
            </a>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center font-mono text-[11px] text-dim uppercase tracking-wide">
        © RAZ / Raz Avramov
      </footer>
      <WhatsAppButton />
    </div>
  )
}
