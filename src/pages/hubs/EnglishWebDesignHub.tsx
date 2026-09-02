import { useEffect } from "react"
import { Link } from "react-router-dom"
import { SUB_SERVICES_EN, findServiceHubEn } from "@/lib/servicesEn"
import { useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { Breadcrumbs } from "@/components/Breadcrumbs"

export function EnglishWebDesignHub() {
  const items = SUB_SERVICES_EN.filter((s) => s.hubSlug === "web-design")
  const { projects } = useProjects()
  const hub = findServiceHubEn("web-design")!

  useDocumentMeta(`${hub.title} · RAZ`, hub.heroDescription)
  useWhatsAppMessage(`Hi, I'm interested in ${hub.title}.`)

  useEffect(() => {
    document.documentElement.lang = "en"
    document.documentElement.dir = "ltr"
    return () => {
      document.documentElement.lang = "he"
      document.documentElement.dir = "rtl"
    }
  }, [])

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: hub.title,
    description: hub.heroDescription,
    provider: { "@type": "Person", name: "Raz Avramov" },
    areaServed: "IL",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: hub.title,
      itemListElement: items.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.tagline },
      })),
    },
  }

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: `https://madebyraz.co.il/en/services/${s.hubSlug}/${s.slug}`,
    })),
  }

  return (
    <div dir="ltr" className="text-left">
      <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>

      <section className="pt-32 pb-16 md:pt-40">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", to: "/en" }, { label: "Services", to: "/en/services" }, { label: hub.title }]} />
          <Reveal>
            <h1 className="font-display font-black text-[clamp(36px,6.6vw,80px)] leading-[1.05] tracking-tight max-w-3xl">
              {hub.tagline}
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 text-lg text-dim leading-relaxed max-w-2xl whitespace-pre-line">{hub.heroDescription}</p>
          </Reveal>
          <Reveal delay={160} className="mt-8">
            <Link to="/en/contact" className="inline-block font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform">
              {hub.ctaLabel} →
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
                  to={`/en/services/${s.hubSlug}/${s.slug}`}
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
            <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-8">Work</Reveal>
            <div className="grid md:grid-cols-3 gap-4">
              {projects.slice(0, 3).map((p, i) => (
                <Reveal key={p.slug} delay={i * 60}>
                  <Link to={`/en/work/${p.slug}`} className="block relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900 group">
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
            <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer max-w-xl mx-auto mb-8">
              Have a website project? Let's talk.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <Link to="/en/contact" className="inline-block font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform">
              {hub.ctaLabel} →
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
