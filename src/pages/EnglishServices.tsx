import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { Breadcrumbs } from "@/components/Breadcrumbs"

const SUB_SERVICES = [
  {
    slug: "site-design",
    hubTitle: "Web Design",
    title: "Site Design",
    tagline: "Design that doesn't look like a template — a visual identity a competitor can't just copy without it looking off.",
    video: "/videos/raz-showreel-7.mp4",
  },
  {
    slug: "creative-development",
    hubTitle: "Web Design",
    title: "Creative Development",
    tagline: "For when the site needs to do something no plugin will do for you.",
    video: "/videos/raz-showreel-5.mp4",
  },
  {
    slug: "interactive-websites",
    hubTitle: "Web Design",
    title: "Interactive Websites",
    tagline: "A site visitors play with, not just scroll through.",
    video: "/videos/raz-showreel.mp4",
  },
  {
    slug: "ecommerce",
    hubTitle: "Web Design",
    title: "E-commerce",
    tagline: "A store that sells on its own, not just displays products.",
    video: "/videos/raz-showreel-4.mp4",
  },
  {
    slug: "landing-pages",
    hubTitle: "Web Design",
    title: "Landing Pages",
    tagline: "One page, one message, one call to action — built to sell.",
    video: "/videos/raz-showreel-2.mp4",
  },
  {
    slug: "wordpress-development",
    hubTitle: "Web Design",
    title: "WordPress Development",
    tagline: "When content-management flexibility is the requirement — the most proven platform in the world, done right.",
    video: "/videos/raz-showreel-5.mp4",
  },
  {
    slug: "custom-development",
    hubTitle: "Web Design",
    title: "Custom Development",
    tagline: "When performance and interactivity are the requirement — not a template, code built exactly for you.",
    video: "/videos/raz-showreel.mp4",
  },
  {
    slug: "ai-functionality",
    hubTitle: "Web Design",
    title: "AI-Powered Functionality",
    tagline: "Real AI capabilities inside the site — not a buzzword, a feature that actually works.",
    video: "/videos/raz-showreel-2.mp4",
  },
  {
    slug: "product-videos",
    hubTitle: "AI Content",
    title: "Product Videos",
    tagline: "Product footage in motion, from every angle, studio quality — without a studio shoot.",
    video: "/videos/raz-showreel-5.mp4",
  },
  {
    slug: "campaign-visuals",
    hubTitle: "AI Content",
    title: "Campaign Visuals",
    tagline: "Multiple visual variations for a campaign, without coordinating a new shoot for each one.",
    video: "/videos/raz-showreel-2.mp4",
  },
  {
    slug: "social-content",
    hubTitle: "AI Content",
    title: "Social Content",
    tagline: "An ongoing content pipeline, not a one-off project.",
    video: "/videos/raz-showreel-4.mp4",
  },
  {
    slug: "ai-photography",
    hubTitle: "AI Content",
    title: "AI Photography",
    tagline: "Professional product and brand photography without a studio shoot.",
    video: "/videos/raz-showreel.mp4",
  },
  {
    slug: "creative-direction",
    hubTitle: "AI Content",
    title: "Creative Direction",
    tagline: "The direction that turns an AI experiment into content that looks like a real campaign.",
    video: "/videos/raz-showreel-7.mp4",
  },
  {
    slug: "concept-development",
    hubTitle: "AI Content",
    title: "Concept Development",
    tagline: "Before producing anything — nailing down the idea that will actually work.",
    video: "/videos/raz-showreel-2.mp4",
  },
]

export function EnglishServices() {
  useDocumentMeta(
    "Services — RAZ",
    "Website building with AI and WordPress, and AI content creation — two areas of work, each with a full range of services."
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
            {SUB_SERVICES.map((sub, i) => (
              <Reveal key={sub.slug} delay={i * 60}>
                <Link
                  to="/en/contact"
                  className="group block rounded-xl overflow-hidden surface-raised hover:bg-white/[0.08] transition-colors h-full"
                >
                  <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                    <AutoVideo
                      src={sub.video}
                      className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">{sub.hubTitle}</div>
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
