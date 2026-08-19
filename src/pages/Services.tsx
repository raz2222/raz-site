import { Link } from "react-router-dom"
import { useServiceHubs, useSubServices } from "@/hooks/useContent"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"
import { PageHeader } from "@/components/PageHeader"
import { AutoVideo } from "@/components/AutoVideo"

export function Services() {
  useDocumentMeta(
    "שירותים — RAZ",
    "בניית אתרים באמצעות AI ו-WordPress, והפקת תוכן ויזואלי AI — שני תחומי עבודה, כל אחד עם עמוד Hub מלא."
  )
  const { serviceHubs } = useServiceHubs()
  const { subServices } = useSubServices()

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "בית", to: "/" }, { label: "שירותים" }]}
        eyebrow="( שירותים )"
        title="מה אפשר לבנות?"
      />
      <section className="pb-28 md:pb-40">
        <div className="container">
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subServices.map((sub, i) => {
              const hub = serviceHubs.find((h) => h.slug === sub.hub_slug)
              return (
                <Reveal key={sub.slug} delay={i * 60}>
                  <Link
                    to={`/services/${sub.hub_slug}/${sub.slug}`}
                    className="group block rounded-xl overflow-hidden surface-raised hover:bg-white/[0.08] transition-colors h-full"
                  >
                    <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                      {sub.hero_video ? (
                        <AutoVideo
                          src={sub.hero_video}
                          className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950" />
                      )}
                    </div>
                    <div className="p-5">
                      {hub && (
                        <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">{hub.title}</div>
                      )}
                      <div className="font-display font-medium text-xl mb-2 group-hover:text-[#D1FE17] transition-colors">
                        {sub.title}
                      </div>
                      <p className="text-dim text-sm leading-relaxed">{sub.tagline}</p>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
