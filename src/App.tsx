import { Nav } from "@/components/Nav"
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
import { Footer } from "@/components/Footer"

function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Positioning />
        <SelectedWork />
        <WhatIDo />
        <FeaturedCaseStudy />
        <Process />
        <Experiments />
        <About />
        <Modernization />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}

export default App
