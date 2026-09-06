import { Hero } from "@/components/Hero"
import { Positioning } from "@/components/Positioning"
import { SelectedWork } from "@/components/SelectedWork"
import { WhatIDo } from "@/components/WhatIDo"
import { AIExperienceTeaser } from "@/components/AIExperienceTeaser"
import { AIVideoOffer } from "@/components/AIVideoOffer"
import { TrustProof } from "@/components/TrustProof"
import { FeaturedCaseStudy } from "@/components/FeaturedCaseStudy"
import { Process } from "@/components/Process"
import { Experiments } from "@/components/Experiments"
import { About } from "@/components/About"
import { Modernization } from "@/components/Modernization"
import { Testimonials } from "@/components/Testimonials"
import { HomeFaq } from "@/components/HomeFaq"
import { FinalCTA } from "@/components/FinalCTA"
import { useHreflang } from "@/hooks/useHreflang"
import { usePageSeo } from "@/hooks/usePageSeo"

// Experiments (the AI showreel) sits right after the Hero on purpose — it's the strongest
// "show, don't tell" proof of range and needs to land before a visitor decides to keep scrolling.
export function Home() {
  // The homepage is the one page whose <head> ships in index.html, so this
  // starts out setting the title it already has. It is here so an edit in
  // /admin/pages moves the tab as well as the prerendered head.
  usePageSeo("seo_home")
  useHreflang("/", "/en")

  return (
    <>
      <Hero />
      <Experiments />
      <AIVideoOffer />
      <WhatIDo />
      <AIExperienceTeaser />
      <Positioning />
      <TrustProof />
      <SelectedWork />
      <FeaturedCaseStudy />
      <Process />
      <About />
      <Modernization />
      <Testimonials />
      <HomeFaq />
      <FinalCTA />
    </>
  )
}
