import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"

const HIGHLIGHTS = [
  { title: "בניית אתרים באמצעות AI", text: "אתר שלם, מרעיון לאתר חי, בשבריר מהזמן שזה לוקח בתהליך מסורתי." },
  { title: "WordPress ו-Elementor", text: "כשגמישות ניהול תוכן היא הדרישה — הפלטפורמה הכי מוכחת בעולם, בעבודה מקצועית." },
  { title: "דפי נחיתה ממוקדי המרה", text: "עמוד אחד, מסר אחד, קריאה לפעולה אחת — בנוי למכור." },
  { title: "שדרוג אתרים קיימים", text: "לא תמיד צריך לבנות מאפס. שדרוג מדויק יכול לשנות הכל." },
]

const PROOF = ["מהירות אתר נמדדת, לא מובטחת", "קוד אמיתי, לא בונה-אתרים סגור", "עבודה תחת בקרה מקצועית מלאה"]

function Cta({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="https://madebyraz.co.il/contact"
      className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-8 py-4 hover:scale-105 transition-transform"
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

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-12 py-4 bg-background/40 backdrop-blur-xl border-b border-white/5">
        <a href="/" className="font-display font-bold text-xl tracking-tight">RAZ</a>
        <Cta>בואו נתחיל ←</Cta>
      </nav>

      <section className="relative h-[100dvh] min-h-[600px] overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#141412] via-[#0b0b0b] to-black" />
          <AutoVideo src="/videos/raz-showreel-7.mp4" className="absolute inset-0 w-full h-full object-cover opacity-40 contrast-[1.05] brightness-[0.85]" />
        </div>
        <div className="flex-1 flex flex-col justify-center px-5 md:px-12">
          <Reveal>
            <h1 className="font-display font-bold text-[clamp(36px,7vw,88px)] leading-[1.05] tracking-tight max-w-4xl">
              אתר שנראה כמו העסק שלכם באמת.
              <br />
              לא כמו תבנית.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 max-w-xl text-dim text-lg md:text-xl leading-relaxed">
              בניית אתרים מקצועית באמצעות AI ו-WordPress — מהיר, מדויק, ובנוי כדי להביא לקוחות, לא רק להיראות טוב.
            </p>
          </Reveal>
          <Reveal delay={180} className="mt-10">
            <Cta>קבלו הצעת מחיר תוך יום ←</Cta>
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32 border-t border-white/10">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-10">מה אני בונה</Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {HIGHLIGHTS.map((h, i) => (
              <Reveal key={h.title} delay={i * 60} className="border border-white/15 rounded-lg p-7">
                <div className="font-display font-medium text-xl mb-2">{h.title}</div>
                <div className="text-dim text-sm leading-relaxed">{h.text}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-white/10 bg-white/[0.015] text-center">
        <div className="container">
          <Reveal>
            <p className="font-display text-2xl md:text-3xl font-light mb-8 max-w-xl mx-auto">
              יש לכם רעיון לאתר? בואו נדבר עליו.
            </p>
          </Reveal>
          <Reveal delay={80}><Cta>לתיאום שיחה ←</Cta></Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32 border-t border-white/10">
        <div className="container grid md:grid-cols-3 gap-8">
          {PROOF.map((p, i) => (
            <Reveal key={p} delay={i * 60} className="text-center md:text-right">
              <div className="text-base leading-relaxed">{p}</div>
            </Reveal>
          ))}
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
