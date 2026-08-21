import { useEffect } from "react"
import { Link } from "react-router-dom"
import { SUB_SERVICES_EN } from "@/lib/servicesEn"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { Breadcrumbs } from "@/components/Breadcrumbs"

export function EnglishServices() {
  useDocumentMeta(
    "Services · RAZ",
    "Website building with AI and WordPress, and AI content creation, two areas of work, each with a full range of services."
  )
  useHreflang("/services", "/en/services")

  useEffect(() => {
    document.documentElement.lang = "en"
    document.documentElement.dir = "ltr"
    return () => {
      document.documentElement.lang = "he"
      document.documentElement.dir = "rtl"
    }
  }, [])

  return (
    <div dir="ltr" className="text-left">
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute inset-0" aria-hidden="true">
          <AutoVideo src="/videos/raz-showreel.mp4" className="w-full h-full object-cover contrast-[1.05] brightness-[0.45]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
        </div>

        <div className="relative container text-left">
          <Breadcrumbs items={[{ label: "Home", to: "/en" }, { label: "Services" }]} className="mb-4" />
          <Reveal delay={40} className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            ( Services )
          </Reveal>
          <Reveal delay={70}>
            <h1 className="font-display font-black text-[clamp(32px,5.2vw,62px)] leading-[1.1] tracking-tight">
              What can we build?
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="pb-28 md:pb-40">
        <div className="container">
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUB_SERVICES_EN.map((sub, i) => (
              <Reveal key={sub.slug} delay={i * 60}>
                <Link
                  to={`/en/services/${sub.hubSlug}/${sub.slug}`}
                  className="group block rounded-xl overflow-hidden surface-raised hover:bg-white/[0.08] transition-colors h-full"
                >
                  <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                    <AutoVideo
                      src={sub.heroVideo}
                      className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">{sub.hubSlug === "web-design" ? "Web Design" : "AI Content"}</div>
                    <div className="font-display font-medium text-xl mb-2 group-hover:text-[#D1FE17] transition-colors">
                      {sub.title}
                    </div>
                    <p className="text-dim text-sm leading-relaxed">{sub.tagline}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
