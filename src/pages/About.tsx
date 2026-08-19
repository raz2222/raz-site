import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"
import { PageHeader } from "@/components/PageHeader"
import { useSiteContent } from "@/hooks/useSiteContent"
import { ABOUT_PAGE_DEFAULT, PROFILE_DEFAULT } from "@/lib/siteContentDefaults"

export function About() {
  useDocumentMeta(
    "עליי — RAZ",
    "רז אברמוב — מפתח קריאייטיב שעובד בצומת שבין עיצוב, טכנולוגיה ו-AI."
  )
  const { content: about } = useSiteContent("about_page", ABOUT_PAGE_DEFAULT)
  const { content: profile } = useSiteContent("shared_profile", PROFILE_DEFAULT)

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "בית", to: "/" }, { label: "עליי" }]}
        eyebrow="( עליי )"
        title={about.heading}
      />
      <section className="pb-28 md:pb-40">
        <div className="container">
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-14 items-start mb-24">
            <Reveal>
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900">
                <img
                  src="/images/raz-portrait.jpeg"
                  alt="רז אברמוב"
                  className="absolute inset-0 w-full h-full object-cover grayscale"
                />
              </div>
            </Reveal>
            <div>
              <Reveal>
                <p className="text-dim text-base md:text-lg leading-relaxed mb-4">
                  {about.paragraph1}
                </p>
                <p className="text-dim text-base md:text-lg leading-relaxed">
                  {about.paragraph2}
                </p>
              </Reveal>
            </div>
          </div>

        <Reveal className="max-w-2xl mb-24">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">פילוסופיה</div>
          <p className="text-xl md:text-2xl font-display font-light leading-snug">
            {about.philosophy}
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-14">
          <Reveal>
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">יכולות</div>
            <div className="flex flex-wrap gap-2">
              {profile.capabilities.map((c) => (
                <span key={c} className="border border-white/15 rounded-full px-4 py-1.5 text-sm">
                  {c}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">כלים</div>
            <div className="font-mono text-[13px] text-dim leading-relaxed">
              {profile.tools.join(" · ")}
            </div>
          </Reveal>
        </div>
        </div>
      </section>
    </>
  )
}
