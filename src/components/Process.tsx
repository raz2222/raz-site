import { Reveal } from "./Reveal"

const STEPS = [
  { n: "01", title: "גילוי", text: "מבינים את העסק, המטרה והקהל." },
  { n: "02", title: "כיוון", text: "מגדירים את הקונספט והשפה הוויזואלית." },
  { n: "03", title: "בנייה", text: "עיצוב + פיתוח + הפקת AI." },
  { n: "04", title: "השקה", text: "בדיקות, ליטוש ועלייה לאוויר." },
]

export function Process() {
  return (
    <section className="py-28 md:py-40">
      <div className="container">
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight">
            מרעיון להשקה.
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="font-mono text-xs text-dim mb-4">{s.n}</div>
              <div className="font-display font-medium text-xl mb-2">{s.title}</div>
              <p className="text-dim text-sm leading-relaxed">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
