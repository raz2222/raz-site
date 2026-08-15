import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"

export function English() {
  useDocumentMeta(
    "RAZ — Creative Developer, Israel",
    "Raz Avramov is a creative developer working at the intersection of design, technology and AI — websites, digital experiences and AI-powered visual production."
  )

  return (
    <section dir="ltr" className="pt-32 pb-28 md:pt-40 md:pb-40 text-left">
      <div className="container max-w-2xl">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( English )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-bold text-[clamp(30px,5.5vw,60px)] leading-[1.1] tracking-tight mb-8">
            Hi, I'm Raz.
          </h1>
        </Reveal>
        <Reveal delay={100} className="flex flex-col gap-5 text-lg leading-relaxed text-foreground/85">
          <p>
            I'm a creative developer based in Israel, working at the intersection of design, technology
            and AI. I build websites, digital experiences and AI-powered visual content — commercials,
            product films and campaign visuals — for brands that want to stand out.
          </p>
          <p>
            The full site is currently in Hebrew, since that's where most of my clients are. If you'd
            like to talk about a project in English, reach out directly and we'll go from there.
          </p>
        </Reveal>
        <Reveal delay={200} className="mt-10 flex flex-wrap gap-4">
          <a
            href="mailto:razavramov2@gmail.com"
            className="inline-block font-mono text-sm uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
          >
            Email me →
          </a>
          <a
            href="https://wa.me/972506944443"
            target="_blank"
            rel="noreferrer"
            className="inline-block font-mono text-sm uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
          >
            WhatsApp →
          </a>
        </Reveal>
        <Reveal delay={260} className="mt-10">
          <Link to="/" className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 text-dim">
            ← חזרה לאתר בעברית
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
