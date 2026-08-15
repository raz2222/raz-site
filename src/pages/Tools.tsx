import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"

const CATEGORIES = [
  {
    title: "פיתוח ו-Vibe Coding",
    items: ["Claude", "React", "TypeScript", "Tailwind CSS", "REST API"],
  },
  {
    title: "WordPress",
    items: ["WordPress", "Elementor / Elementor Pro", "WooCommerce", "ACF"],
  },
  {
    title: "יצירת תמונות AI",
    items: ["Higgsfield", "כלי ג'נרציית תמונות נוספים לפי צורך הפרויקט"],
  },
  {
    title: "יצירת וידאו AI",
    items: ["Higgsfield", "Kling", "Veo"],
  },
  {
    title: "אוטומציה ואינטגרציות",
    items: ["Supabase", "Google Sheets", "WhatsApp Business API"],
  },
  {
    title: "עיצוב ותכנון",
    items: ["Figma", "ChatGPT"],
  },
]

export function Tools() {
  useDocumentMeta(
    "כלים וטכנולוגיות — RAZ",
    "הכלים שבהם אני משתמש בפועל — פיתוח, WordPress, יצירת תמונות ווידאו AI, אוטומציה — מקוטלגים לפי קטגוריה."
  )

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( כלים )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(28px,4.6vw,54px)] leading-[1.15] tracking-tight max-w-2xl">
            הכלים שבהם אני באמת עובד.
          </h1>
        </Reveal>
        <Reveal delay={80} className="mt-6 text-dim text-base md:text-lg max-w-xl">
          לא רשימת לוגואים לרושם — רק כלים שבשימוש יומיומי בפרויקטים אמיתיים.
        </Reveal>

        <div className="mt-20 grid md:grid-cols-2 gap-x-14 gap-y-14">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.title} delay={i * 60} className="border-t border-white/10 pt-8">
              <h2 className="font-mono text-xs uppercase tracking-wide text-dim mb-4">{c.title}</h2>
              <div className="flex flex-wrap gap-2">
                {c.items.map((item) => (
                  <span key={item} className="border border-white/30 rounded-full px-4 py-1.5 text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
