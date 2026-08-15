import { Link, useParams } from "react-router-dom"
import { guides } from "@/lib/guides"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"

export function GuideArticle() {
  const { slug } = useParams()
  const guide = guides.find((g) => g.slug === slug)

  useDocumentMeta(
    guide ? `${guide.title} — RAZ` : "מדריך — RAZ",
    guide?.excerpt
  )

  if (!guide) {
    return (
      <div className="pt-40 pb-40 container">
        <p className="font-mono text-sm text-dim uppercase">המדריך לא נמצא.</p>
        <Link to="/guides" className="inline-block mt-6 underline underline-offset-4 text-sm">
          → חזרה למדריכים
        </Link>
      </div>
    )
  }

  const currentIndex = guides.findIndex((g) => g.slug === guide.slug)
  const next = guides[(currentIndex + 1) % guides.length]

  return (
    <>
      <section className="pt-32 pb-10 md:pt-40">
        <div className="container max-w-3xl">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            {guide.category} · {guide.readTime}
          </Reveal>
          <Reveal>
            <h1 className="font-display font-bold text-[clamp(28px,5vw,52px)] leading-[1.1] tracking-tight">
              {guide.title}
            </h1>
          </Reveal>
          <Reveal delay={100} className="mt-6 text-lg text-dim leading-relaxed">
            {guide.excerpt}
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container max-w-3xl flex flex-col gap-14">
          {guide.sections.map((s, i) => (
            <Reveal key={s.heading} delay={i * 30} className="border-t border-white/10 pt-8">
              <h2 className="font-display font-medium text-xl md:text-2xl mb-4">{s.heading}</h2>
              <div className="flex flex-col gap-4">
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="text-base md:text-lg leading-relaxed text-foreground/85">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          ))}

          <div className="border-t border-white/10 pt-8">
            <Link
              to="/contact"
              className="inline-block font-mono text-sm uppercase tracking-wide border border-white/20 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
            >
              רוצים לדבר על הפרויקט שלכם? ←
            </Link>
          </div>
        </div>
      </section>

      <Link
        to={`/guides/${next.slug}`}
        className="block border-t border-white/10 py-16 md:py-24 hover:bg-white/[0.02] transition-colors"
      >
        <div className="container max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">
            המדריך הבא
          </div>
          <div className="font-display font-medium text-2xl md:text-4xl">← {next.title}</div>
        </div>
      </Link>
    </>
  )
}
