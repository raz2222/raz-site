import { useEffect } from "react"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { AutoVideo } from "@/components/AutoVideo"
import { Reveal } from "@/components/Reveal"
import { PageHeader } from "@/components/PageHeader"

const EXPERIMENTS_EN = [
  { title: "Cyberpunk Film", video: "/videos/raz-showreel-4.mp4" },
  { title: "Car Animation", video: "/videos/raz-showreel.mp4" },
  { title: "AI Characters", video: "/videos/raz-showreel-7.mp4" },
  { title: "Interactive Interface", video: "/videos/raz-showreel-5.mp4" },
  { title: "Motion Study", video: "/videos/raz-showreel-2.mp4" },
  { title: "Strange Website", video: "/videos/no-address.mp4" },
]

export function EnglishExperimentsIndex() {
  useDocumentMeta(
    "Experiments — RAZ",
    "Things Raz Avramov makes when nobody asks — films, strange websites, characters, and ideas in progress."
  )
  useHreflang("/experiments", "/en/experiments")

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
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/en" }, { label: "Experiments" }]}
        eyebrow="( Experiments )"
        title="Things I make when nobody asks."
      />
      <section className="pb-28 md:pb-40">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EXPERIMENTS_EN.map((e, i) => (
              <Reveal
                key={e.title}
                delay={i * 60}
                className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 group"
              >
                <AutoVideo
                  src={e.video}
                  className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 font-mono text-[11px] uppercase tracking-wide text-white/70">
                  {e.title}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
