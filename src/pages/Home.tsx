import { Hero } from "@/components/Hero"
import { Positioning } from "@/components/Positioning"
import { SelectedWork } from "@/components/SelectedWork"
import { WhatIDo } from "@/components/WhatIDo"
import { FeaturedCaseStudy } from "@/components/FeaturedCaseStudy"
import { Process } from "@/components/Process"
import { Experiments } from "@/components/Experiments"
import { About } from "@/components/About"
import { Modernization } from "@/components/Modernization"
import { FinalCTA } from "@/components/FinalCTA"
import { useHreflang } from "@/hooks/useHreflang"

export function Home() {
  useHreflang("/", "/en")

  return (
    <>
      <Hero />
      <WhatIDo />
      <Positioning />
      <SelectedWork />
      <FeaturedCaseStudy />
      <Process />
      <About />
      <Experiments />
      <Modernization />
      <FinalCTA />
    </>
  )
}
