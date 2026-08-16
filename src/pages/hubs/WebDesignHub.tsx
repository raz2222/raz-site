import { Link } from "react-router-dom"
import { subServices } from "@/lib/subServices"
import { serviceHubs } from "@/lib/serviceHubs"
import { useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"

const hub = serviceHubs.find((h) => h.slug === "web-design")!
const items = subServices.filter((s) => s.hubSlug === "web-design")

export function WebDesignHub() {
  useDocumentMeta(`${hub.title} — RAZ`, hub.heroDescription)
  useWhatsAppMessage(`היי, אני מתעניין בשירותי ${hub.title}.`)
  const { projects } = useProjects()

  return (
    <>
      <section className="pt-32 pb-16 md:pt-40">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            <Link to="/services" className="hover:text-foreground transition-colors">שירותים</Link> / {hub.title}
          </Reveal>
          <Reveal>
            <h1 className="font-display font-black text-[clamp(32px,6vw,72px)] leading-[1.05] tracking-tight max-w-3xl">
              {hub.tagline}
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 text-lg text-dim leading-relaxed max-w-2xl">{hub.heroDescription}</p>
          </Reveal>
          <Reveal delay={160} className="mt-8">
            <Link to="/contact" className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform">
              {hub.ctaLabel} ←
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((s, i) => (
              <Reveal key={s.slug} delay={Math.min(i * 30, 200)}>
                <Link
                  to={`/services/${s.hubSlug}/${s.slug}`}
                  className="group block border border-white/15 rounded-lg p-6 h-full hover:border-[#D1FE17] transition-colors"
                >
                  <div className="font-mono text-xs text-dim mb-3">{String(i + 1).padStart(2, "0")}</div>
                  <div className="font-display font-medium text-lg mb-2 group-hover:text-[#D1FE17] transition-colors">{s.title}</div>
                  <div className="text-dim text-sm leading-relaxed">{s.tagline}</div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="py-16 border-t border-white/10">
          <div className="container">
            <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-8">עבודות</Reveal>
            <div className="grid md:grid-cols-3 gap-4">
              {projects.slice(0, 3).map((p, i) => (
                <Reveal key={p.slug} delay={i * 60}>
                  <Link to={`/work/${p.slug}`} className="block relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900 group">
                    {p.video && <AutoVideo src={p.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 right-4 left-4 font-display font-medium text-white">{p.title}</div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 border-t border-white/10 text-center">
        <div className="container">
          <Reveal>
            <h2 className="font-display font-bold text-[clamp(26px,4.4vw,48px)] leading-[1.15] tracking-tight max-w-xl mx-auto mb-8">
              יש לכם פרויקט אתר? בואו נדבר.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <Link to="/contact" className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform">
              {hub.ctaLabel} ←
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
